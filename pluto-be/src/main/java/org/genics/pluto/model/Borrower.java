package org.genics.pluto.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.genics.pluto.util.RepaymentScore;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.List;

@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
@Table(name = "borrowers")
public class Borrower {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    private String whatsapp;

    private String ghanaCard;

    private String location;

    @JsonManagedReference
    @OneToMany(mappedBy = "borrower", cascade = CascadeType.ALL)
    private List<Loan> loans;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    /** Repayment score pooled over every repayment on all of this borrower's loans. */
    @Transient
    @JsonProperty("score")
    public Integer getScore() {
        if (this.loans == null) return null;
        return RepaymentScore.average(
                this.loans.stream()
                        .map(Loan::getRepayments)
                        .filter(Objects::nonNull)
                        .flatMap(List::stream),
                LocalDate.now());
    }
}
