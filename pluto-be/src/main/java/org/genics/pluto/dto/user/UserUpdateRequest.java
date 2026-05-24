package org.genics.pluto.dto.user;

import lombok.Data;
import org.genics.pluto.enums.UserRole;

@Data
public class UserUpdateRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private UserRole role;
    private Boolean active;
}
