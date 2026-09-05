package com.intellimeds.consultation.signaling;

import com.intellimeds.consultation.repository.ConsultationSessionRepository;
import com.intellimeds.model.User;
import com.intellimeds.repository.UserRepository;
import com.intellimeds.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Authenticates the WebSocket handshake from a `?token=` query param (browsers can't
 * set Authorization headers on a WebSocket) and authorises the caller as a participant
 * of the requested `?room=`. Stores identity in the session attributes for the handler.
 */
@RequiredArgsConstructor
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final ConsultationSessionRepository sessionRepository;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        Map<String, String> params = queryParams(request);
        String token = params.get("token");
        String room = params.get("room");
        if (token == null || room == null) {
            response.setStatusCode(org.springframework.http.HttpStatus.BAD_REQUEST);
            return false;
        }

        String email;
        try {
            email = jwtUtil.extractEmail(token);
            if (email == null || jwtUtil.extractExpiration(token).before(new Date())) {
                return reject(response);
            }
        } catch (Exception e) {
            return reject(response);
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return reject(response);
        }
        if (!sessionRepository.isActiveParticipant(room, user.getId())) {
            return reject(response);
        }

        attributes.put("userId", user.getId());
        attributes.put("email", email);
        attributes.put("room", room);
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        // no-op
    }

    private boolean reject(ServerHttpResponse response) {
        response.setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
        return false;
    }

    private Map<String, String> queryParams(ServerHttpRequest request) {
        var map = UriComponentsBuilder.fromUri(request.getURI()).build().getQueryParams();
        Map<String, String> flat = new java.util.HashMap<>();
        for (Map.Entry<String, List<String>> e : map.entrySet()) {
            if (!e.getValue().isEmpty()) flat.put(e.getKey(), e.getValue().get(0));
        }
        return flat;
    }
}
