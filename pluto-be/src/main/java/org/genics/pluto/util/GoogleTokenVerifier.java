package org.genics.pluto.util;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Collections;

/**
 * Verifies Google-issued ID tokens (from Google Sign-In on the frontend) and
 * extracts the authenticated user's email.
 */
@Component
public class GoogleTokenVerifier {

    private final GoogleIdTokenVerifier verifier;

    public GoogleTokenVerifier(@Value("${app.google.client-id}") String clientId) {
        this.verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(clientId))
                .build();
    }

    /**
     * Verifies the signature, audience and expiry of a Google ID token and
     * returns the verified email address.
     *
     * @throws IllegalArgumentException if the token is invalid or the email is unverified
     */
    public String verifyAndGetEmail(String idTokenString) {
        GoogleIdToken idToken;
        try {
            idToken = verifier.verify(idTokenString);
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to verify Google token");
        }

        if (idToken == null)
            throw new IllegalArgumentException("Invalid Google token");

        GoogleIdToken.Payload payload = idToken.getPayload();

        if (!Boolean.TRUE.equals(payload.getEmailVerified()))
            throw new IllegalArgumentException("Google email is not verified");

        return payload.getEmail();
    }
}
