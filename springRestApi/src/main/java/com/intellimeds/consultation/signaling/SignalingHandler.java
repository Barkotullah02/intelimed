package com.intellimeds.consultation.signaling;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * A dumb SDP/ICE relay for 1:1 WebRTC calls. It keeps at most two sockets per room
 * and forwards every message from one peer to the other. It also emits small control
 * frames ("peer-joined" / "peer-left") so clients know when to negotiate. The peer that
 * is already waiting when another joins is the one that creates the WebRTC offer.
 */
@Component
public class SignalingHandler extends TextWebSocketHandler {

    private static final int MAX_PEERS_PER_ROOM = 2;

    private final Map<String, Set<WebSocketSession>> rooms = new ConcurrentHashMap<>();

    private String room(WebSocketSession s) {
        Object r = s.getAttributes().get("room");
        return r == null ? null : r.toString();
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String room = room(session);
        Set<WebSocketSession> peers = rooms.computeIfAbsent(room, k -> ConcurrentHashMap.newKeySet());

        if (peers.size() >= MAX_PEERS_PER_ROOM) {
            session.close(CloseStatus.POLICY_VIOLATION.withReason("Room is full"));
            return;
        }
        // Tell whoever is already here that a peer arrived — they will start the offer.
        for (WebSocketSession existing : peers) {
            send(existing, "{\"type\":\"peer-joined\"}");
        }
        peers.add(session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        String room = room(session);
        Set<WebSocketSession> peers = rooms.get(room);
        if (peers == null) return;
        for (WebSocketSession peer : peers) {
            if (!peer.getId().equals(session.getId())) {
                send(peer, message.getPayload());
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String room = room(session);
        Set<WebSocketSession> peers = rooms.get(room);
        if (peers == null) return;
        peers.remove(session);
        for (WebSocketSession peer : peers) {
            send(peer, "{\"type\":\"peer-left\"}");
        }
        if (peers.isEmpty()) {
            rooms.remove(room);
        }
    }

    private void send(WebSocketSession session, String payload) {
        try {
            if (session.isOpen()) {
                session.sendMessage(new TextMessage(payload));
            }
        } catch (IOException ignored) {
            // peer went away mid-send; connection-closed handling will clean it up
        }
    }
}
