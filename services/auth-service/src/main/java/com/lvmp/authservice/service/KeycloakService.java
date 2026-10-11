package com.lvmp.authservice.service;

import com.lvmp.authservice.config.properties.ApplicationConfiguration;
import com.lvmp.authservice.model.keycloak.KeycloakUser;
import com.lvmp.authservice.model.response.LoginResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.net.URI;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class KeycloakService {
    private static final String TOKEN_PATH = "/protocol/openid-connect/token";
    private static final String USERS_PATH = "/users";
    private static final String USER_PATH = "/users/{id}";
    private static final String USERS_COUNT_PATH = "/users/count";
    // Refresh the service-account token this long before it expires
    private static final long TOKEN_EXPIRY_MARGIN_SECONDS = 30;

    private final RestClient keycloakRealmClient;
    private final RestClient keycloakAdminClient;
    private final ApplicationConfiguration applicationConfiguration;

    private String serviceAccountToken;
    private Instant serviceAccountTokenExpiry = Instant.EPOCH;

    public LoginResponse passwordGrant(String username, String password) {
        MultiValueMap<String, String> form = clientForm("password");
        form.add("username", username);
        form.add("password", password);
        return requestToken(form);
    }

    public LoginResponse refreshGrant(String refreshToken) {
        MultiValueMap<String, String> form = clientForm("refresh_token");
        form.add("refresh_token", refreshToken);
        return requestToken(form);
    }

    public String createUser(KeycloakUser user) {
        URI location = keycloakAdminClient
            .post()
            .uri(USERS_PATH)
            .header(HttpHeaders.AUTHORIZATION, bearer())
            .contentType(MediaType.APPLICATION_JSON)
            .body(user)
            .retrieve()
            .toBodilessEntity()
            .getHeaders()
            .getLocation();

        if (location == null) {
            throw new IllegalStateException("Keycloak created the user but returned no Location header");
        }
        String path = location.getPath();
        return path.substring(path.lastIndexOf('/') + 1);
    }

    public void deleteUser(String id) {
        keycloakAdminClient
            .delete()
            .uri(USER_PATH, id)
            .header(HttpHeaders.AUTHORIZATION, bearer())
            .retrieve()
            .toBodilessEntity();
    }

    public KeycloakUser getUser(String id) {
        return keycloakAdminClient
            .get()
            .uri(USER_PATH, id)
            .header(HttpHeaders.AUTHORIZATION, bearer())
            .retrieve()
            .body(KeycloakUser.class);
    }

    public List<KeycloakUser> listUsers(int first, int max, String search) {
        KeycloakUser[] users = keycloakAdminClient
            .get()
            .uri(builder -> withSearch(builder.path(USERS_PATH).queryParam("first", first).queryParam("max", max), search).build())
            .header(HttpHeaders.AUTHORIZATION, bearer())
            .retrieve()
            .body(KeycloakUser[].class);
        return users == null ? List.of() : List.of(users);
    }

    public int countUsers(String search) {
        Integer count = keycloakAdminClient
            .get()
            .uri(builder -> withSearch(builder.path(USERS_COUNT_PATH), search).build())
            .header(HttpHeaders.AUTHORIZATION, bearer())
            .retrieve()
            .body(Integer.class);
        return count == null ? 0 : count;
    }

    private static org.springframework.web.util.UriBuilder withSearch(org.springframework.web.util.UriBuilder builder, String search) {
        return search == null || search.isBlank() ? builder : builder.queryParam("search", search);
    }

    private synchronized String bearer() {
        if (serviceAccountToken == null || Instant.now().isAfter(serviceAccountTokenExpiry)) {
            LoginResponse token = requestToken(clientForm("client_credentials"));
            serviceAccountToken = token.accessToken();
            serviceAccountTokenExpiry = Instant.now().plusSeconds(Math.max(0, token.expiresIn() - TOKEN_EXPIRY_MARGIN_SECONDS));
        }
        return "Bearer " + serviceAccountToken;
    }

    private LoginResponse requestToken(MultiValueMap<String, String> form) {
        return keycloakRealmClient
            .post()
            .uri(TOKEN_PATH)
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .body(form)
            .retrieve()
            .body(LoginResponse.class);
    }

    private MultiValueMap<String, String> clientForm(String grantType) {
        var keycloak = applicationConfiguration.keycloak();
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", grantType);
        form.add("client_id", keycloak.clientId());
        form.add("client_secret", keycloak.clientSecret());
        return form;
    }
}
