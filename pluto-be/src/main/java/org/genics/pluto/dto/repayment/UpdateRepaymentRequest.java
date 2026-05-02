package org.genics.pluto.dto.repayment;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.genics.pluto.enums.RepaymentStatus;


@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class UpdateRepaymentRequest {

    private RepaymentStatus repaymentStatus;
}
