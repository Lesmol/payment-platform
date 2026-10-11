package com.lvmp.authservice.model.keycloak;

import com.fasterxml.jackson.annotation.JsonProperty;

public record KeycloakError(
        @JsonProperty("error") String error,
        @JsonProperty("error_description") String errorDescription,
        @JsonProperty("errorMessage") String errorMessage) {

    public String message() {
        if (errorDescription != null) {
            return errorDescription;
        }
        return errorMessage != null ? errorMessage : error;
    }
}
