package com.lvmp.authservice.exception;

import com.lvmp.authservice.model.keycloak.KeycloakError;
import lombok.Getter;
import org.springframework.http.HttpStatusCode;

@Getter
public class KeycloakException extends RuntimeException {
    private final HttpStatusCode status;
    private final KeycloakError error;
    private final boolean adminApi;

    public KeycloakException(HttpStatusCode status, KeycloakError error, boolean adminApi) {
        super("Keycloak " + (adminApi ? "Admin API" : "token endpoint") + " returned " + status.value() + ": " + error.message());
        this.status = status;
        this.error = error;
        this.adminApi = adminApi;
    }
}
