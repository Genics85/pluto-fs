package org.genics.pluto.dto.loan;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.genics.pluto.enums.LoanStatus;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class LoanStatusUpdateRequest {

    @NotNull
    private LoanStatus status;

}
