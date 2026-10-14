package org.genics.pluto.model;


import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.genics.pluto.enums.PaymentMethod;
import org.genics.pluto.enums.RepaymentStatus;
import org.genics.pluto.util.RepaymentScore;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Builder
@Table(name = "repayments")
@NoArgsConstructor
@AllArgsConstructor
public class Repayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonBackReference
    @ManyToOne(optional = false)
    @JoinColumn(name = "loan_id")
    private Loan loan;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amountPaid;

    private LocalDate paymentDate;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private RepaymentStatus repaymentStatus = RepaymentStatus.PENDING;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod = PaymentMethod.MOBILE_MONEY;

    @Builder.Default
    @CreationTimestamp
    private LocalDateTime createdAt = LocalDateTime.now();

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private LocalDateTime paidAt;

    // How much of the payment came out of the funding account's reserve, so an undo can put it back.
    @JsonIgnore
    @Column(precision = 15, scale = 2)
    private BigDecimal releasedFromReserve;

    /** Points for this repayment (see RepaymentScore); null when not due yet or still in grace. */
    @Transient
    @JsonProperty("score")
    public Integer getScore() {
        return RepaymentScore.pointsFor(this, LocalDate.now());
    }
}
