import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';
import 'package:provider/provider.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import '../api/api_client.dart';
import '../api/models.dart';
import '../theme.dart';
import 'prescription_screens.dart';

/// 1:1 WebRTC video/audio call. Media is peer-to-peer; the backend only relays
/// SDP/ICE signaling over the /ws/signal WebSocket. Mirrors the web call screen.
class CallScreen extends StatefulWidget {
  const CallScreen({super.key, required this.consultation});
  final ApiConsultation consultation;

  @override
  State<CallScreen> createState() => _CallScreenState();
}

enum _Phase { connecting, waiting, connected, ended, error }

class _CallScreenState extends State<CallScreen> {
  final _local = RTCVideoRenderer();
  final _remote = RTCVideoRenderer();
  RTCPeerConnection? _pc;
  MediaStream? _localStream;
  WebSocketChannel? _ws;

  _Phase _phase = _Phase.connecting;
  String _note = '';
  bool _micOn = true;
  bool _camOn = true;
  bool _remoteReady = false;
  bool _remoteDescSet = false;
  final List<RTCIceCandidate> _pendingIce = [];
  bool _disposed = false;

  ApiPrescription? _rx;      // current prescription for this consultation
  bool _rxAutoShown = false; // patient: only auto-open the sheet once

  ApiConsultation get c => widget.consultation;

  @override
  void initState() {
    super.initState();
    _start();
  }

  /// Build the signaling WebSocket URL from the API base so it always targets the
  /// right host (the backend's configured signalingUrl may say localhost).
  String _signalingUrl(String token, String room) {
    var base = kApiBase; // e.g. http://host:8080/api
    base = base.replaceFirst(RegExp(r'^http'), 'ws');
    base = base.replaceFirst(RegExp(r'/api/?$'), '');
    return '$base/ws/signal?token=${Uri.encodeComponent(token)}&room=${Uri.encodeComponent(room)}';
  }

  Future<void> _start() async {
    final api = context.read<ApiClient>();
    try {
      final session = await api.joinConsultation(c.id); // (re)activate + fresh ICE
      if (_disposed) return;

      await _local.initialize();
      await _remote.initialize();

      // Local media (camera+mic for video calls, mic only for audio).
      try {
        _localStream = await navigator.mediaDevices.getUserMedia({
          'audio': true,
          'video': session.isVideo ? {'facingMode': 'user'} : false,
        });
        _local.srcObject = _localStream;
      } catch (_) {
        _note = 'Camera/microphone unavailable — others may not see or hear you.';
      }
      if (_disposed) return;

      final config = {
        'iceServers': session.iceServers.map((s) => s.toRtc()).toList(),
        'sdpSemantics': 'unified-plan',
      };
      final pc = await createPeerConnection(config);
      _pc = pc;

      _localStream?.getTracks().forEach((t) => pc.addTrack(t, _localStream!));

      pc.onTrack = (RTCTrackEvent e) {
        if (e.streams.isNotEmpty) {
          _remote.srcObject = e.streams[0];
          if (mounted) setState(() { _remoteReady = true; _phase = _Phase.connected; });
        }
      };
      pc.onIceCandidate = (RTCIceCandidate cand) {
        _sendSignal({
          'type': 'ice-candidate',
          'candidate': {
            'candidate': cand.candidate,
            'sdpMid': cand.sdpMid,
            'sdpMLineIndex': cand.sdpMLineIndex,
          },
        });
      };
      pc.onConnectionState = (s) {
        if (s == RTCPeerConnectionState.RTCPeerConnectionStateFailed) {
          _setNote('Connection failed — you may be behind a strict NAT/firewall (a TURN server would help).');
        }
      };

      _openSocket(token: api.accessToken ?? '', room: session.roomCode);
      _loadRx(); // pick up any prescription already written (e.g. on rejoin)
      if (mounted) setState(() => _phase = _Phase.waiting);
    } catch (e) {
      _setPhase(_Phase.error, note: 'Could not join this consultation.');
    }
  }

  void _openSocket({required String token, required String room}) {
    final ch = WebSocketChannel.connect(Uri.parse(_signalingUrl(token, room)));
    _ws = ch;
    ch.stream.listen(
      (data) => _handleSignal(jsonDecode(data as String) as Map<String, dynamic>),
      onError: (_) {},
      onDone: () {},
    );
  }

  void _sendSignal(Map<String, dynamic> msg) {
    try {
      _ws?.sink.add(jsonEncode(msg));
    } catch (_) {}
  }

  Future<void> _handleSignal(Map<String, dynamic> msg) async {
    final pc = _pc;
    if (pc == null) return;
    switch (msg['type']) {
      case 'peer-joined': // we were here first → we make the offer
        final offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        _sendSignal({'type': 'offer', 'sdp': {'type': offer.type, 'sdp': offer.sdp}});
        break;
      case 'offer':
        final sdp = msg['sdp'] as Map<String, dynamic>;
        await pc.setRemoteDescription(RTCSessionDescription(sdp['sdp'] as String, sdp['type'] as String));
        _remoteDescSet = true;
        await _flushIce();
        final answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        _sendSignal({'type': 'answer', 'sdp': {'type': answer.type, 'sdp': answer.sdp}});
        break;
      case 'answer':
        final sdp = msg['sdp'] as Map<String, dynamic>;
        await pc.setRemoteDescription(RTCSessionDescription(sdp['sdp'] as String, sdp['type'] as String));
        _remoteDescSet = true;
        await _flushIce();
        break;
      case 'ice-candidate':
        final cm = msg['candidate'] as Map<String, dynamic>;
        final cand = RTCIceCandidate(cm['candidate'] as String?, cm['sdpMid'] as String?, cm['sdpMLineIndex'] as int?);
        if (_remoteDescSet) {
          await pc.addCandidate(cand);
        } else {
          _pendingIce.add(cand);
        }
        break;
      case 'peer-left':
        _setNote('The other participant left the call.');
        break;
      case 'prescription': // the doctor just saved one — fetch and show it live
        _loadRx(popupForPatient: true);
        break;
    }
  }

  Future<void> _loadRx({bool popupForPatient = false}) async {
    try {
      final rx = await context.read<ApiClient>().getPrescription(c.id);
      if (!mounted || rx == null) return;
      setState(() => _rx = rx);
      if (popupForPatient && !c.selfIsDoctor && !_rxAutoShown) {
        _rxAutoShown = true;
        showPrescriptionView(context, rx);
      }
    } catch (_) {/* ignore — the Rx button still lets them open it */}
  }

  Future<void> _prescribe() async {
    final draft = await showPrescribeSheet(context, _rx);
    if (draft == null || !mounted) return;
    try {
      final saved = await context.read<ApiClient>().savePrescription(c.id, advice: draft.advice, items: draft.items);
      if (!mounted) return;
      setState(() => _rx = saved);
      _sendSignal({'type': 'prescription'}); // nudge the patient to fetch it live
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Prescription sent to the patient')));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Could not save prescription: $e')));
    }
  }

  void _viewRx() {
    if (_rx != null) showPrescriptionView(context, _rx!);
  }

  Future<void> _flushIce() async {
    for (final cand in _pendingIce) {
      try { await _pc?.addCandidate(cand); } catch (_) {}
    }
    _pendingIce.clear();
  }

  void _setNote(String n) { if (mounted) setState(() => _note = n); }
  void _setPhase(_Phase p, {String note = ''}) { if (mounted) setState(() { _phase = p; if (note.isNotEmpty) _note = note; }); }

  void _toggleMic() {
    final t = _localStream?.getAudioTracks();
    if (t != null && t.isNotEmpty) { t.first.enabled = !t.first.enabled; setState(() => _micOn = t.first.enabled); }
  }

  void _toggleCam() {
    final t = _localStream?.getVideoTracks();
    if (t != null && t.isNotEmpty) { t.first.enabled = !t.first.enabled; setState(() => _camOn = t.first.enabled); }
  }

  Future<void> _hangUp() async {
    final api = context.read<ApiClient>();
    _teardown();
    try { await api.endConsultation(c.id); } catch (_) {}
    if (mounted) Navigator.of(context).maybePop();
  }

  void _teardown() {
    try { _ws?.sink.close(); } catch (_) {}
    _localStream?.getTracks().forEach((t) => t.stop());
    _pc?.close();
  }

  @override
  void dispose() {
    _disposed = true;
    _teardown();
    _local.dispose();
    _remote.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final other = c.selfIsDoctor ? c.patientName : 'Dr. ${c.doctorName}';
    final statusText = switch (_phase) {
      _Phase.connecting => 'Setting up your camera…',
      _Phase.waiting => 'Waiting for $other to join…',
      _Phase.connected => 'Connected with $other',
      _Phase.ended => 'Call ended',
      _Phase.error => _note.isEmpty ? 'Something went wrong' : _note,
    };

    return Scaffold(
      backgroundColor: const Color(0xFF0B1F22),
      body: SafeArea(
        child: Stack(
          children: [
            // Remote video / placeholder
            Positioned.fill(
              child: _remoteReady
                  ? RTCVideoView(_remote, objectFit: RTCVideoViewObjectFit.RTCVideoViewObjectFitCover)
                  : Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 84, height: 84,
                            decoration: const BoxDecoration(gradient: kGradient, shape: BoxShape.circle),
                            child: const Icon(Icons.person, color: Colors.white, size: 40),
                          ),
                          const SizedBox(height: 14),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 32),
                            child: Text(statusText, textAlign: TextAlign.center, style: const TextStyle(color: Color(0xFFCFE6E1), fontSize: 15)),
                          ),
                        ],
                      ),
                    ),
            ),
            // Local self-view (PiP)
            Positioned(
              right: 16, top: 16,
              child: Container(
                width: 116, height: 168,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: Colors.white54, width: 2),
                  color: const Color(0xFF0B1F22),
                ),
                clipBehavior: Clip.antiAlias,
                child: (_camOn && c.isVideo)
                    ? RTCVideoView(_local, mirror: true, objectFit: RTCVideoViewObjectFit.RTCVideoViewObjectFitCover)
                    : const Center(child: Text('Camera off', style: TextStyle(color: Color(0xFFCFE6E1), fontSize: 12))),
              ),
            ),
            // Top status bar
            Positioned(
              left: 0, right: 0, top: 12,
              child: Center(child: Text(_phase == _Phase.connected ? statusText : (c.isVideo ? 'Video consultation' : 'Audio consultation'),
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 15))),
            ),
            if (_note.isNotEmpty && _phase == _Phase.connected)
              Positioned(left: 16, right: 16, top: 44, child: Text(_note, textAlign: TextAlign.center, style: const TextStyle(color: Color(0xFFCFE6E1), fontSize: 12))),
            // Prescription control: doctor writes; patient views once one exists.
            if (c.selfIsDoctor || _rx != null)
              Positioned(
                left: 12, top: 8,
                child: _RxButton(
                  label: c.selfIsDoctor ? 'Prescribe' : 'Prescription',
                  icon: Icons.medication_outlined,
                  highlight: !c.selfIsDoctor && _rx != null,
                  onTap: c.selfIsDoctor ? _prescribe : _viewRx,
                ),
              ),
            // Controls
            Positioned(
              left: 0, right: 0, bottom: 24,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _CircleBtn(icon: _micOn ? Icons.mic : Icons.mic_off, active: _micOn, onTap: _toggleMic),
                  if (c.isVideo) ...[
                    const SizedBox(width: 18),
                    _CircleBtn(icon: _camOn ? Icons.videocam : Icons.videocam_off, active: _camOn, onTap: _toggleCam),
                  ],
                  const SizedBox(width: 18),
                  _CircleBtn(icon: Icons.call_end, active: false, danger: true, onTap: _hangUp),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RxButton extends StatelessWidget {
  const _RxButton({required this.label, required this.icon, required this.onTap, this.highlight = false});
  final String label;
  final IconData icon;
  final VoidCallback onTap;
  final bool highlight;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(999),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
          decoration: BoxDecoration(
            color: highlight ? AppColors.teal500 : Colors.white24,
            borderRadius: BorderRadius.circular(999),
            border: Border.all(color: Colors.white38),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, color: Colors.white, size: 18),
              const SizedBox(width: 7),
              Text(label, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13)),
            ],
          ),
        ),
      ),
    );
  }
}

class _CircleBtn extends StatelessWidget {
  const _CircleBtn({required this.icon, required this.active, required this.onTap, this.danger = false});
  final IconData icon;
  final bool active;
  final bool danger;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final bg = danger ? AppColors.major : (active ? Colors.white24 : Colors.white10);
    return InkResponse(
      onTap: onTap,
      child: Container(
        width: 60, height: 60,
        decoration: BoxDecoration(color: bg, shape: BoxShape.circle),
        child: Icon(icon, color: Colors.white, size: 26),
      ),
    );
  }
}
