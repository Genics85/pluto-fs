package org.genics.pluto.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder.Default;

import org.genics.pluto.enums.InterestType;
import org.genics.pluto.enums.LoanStatus;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "loans")
public class Loan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonBackReference
    @ManyToOne(optional = false)
    @JoinColumn(name = "borrower_id")
    private Borrower borrower;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal principalAmount;

    @Builder.Default
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal interestRate= BigDecimal.valueOf(20);

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private InterestType interestType = InterestType.FLAT;

    @Builder.Default
    private int durationWeeks=12;

    private LocalDate startDate;

    private LocalDate endDate;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal totalPayable;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal outstandingBalance;

    @Default
    @Enumerated(EnumType.STRING)
    private LoanStatus status = LoanStatus.ACTIVE;

    @Builder.Default
    @CreationTimestamp
    private LocalDateTime createdAt = LocalDateTime.now();

    @JsonManagedReference
    @OneToMany(mappedBy = "loan", cascade = CascadeType.ALL)
    private List<Repayment> repayments;


    @Transient
    @JsonProperty("borrowerName")
    public String getBorrowerName() {
        if (this.borrower == null) return null;
        String first = this.borrower.getFirstName();
        String last = this.borrower.getLastName();
        if (first == null && last == null) return null;
        if (first == null) return last;
        if (last == null) return first;
        return first + " " + last;
    }

}