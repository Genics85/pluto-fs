package org.genics.pluto.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.genics.pluto.dto.auth.AuthResponse;
import org.genics.pluto.dto.auth.ChangePasswordRequest;
import org.genics.pluto.dto.auth.LoginRequest;
import org.genics.pluto.dto.auth.ResetPasswordRequest;
import org.genics.pluto.model.User;
import org.genics.pluto.repository.UserRepository;
import org.genics.pluto.util.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@Transactional
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepo;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse login(LoginRequest req) {
        User user = userRepo.findByUsername(req.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        if (!user.isActive())
            throw new IllegalArgumentException("Account is disabled");

        if (!passwordEncoder.matches(req.getPassword(), user.getHashedPassword()))
            throw new IllegalArgumentException("Invalid username or password");

        String token = jwtUtil.generate(user);

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .build();
    }

    public void changePassword(ChangePasswordRequest req) {
        User user = userRepo.findByUsername(req.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!user.isActive())
            throw new IllegalArgumentException("Account is disabled");

        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getHashedPassword()))
            throw new IllegalArgumentException("Current password is incorrect");

        user.setHashedPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepo.save(user);
    }

    public void resetPassword(Long userId, ResetPasswordRequest req) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        user.setHashedPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepo.save(user);
    }
}
