package org.genics.pluto.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.genics.pluto.dto.principal.PrincipalAddRequest;
import org.genics.pluto.model.Principal;
import org.genics.pluto.repository.PrincipalRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class PrincipalService {

    private final PrincipalRepository principalRepository;

    public List<Principal> findAll() {
        return principalRepository.findAll();
    }

    public Optional<Principal> findById(Long id) {
        return principalRepository.findById(id);
    }

    public Optional<Principal> findByEmail(String email) {
        return principalRepository.findByEmail(email);
    }

    public Principal save(PrincipalAddRequest req) {
        Principal p = Principal.builder()
                .name(req.getName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .build();
        return principalRepository.save(p);
    }

    public void deleteById(Long id) {
        principalRepository.deleteById(id);
    }

}
