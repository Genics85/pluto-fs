package org.genics.pluto.dto.loan;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class LoanAddRequest {

    @NotNull
    private Long borrowerId;

    @NotNull
    @DecimalMin(value = "0.01", inclusive = true)
    private BigDecimal principalAmount;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = true)
    @Builder.Default
    private BigDecimal interestRate= BigDecimal.valueOf(20);

    @Min(1)
    @Builder.Default
    private int durationWeeks=12;

    @NotNull
    private LocalDate startDate;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal totalPayable;

}
