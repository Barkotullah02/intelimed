package com.intellimeds.ai.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "ai_providers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiProvider {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "provider_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private ProviderType providerType;

    @Column(name = "api_endpoint")
    private String apiEndpoint;

    @Column(name = "api_key")
    private String apiKey;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_selected")
    @Builder.Default
    private Boolean isSelected = false;

    public enum ProviderType {
        OFFLINE,
        GEMINI,
        OPENAI,
        OLLAMA
    }
}
