package org.genics.pluto.dto.principal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class PrincipalAddRequest {

    private String name;

    private String email;

    private String phone;

}
