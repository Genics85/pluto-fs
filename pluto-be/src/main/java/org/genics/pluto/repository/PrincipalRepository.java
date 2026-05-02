package org.genics.pluto.repository;

import org.genics.pluto.model.Principal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PrincipalRepository extends JpaRepository<Principal, Long> {

    Optional<Principal> findByEmail(String email);

}

