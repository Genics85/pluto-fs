package org.genics.pluto.repository;

import org.genics.pluto.model.Borrower;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BorrowerRepository extends JpaRepository<Borrower, Long> {

    Optional<Borrower> findByEmail(String email);

    List<Borrower> findByLastNameIgnoreCase(String lastName);

}

