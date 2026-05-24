package org.genics.pluto.dto.auth;

import lombok.Data;

@Data
public class ResetPasswordRequest {
    private String newPassword;
}
