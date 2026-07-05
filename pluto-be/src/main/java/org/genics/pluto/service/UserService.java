package org.genics.pluto.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.genics.pluto.dto.user.UserCreateRequest;
import org.genics.pluto.dto.user.UserResponse;
import org.genics.pluto.dto.user.UserUpdateRequest;
import org.genics.pluto.model.User;
import org.genics.pluto.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepo;

    public UserResponse create(UserCreateRequest req) {
        if (userRepo.existsByUsername(req.getUsername()))
            throw new IllegalArgumentException("Username already taken");
        if (userRepo.existsByEmail(req.getEmail()))
            throw new IllegalArgumentException("Email already registered");

        User user = User.builder()
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .email(req.getEmail())
                .username(req.getUsername())
                .phone(req.getPhone())
                .role(req.getRole())
                .build();

        return toResponse(userRepo.save(user));
    }

    public List<UserResponse> findAll() {
        return userRepo.findAll().stream().map(this::toResponse).toList();
    }

    public UserResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    public UserResponse update(Long id, UserUpdateRequest req) {
        User user = getOrThrow(id);

        if (req.getFirstName() != null) user.setFirstName(req.getFirstName());
        if (req.getLastName() != null) user.setLastName(req.getLastName());
        if (req.getEmail() != null) user.setEmail(req.getEmail());
        if (req.getPhone() != null) user.setPhone(req.getPhone());
        if (req.getRole() != null) user.setRole(req.getRole());
        if (req.getActive() != null) user.setActive(req.getActive());

        return toResponse(userRepo.save(user));
    }

    public void delete(Long id) {
        userRepo.delete(getOrThrow(id));
    }

    private User getOrThrow(Long id) {
        return userRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
    }

    private UserResponse toResponse(User u) {
        return UserResponse.builder()
                .id(u.getId())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .email(u.getEmail())
                .username(u.getUsername())
                .phone(u.getPhone())
                .role(u.getRole())
                .active(u.isActive())
                .createdAt(u.getCreatedAt())
                .updatedAt(u.getUpdatedAt())
                .build();
    }
}
