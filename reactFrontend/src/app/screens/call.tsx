import { useEffect, useRef, useState } from 'react'
import { Shell } from '../AppShell'
import { Card, Button } from '../ui'
import { IconPhone, IconClose, IconStethoscope, IconUser } from '../icons'
import { consultationApi, doctorApi } from '../../api/services'
import { tokenStore } from '../../api/client'
import type { ConsultationResponse, DoctorResponse } from '../../api/types'

/** Read a query param out of the hash, e.g. `#/call?id=abc` -> id. */
export function hashParam(name: string): string | null {
  const q = location.hash.split('?')[1]
  if (!q) return null
  return new URLSearchParams(q).get(name)
}

type Phase = 'loading' | 'connecting' | 'waiting' | 'connected' | 'ended' | 'error'

/* ============================ Call room (WebRTC) ============================ */

export function CallScreen() {
  const id = hashParam('id')
  const [session, setSession] = useState<ConsultationResponse | null>(null)
  const [phase, setPhase] = useState<Phase>('loading')
  const [note, setNote] = useState<string>('')
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [localStreamState, setLocalStreamState] = useState<MediaStream | null>(null)
  const [remoteStreamState, setRemoteStreamState] = useState<MediaStream | null>(null)

  const localVideo = useRef<HTMLVideoElement>(null)
  const remoteVideo = useRef<HTMLVideoElement>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const localStream = useRef<MediaStream | null>(null)
  const pendingIce = useRef<RTCIceCandidateInit[]>([])
  const remoteSet = useRef(false)

  useEffect(() => {
    if (!id) { setPhase('error'); setNote('No consultation id in the link.'); return }

    let cancelled = false

    async function start() {
      try {
        const s = await consultationApi.join(id!)
        if (cancelled) return
        setSession(s)
        setPhase('connecting')

        // Local media — audio always; video only for VIDEO calls.
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: s.callType === 'VIDEO',
          })
          localStream.current = stream
          setLocalStreamState(stream)
        } catch {
          setNote('Camera/microphone unavailable — others may not see or hear you.')
        }

        const iceServers: RTCIceServer[] = s.iceServers.map((srv) => ({
          urls: srv.urls,
          ...(srv.username ? { username: srv.username } : {}),
          ...(srv.credential ? { credential: srv.credential } : {}),
        }))
        const pc = new RTCPeerConnection({ iceServers })
        pcRef.current = pc
        localStream.current?.getTracks().forEach((t) => pc.addTrack(t, localStream.current!))

        pc.ontrack = (e) => {
          setRemoteStreamState(e.streams[0])
          setPhase('connected')
        }
        pc.onicecandidate = (e) => {
          if (e.candidate) sendSignal({ type: 'ice-candidate', candidate: e.candidate.toJSON() })
        }
        // Diagnostics — visible in the browser console during a call.
        pc.oniceconnectionstatechange = () => console.log('[call] iceConnectionState:', pc.iceConnectionState)
        pc.onconnectionstatechange = () => {
          console.log('[call] connectionState:', pc.connectionState)
          if (pc.connectionState === 'failed') {
            setNote('Connection failed — you may be behind a strict NAT/firewall (a TURN server would help).')
          } else if (pc.connectionState === 'disconnected') {
            setNote('Connection interrupted — trying to recover…')
          }
        }

        openSocket(s)
      } catch (e) {
        if (!cancelled) { setPhase('error'); setNote('Could not join this consultation.') }
      }
    }

    function openSocket(s: ConsultationResponse) {
      const url = `${s.signalingUrl}?token=${encodeURIComponent(tokenStore.access ?? '')}&room=${encodeURIComponent(s.roomCode)}`
      const ws = new WebSocket(url)
      wsRef.current = ws
      ws.onopen = () => setPhase((p) => (p === 'connected' ? p : 'waiting'))
      ws.onclose = () => { /* peer-left / end handles UI */ }
      ws.onmessage = (ev) => handleSignal(JSON.parse(ev.data))
    }

    function sendSignal(msg: unknown) {
      const ws = wsRef.current
      if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg))
    }

    async function handleSignal(msg: any) {
      const pc = pcRef.current
      if (!pc) return
      switch (msg.type) {
        case 'peer-joined': {
          // We were here first → we create the offer.
          const offer = await pc.createOffer()
          await pc.setLocalDescription(offer)
          sendSignal({ type: 'offer', sdp: offer })
          break
        }
        case 'offer': {
          await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
          remoteSet.current = true
          await flushIce(pc)
          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)
          sendSignal({ type: 'answer', sdp: answer })
          break
        }
        case 'answer': {
          await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
          remoteSet.current = true
          await flushIce(pc)
          break
        }
        case 'ice-candidate': {
          if (remoteSet.current) await pc.addIceCandidate(msg.candidate).catch(() => {})
          else pendingIce.current.push(msg.candidate)
          break
        }
        case 'peer-left': {
          setNote('The other participant left the call.')
          break
        }
      }
    }

    async function flushIce(pc: RTCPeerConnection) {
      for (const c of pendingIce.current) await pc.addIceCandidate(c).catch(() => {})
      pendingIce.current = []
    }

    start()
    return () => {
      cancelled = true
      teardown()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Bind streams to the <video> elements once they're actually mounted, then explicitly
  // play(). `autoPlay` does NOT reliably start playback when srcObject is assigned
  // programmatically after mount (a known race — the element can already be past the point
  // where autoplay fires), which leaves the video paused and black. Calling play() fixes it.
  useEffect(() => {
    const el = localVideo.current
    if (!el) return
    if (el.srcObject !== localStreamState) el.srcObject = localStreamState
    if (localStreamState) el.play().catch(() => {})
  }, [localStreamState, phase])

  useEffect(() => {
    const el = remoteVideo.current
    if (!el) return
    if (el.srcObject !== remoteStreamState) el.srcObject = remoteStreamState
    if (remoteStreamState) el.play().catch(() => {})
  }, [remoteStreamState, phase])

  function teardown() {
    wsRef.current?.close()
    pcRef.current?.close()
    localStream.current?.getTracks().forEach((t) => t.stop())
  }

  async function hangUp() {
    teardown()
    setPhase('ended')
    if (id) { try { await consultationApi.end(id) } catch { /* ignore */ } }
  }

  function toggleMic() {
    const track = localStream.current?.getAudioTracks()[0]
    if (track) { track.enabled = !track.enabled; setMicOn(track.enabled) }
  }
  function toggleCam() {
    const track = localStream.current?.getVideoTracks()[0]
    if (track) { track.enabled = !track.enabled; setCamOn(track.enabled) }
  }

  const isDoctor = session?.self_isDoctor
  const otherName = session ? (isDoctor ? session.patientName : `Dr. ${session.doctorName}`) : ''
  const backHash = isDoctor ? '#/doctor/consultations' : '#/app/consultations'

  const statusText: Record<Phase, string> = {
    loading: 'Preparing…',
    connecting: 'Setting up your camera…',
    waiting: `Waiting for ${otherName || 'the other participant'} to join…`,
    connected: `Connected with ${otherName}`,
    ended: 'Call ended',
    error: note || 'Something went wrong',
  }

  return (
    <Shell doctor={isDoctor} active="doctors" activeDoctor="Consultations"
      title={session ? `${session.callType === 'VIDEO' ? 'Video' : 'Audio'} consultation` : 'Consultation'}
      sub={statusText[phase]}>
      {phase === 'error' && (
        <Card style={{ borderLeft: '4px solid var(--sev-major)' }}>
          <div className="im-panel-title" style={{ color: 'var(--sev-major)' }}>Unable to join</div>
          <p style={{ color: 'var(--muted)', margin: '6px 0 0' }}>{note}</p>
          <div style={{ marginTop: 14 }}><a href={backHash}><Button variant="soft">Back to consultations</Button></a></div>
        </Card>
      )}

      {phase === 'ended' && (
        <Card>
          <div className="im-panel-title">Call ended</div>
          <p style={{ color: 'var(--muted)', margin: '6px 0 0' }}>Thanks — this consultation has been closed.</p>
          <div style={{ marginTop: 14 }}><a href={backHash}><Button variant="soft">Back to consultations</Button></a></div>
        </Card>
      )}

      {phase !== 'error' && phase !== 'ended' && (
        <>
          <div className="im-callstage">
            <div className="im-callstage__remote">
              <video ref={remoteVideo} autoPlay playsInline onLoadedMetadata={(e) => e.currentTarget.play().catch(() => {})} />
              {phase !== 'connected' && (
                <div className="im-callstage__placeholder">
                  <div className="im-callstage__avatar">{isDoctor ? <IconUser width={40} height={40} /> : <IconStethoscope width={40} height={40} />}</div>
                  <p>{statusText[phase]}</p>
                </div>
              )}
            </div>
            <div className="im-callstage__local">
              <video ref={localVideo} autoPlay playsInline muted onLoadedMetadata={(e) => e.currentTarget.play().catch(() => {})} />
              {!camOn && <div className="im-callstage__camoff">Camera off</div>}
            </div>
          </div>

          {note && phase === 'connected' && (
            <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 10 }}>{note}</p>
          )}

          <div className="im-callbar">
            <Button variant={micOn ? 'soft' : 'ghost'} onClick={toggleMic}>{micOn ? 'Mute' : 'Unmute'}</Button>
            {session?.callType === 'VIDEO' && (
              <Button variant={camOn ? 'soft' : 'ghost'} onClick={toggleCam}>{camOn ? 'Camera off' : 'Camera on'}</Button>
            )}
            <button className="im-callbar__hangup" onClick={hangUp} aria-label="End call">
              <IconPhone width={22} height={22} />
            </button>
          </div>
        </>
      )}
    </Shell>
  )
}

/* ============================ Start a consultation (patient) ============================ */

function StartConsultation({ onStarted }: { onStarted: () => void }) {
  const [doctors, setDoctors] = useState<DoctorResponse[]>([])
  const [doctorId, setDoctorId] = useState('')
  const [callType, setCallType] = useState<'VIDEO' | 'AUDIO'>('VIDEO')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    doctorApi.list()
      .then((all) => {
        const verified = all.filter((d) => d.verified)
        setDoctors(verified)
        if (verified[0]) setDoctorId(verified[0].id)
      })
      .catch(() => setErr('Could not load doctors.'))
  }, [])

  async function start() {
    if (!doctorId) return
    setBusy(true); setErr(null)
    try {
      const s = await consultationApi.create({ doctorId, callType })
      onStarted()
      location.hash = `#/call?id=${s.id}`
    } catch {
      setErr('Could not start the consultation.')
      setBusy(false)
    }
  }

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="im-panel-title">Start a consultation</div>
      {doctors.length === 0 ? (
        <p style={{ color: 'var(--muted)', margin: 0, fontSize: 14 }}>No verified doctors are available yet.</p>
      ) : (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <label className="im-field" style={{ flex: 1, minWidth: 220 }}>
            <span className="im-field__label">Doctor</span>
            <select className="im-field__input" value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>Dr. {d.fullName} — {d.specialization}</option>
              ))}
            </select>
          </label>
          <label className="im-field" style={{ minWidth: 140 }}>
            <span className="im-field__label">Type</span>
            <select className="im-field__input" value={callType} onChange={(e) => setCallType(e.target.value as 'VIDEO' | 'AUDIO')}>
              <option value="VIDEO">Video</option>
              <option value="AUDIO">Audio</option>
            </select>
          </label>
          <Button leftIcon={<IconPhone width={16} height={16} />} disabled={busy} onClick={start}>
            {busy ? 'Starting…' : 'Start call'}
          </Button>
        </div>
      )}
      {err && <p style={{ color: 'var(--sev-major)', fontSize: 13, margin: 0 }}>{err}</p>}
    </Card>
  )
}

/* ============================ Consultations list ============================ */

export function Consultations({ doctor = false }: { doctor?: boolean }) {
  const [items, setItems] = useState<ConsultationResponse[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    try { setItems(await consultationApi.mine()) }
    catch { setError('Could not load your consultations.') }
  }
  useEffect(() => { load() }, [])

  return (
    <Shell doctor={doctor} active="consultations" activeDoctor="Consultations"
      title="Consultations" sub="Your video & audio visits">
      {!doctor && <StartConsultation onStarted={load} />}
      {error && <Card style={{ borderLeft: '4px solid var(--sev-major)' }}><p style={{ margin: 0, color: 'var(--muted)' }}>{error}</p></Card>}
      {!items && !error && <Card><p style={{ margin: 0, color: 'var(--muted)' }}>Loading…</p></Card>}
      {items && items.length === 0 && (
        <Card>
          <div className="im-panel-title">No consultations yet</div>
          <p style={{ color: 'var(--muted)', margin: '6px 0 0' }}>
            {doctor ? 'When a patient starts a call with you, it appears here.' : 'Start a video or audio call from the Doctors page.'}
          </p>
        </Card>
      )}
      {items && items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((c) => {
            const live = c.status === 'SCHEDULED' || c.status === 'ACTIVE'
            const who = doctor ? c.patientName : `Dr. ${c.doctorName}`
            return (
              <Card key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <b style={{ fontSize: 15.5 }}>{who}</b>
                  <div style={{ color: 'var(--muted)', fontSize: 13 }}>
                    {c.callType === 'VIDEO' ? 'Video' : 'Audio'} • <span className={`im-cstat im-cstat--${c.status.toLowerCase()}`}>{c.status}</span>
                  </div>
                </div>
                {live ? (
                  <a href={`#/call?id=${c.id}`}><Button variant="primary" leftIcon={<IconPhone width={16} height={16} />}>Join</Button></a>
                ) : (
                  <span style={{ color: 'var(--muted)', fontSize: 13 }}><IconClose width={14} height={14} /> Ended</span>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </Shell>
  )
}
