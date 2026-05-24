package org.genics.pluto.dto.user;

import lombok.Data;
import org.genics.pluto.enums.UserRole;

@Data
public class UserCreateRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String username;
    private String phone;
    private String password;
    private UserRole role;
}
