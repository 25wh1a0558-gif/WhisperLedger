package com.whisperledger.service;

import com.whisperledger.dto.AuthDtos.*;
import com.whisperledger.entity.User;
import com.whisperledger.repository.UserRepository;
import com.whisperledger.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // Generates a blind anonymous ID derived cryptographically from student ID + department salt
    // e.g., ANON-CSE-8942-F7
    public String generateBlindAnonymousId(Long userId, String department, Integer year) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String raw = "whisper-ledger-salt-" + userId + "-" + department + "-" + year;
            byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            String hex = HexFormat.of().formatHex(hash).toUpperCase();
            return "ANON-" + department.toUpperCase() + "-" + hex.substring(0, 4) + "-" + hex.substring(4, 8);
        } catch (Exception e) {
            return "ANON-" + department + "-" + (1000 + (userId % 9000));
        }
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered");
        }

        String role = request.getRole() != null ? request.getRole().toUpperCase() : "STUDENT";

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .department(request.getDepartment())
                .year(request.getYear() != null ? request.getYear() : 1)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        user = userRepository.save(user);

        String anonymousId = role.equals("STUDENT") 
                ? generateBlindAnonymousId(user.getId(), user.getDepartment(), user.getYear()) 
                : "STAFF-" + role;

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole(), anonymousId);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .department(user.getDepartment())
                .year(user.getYear())
                .anonymousId(anonymousId)
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String anonymousId = user.getRole().equals("STUDENT") 
                ? generateBlindAnonymousId(user.getId(), user.getDepartment(), user.getYear()) 
                : "STAFF-" + user.getRole();

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole(), anonymousId);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .department(user.getDepartment())
                .year(user.getYear())
                .anonymousId(anonymousId)
                .build();
    }
}
