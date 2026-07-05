package org.genics.pluto.dto.principal;

import lombok.Data;

@Data
public class PrincipalUpdateRequest {

    private String name;

    private String email;

    private String phone;

}
