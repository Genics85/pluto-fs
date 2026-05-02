package org.genics.pluto.dto.funding;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.genics.pluto.enums.FundingTransactionType;

import java.math.BigDecimal;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class FundingTransactionRequest {
    private Long accountId;
    private BigDecimal amount;
    private FundingTransactionType type;
    private String note;
    private Long principalId;
}
