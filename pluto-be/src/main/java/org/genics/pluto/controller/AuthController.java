package org.genics.pluto.controller;

import lombok.RequiredArgsConstructor;
import org.genics.pluto.dto.auth.AuthResponse;
import org.genics.pluto.dto.auth.GoogleLoginRequest;
import org.genics.pluto.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> google(@RequestBody GoogleLoginRequest req) {
        return ResponseEntity.ok(authService.loginWithGoogle(req));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleAuthFailure(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", ex.getMessage()));
    }
}
