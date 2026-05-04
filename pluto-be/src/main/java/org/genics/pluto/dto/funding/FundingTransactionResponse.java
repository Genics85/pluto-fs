package org.genics.pluto.dto.funding;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.genics.pluto.enums.FundingTransactionType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class FundingTransactionResponse {

    private Long id;
    private Long accountId;
    private BigDecimal amount;
    private FundingTransactionType type;
    private String note;
    private Long principalId;
    private LocalDateTime createdAt;

}
