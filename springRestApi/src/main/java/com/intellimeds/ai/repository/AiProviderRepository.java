package com.intellimeds.ai.repository;

import com.intellimeds.ai.model.AiProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AiProviderRepository extends JpaRepository<AiProvider, UUID> {
    Optional<AiProvider> findByName(String name);
    Optional<AiProvider> findByIsSelectedTrue();
    Optional<AiProvider> findByProviderType(AiProvider.ProviderType providerType);
}
