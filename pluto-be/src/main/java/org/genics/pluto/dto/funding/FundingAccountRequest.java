package org.genics.pluto.dto.funding;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class FundingAccountRequest {
    private String name;
    private String currency;
    private BigDecimal initialDeposit;
}

