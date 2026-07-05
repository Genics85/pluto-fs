package org.genics.pluto.config;

import lombok.RequiredArgsConstructor;
import org.genics.pluto.enums.UserRole;
import org.genics.pluto.model.User;
import org.genics.pluto.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Seeds a default admin account on startup so Google Sign-In has an existing
 * user to match against. Idempotent — only creates the user if the email is absent.
 */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final String SEED_EMAIL = "eugeneamo85@gmail.com";

    private final UserRepository userRepo;

    @Override
    public void run(String... args) {
        if (userRepo.existsByEmail(SEED_EMAIL)) return;

        User user = User.builder()
                .firstName("Eugene")
                .lastName("Amo")
                .email(SEED_EMAIL)
                .username("eugeneamo85")
                .role(UserRole.ADMIN)
                .active(true)
                .build();

        userRepo.save(user);
    }
}
