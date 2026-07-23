package com.intellimeds.config;

import com.intellimeds.ai.model.AiProvider;
import com.intellimeds.ai.repository.AiProviderRepository;
import com.intellimeds.model.Role;
import com.intellimeds.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final AiProviderRepository aiProviderRepository;

    @Override
    @Transactional
    public void run(String... args) {
        initRoles();
        initAiProviders();
        System.out.println("Data initialization completed!");
    }

    private void initRoles() {
        if (!roleRepository.existsByName(Role.RoleName.ROLE_PATIENT)) {
            roleRepository.save(Role.builder().name(Role.RoleName.ROLE_PATIENT).build());
        }
        if (!roleRepository.existsByName(Role.RoleName.ROLE_HEALTHCARE_PROFESSIONAL)) {
            roleRepository.save(Role.builder().name(Role.RoleName.ROLE_HEALTHCARE_PROFESSIONAL).build());
        }
        if (!roleRepository.existsByName(Role.RoleName.ROLE_ADMIN)) {
            roleRepository.save(Role.builder().name(Role.RoleName.ROLE_ADMIN).build());
        }
    }

    private void initAiProviders() {
        if (aiProviderRepository.count() == 0) {
            aiProviderRepository.save(AiProvider.builder()
                    .name("Offline LLM")
                    .providerType(AiProvider.ProviderType.OFFLINE)
                    .isActive(true)
                    .isSelected(true)
                    .build());
            aiProviderRepository.save(AiProvider.builder()
                    .name("Gemini")
                    .providerType(AiProvider.ProviderType.GEMINI)
                    .isActive(true)
                    .isSelected(false)
                    .build());
            aiProviderRepository.save(AiProvider.builder()
                    .name("OpenAI")
                    .providerType(AiProvider.ProviderType.OPENAI)
                    .isActive(true)
                    .isSelected(false)
                    .build());
            aiProviderRepository.save(AiProvider.builder()
                    .name("Ollama")
                    .providerType(AiProvider.ProviderType.OLLAMA)
                    .isActive(true)
                    .isSelected(false)
                    .build());
        }
    }
}
