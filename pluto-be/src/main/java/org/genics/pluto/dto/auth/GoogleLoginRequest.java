package org.genics.pluto.dto.auth;

import lombok.Data;

@Data
public class GoogleLoginRequest {
    /** The Google ID token (JWT credential) returned by Google Sign-In on the client. */
    private String idToken;
}
