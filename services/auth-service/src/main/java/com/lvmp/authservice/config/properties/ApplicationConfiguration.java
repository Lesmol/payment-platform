package com.lvmp.authservice.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("app")
public record ApplicationConfiguration(KeycloakProperties keycloak) {
    public record KeycloakProperties(String baseUrl, String realm, String clientId, String clientSecret) { }
}
