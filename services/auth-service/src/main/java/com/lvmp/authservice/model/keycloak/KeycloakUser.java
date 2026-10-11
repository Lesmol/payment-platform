package com.lvmp.authservice.model.keycloak;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record KeycloakUser(
        String id,
        String username,
        String email,
        String firstName,
        String lastName,
        Boolean enabled,
        Boolean emailVerified,
        Long createdTimestamp,
        List<Credential> credentials) {

    public static KeycloakUser newUser(String email, String password) {
        return new KeycloakUser(null, email, email, null, null, true, false, null,
            List.of(Credential.password(password)));
    }

    public record Credential(String type, String value, boolean temporary) {
        public static Credential password(String value) {
            return new Credential("password", value, false);
        }
    }
}
