package org.genics.pluto.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.genics.pluto.dto.auth.AuthResponse;
import org.genics.pluto.dto.auth.GoogleLoginRequest;
import org.genics.pluto.model.User;
import org.genics.pluto.repository.UserRepository;
import org.genics.pluto.util.GoogleTokenVerifier;
import org.genics.pluto.util.JwtUtil;
import org.springframework.stereotype.Service;

@Service
@Transactional
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepo;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final JwtUtil jwtUtil;

    /**
     * Authenticates a user via a Google ID token. The token is verified against
     * Google, and the resolved email must match an existing, active user.
     */
    public AuthResponse loginWithGoogle(GoogleLoginRequest req) {
        if (req.getIdToken() == null || req.getIdToken().isBlank())
            throw new IllegalArgumentException("Missing Google token");

        String email = googleTokenVerifier.verifyAndGetEmail(req.getIdToken());

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No account is registered for this Google email"));

        if (!user.isActive())
            throw new IllegalArgumentException("Account is disabled");

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
}
