package org.genics.pluto.dto.auth;

import lombok.Builder;
import lombok.Data;
import org.genics.pluto.enums.UserRole;

@Data
@Builder
public class AuthResponse {
    private String token;
    private Long id;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private UserRole role;
}
