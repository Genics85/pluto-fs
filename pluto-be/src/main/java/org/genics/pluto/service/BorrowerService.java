package org.genics.pluto.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.genics.pluto.dto.borrower.BorrowerAddRequest;
import org.genics.pluto.dto.borrower.BorrowerUpdateRequest;
import org.genics.pluto.model.Borrower;
import org.genics.pluto.repository.BorrowerRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class BorrowerService {

    private final BorrowerRepository borrowerRepository;

    public List<Borrower> findAll() {
        return borrowerRepository.findAll();
    }

    public Optional<Borrower> findById(Long id) {
        return borrowerRepository.findById(id);
    }

    public Optional<Borrower> findByEmail(String email) {
        return borrowerRepository.findByEmail(email);
    }

    public Borrower save(BorrowerAddRequest req) {

        Borrower b = Borrower.builder()
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .whatsapp(req.getWhatsapp())
                .ghanaCard(req.getGhanaCard())
                .location(req.getLocation())
                .build();

        return borrowerRepository.save(b);
    }

    public Optional<Borrower> update(Long id, BorrowerUpdateRequest req) {
        return borrowerRepository.findById(id).map(b -> {
            b.setFirstName(req.getFirstName());
            b.setLastName(req.getLastName());
            b.setEmail(req.getEmail());
            b.setPhone(req.getPhone());
            b.setWhatsapp(req.getWhatsapp());
            b.setGhanaCard(req.getGhanaCard());
            b.setLocation(req.getLocation());
            return borrowerRepository.save(b);
        });
    }

}
