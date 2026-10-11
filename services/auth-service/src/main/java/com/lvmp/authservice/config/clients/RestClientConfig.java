package com.lvmp.authservice.config.clients;

import com.lvmp.authservice.config.properties.ApplicationConfiguration;
import com.lvmp.authservice.exception.KeycloakException;
import com.lvmp.authservice.model.keycloak.KeycloakError;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.net.http.HttpClient;
import java.time.Duration;

@Configuration
@RequiredArgsConstructor
public class RestClientConfig {
    private final ApplicationConfiguration applicationConfiguration;
    private final JsonMapper jsonMapper;

    @Bean
    RestClient keycloakRealmClient(RestClient.Builder builder) {
        return keycloakClient(builder, "/realms/");
    }

    @Bean
    RestClient keycloakAdminClient(RestClient.Builder builder) {
        return keycloakClient(builder, "/admin/realms/");
    }

    private RestClient keycloakClient(RestClient.Builder builder, String realmPrefix) {
        HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .build();

        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(client);
        requestFactory.setReadTimeout(Duration.ofSeconds(30));

        var keycloak = applicationConfiguration.keycloak();
        boolean adminApi = realmPrefix.startsWith("/admin/");

        return builder.clone()
            .baseUrl(keycloak.baseUrl() + realmPrefix + keycloak.realm())
            .requestFactory(requestFactory)
            .defaultStatusHandler(HttpStatusCode::isError, (_, response) -> {
                throw new KeycloakException(response.getStatusCode(), readError(response), adminApi);
            })
            .build();
    }

    private KeycloakError readError(ClientHttpResponse response) throws IOException {
        try {
            KeycloakError error = jsonMapper.readValue(response.getBody(), KeycloakError.class);
            if (error != null) {
                return error;
            }
        } catch (JacksonException ignored) { }
        return new KeycloakError(null, response.getStatusText(), null);
    }
}
