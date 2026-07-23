package com.intellimeds.auth;

import com.intellimeds.auth.dto.*;
import com.intellimeds.exception.ResourceNotFoundException;
import com.intellimeds.model.Profile;
import com.intellimeds.model.RefreshToken;
import com.intellimeds.model.Role;
import com.intellimeds.model.User;
import com.intellimeds.repository.ProfileRepository;
import com.intellimeds.repository.RefreshTokenRepository;
import com.intellimeds.repository.RoleRepository;
import com.intellimeds.repository.UserRepository;
import com.intellimeds.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalStateException("Email already registered");
        }

        Role role = roleRepository.findByName(
                Role.RoleName.valueOf(request.getRole().toUpperCase()))
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", request.getRole()));

        Set<Role> roles = new HashSet<>();
        roles.add(role);

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(roles)
                .isActive(true)
                .isLocked(false)
                .build();

        userRepository.save(user);

        Profile profile = Profile.builder()
                .user(user)
                .fullName(user.getName())
                .build();
        profileRepository.save(profile);

        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities(user.getRoles().stream()
                        .map(r -> new SimpleGrantedAuthority(r.getName().name()))
                        .collect(Collectors.toSet()))
                .build();

        String accessToken = jwtUtil.generateAccessToken(userDetails);
        String refreshToken = generateRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .email(user.getEmail())
                .name(user.getName())
                .role(role.getName().name())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities(user.getRoles().stream()
                        .map(r -> new SimpleGrantedAuthority(r.getName().name()))
                        .collect(Collectors.toSet()))
                .build();

        String accessToken = jwtUtil.generateAccessToken(userDetails);
        String refreshToken = generateRefreshToken(user);

        String roleName = user.getRoles().iterator().next().getName().name();

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .email(user.getEmail())
                .name(user.getName())
                .role(roleName)
                .build();
    }

    @Transactional
    public void logout(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        refreshTokenRepository.deleteByUserId(user.getId());
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        if (refreshToken.isExpired() || refreshToken.getRevoked()) {
            throw new IllegalArgumentException("Refresh token is expired or revoked");
        }

        User user = refreshToken.getUser();

        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities(user.getRoles().stream()
                        .map(r -> new SimpleGrantedAuthority(r.getName().name()))
                        .collect(Collectors.toSet()))
                .build();

        String newAccessToken = jwtUtil.generateAccessToken(userDetails);
        String newRefreshToken = generateRefreshToken(user);

        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        String roleName = user.getRoles().iterator().next().getName().name();

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .email(user.getEmail())
                .name(user.getName())
                .role(roleName)
                .build();
    }

    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        String roleName = user.getRoles().iterator().next().getName().name();

        return UserResponse.builder()
                .id(user.getId().toString())
                .email(user.getEmail())
                .name(user.getName())
                .role(roleName)
                .isActive(user.getIsActive())
                .build();
    }

    private String generateRefreshToken(User user) {
        refreshTokenRepository.findByUserIdAndRevokedFalse(user.getId())
                .ifPresent(token -> {
                    token.setRevoked(true);
                    refreshTokenRepository.save(token);
                });

        RefreshToken refreshToken = RefreshToken.builder()
                .token(UUID.randomUUID().toString())
                .user(user)
                .expiryDate(LocalDateTime.now().plusDays(7))
                .revoked(false)
                .build();

        refreshTokenRepository.save(refreshToken);
        return refreshToken.getToken();
    }
}
