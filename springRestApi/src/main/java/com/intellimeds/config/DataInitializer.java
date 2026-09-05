package com.intellimeds.config;

import com.intellimeds.ai.model.AiProvider;
import com.intellimeds.ai.repository.AiProviderRepository;
import com.intellimeds.model.Profile;
import com.intellimeds.model.Role;
import com.intellimeds.model.User;
import com.intellimeds.repository.ProfileRepository;
import com.intellimeds.repository.RoleRepository;
import com.intellimeds.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final AiProviderRepository aiProviderRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:admin@intellimeds.com}")
    private String adminEmail;

    @Value("${app.admin.password:ChangeMe!123}")
    private String adminPassword;

    @Value("${app.admin.name:IntelliMeds Admin}")
    private String adminName;

    @Override
    @Transactional
    public void run(String... args) {
        initRoles();
        initAdmin();
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

    private void initAdmin() {
        if (userRepository.existsByEmail(adminEmail)) {
            return;
        }
        Role adminRole = roleRepository.findByName(Role.RoleName.ROLE_ADMIN)
                .orElseThrow(() -> new IllegalStateException("ROLE_ADMIN not initialized"));

        Set<Role> roles = new HashSet<>();
        roles.add(adminRole);

        User admin = User.builder()
                .name(adminName)
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .roles(roles)
                .isActive(true)
                .isLocked(false)
                .build();
        userRepository.save(admin);

        Profile profile = Profile.builder()
                .user(admin)
                .fullName(admin.getName())
                .build();
        profileRepository.save(profile);

        System.out.println("Seeded admin account: " + adminEmail);
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
