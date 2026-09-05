package com.intellimeds.consultation.signaling;

import com.intellimeds.consultation.repository.ConsultationSessionRepository;
import com.intellimeds.repository.UserRepository;
import com.intellimeds.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final SignalingHandler signalingHandler;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final ConsultationSessionRepository sessionRepository;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(signalingHandler, "/ws/signal")
                .addInterceptors(new JwtHandshakeInterceptor(jwtUtil, userRepository, sessionRepository))
                .setAllowedOriginPatterns("*");
    }
}
