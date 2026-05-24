package org.genics.pluto.controller;

import lombok.RequiredArgsConstructor;
import org.genics.pluto.dto.auth.AuthResponse;
import org.genics.pluto.dto.auth.ChangePasswordRequest;
import org.genics.pluto.dto.auth.LoginRequest;
import org.genics.pluto.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(@RequestBody ChangePasswordRequest req) {
        authService.changePassword(req);
        return ResponseEntity.noContent().build();
    }
}
