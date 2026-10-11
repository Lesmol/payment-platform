package com.lvmp.gateway.config;

import com.lvmp.gateway.model.response.ErrorResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverterAdapter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.ServerAuthenticationEntryPoint;
import org.springframework.security.web.server.authorization.ServerAccessDeniedHandler;
import org.springframework.security.web.server.context.NoOpServerSecurityContextRepository;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import tools.jackson.databind.json.JsonMapper;

import java.util.Collection;
import java.util.List;
import java.util.Map;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {
    private static final String AUTHENTICATION_FAILED = "Authentication failed";
    private static final String ACCESS_DENIED = "Access denied";

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http, JsonMapper jsonMapper) {
        ServerAuthenticationEntryPoint entryPoint = (exchange, e) -> writeError(exchange, jsonMapper, HttpStatus.UNAUTHORIZED,
            AUTHENTICATION_FAILED, e instanceof OAuth2AuthenticationException ? "Invalid or expired token" : "Missing bearer token");
        ServerAccessDeniedHandler accessDeniedHandler = (exchange, e) -> writeError(exchange, jsonMapper, HttpStatus.FORBIDDEN,
            ACCESS_DENIED, "Insufficient permissions");

        return http
            .authorizeExchange(exchange -> exchange
                .pathMatchers("/api/auth/**", "/actuator/health/**").permitAll()
                .anyExchange().authenticated())
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(keycloakAuthenticationConverter()))
                .authenticationEntryPoint(entryPoint)
                .accessDeniedHandler(accessDeniedHandler))
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(entryPoint)
                .accessDeniedHandler(accessDeniedHandler))
            .securityContextRepository(NoOpServerSecurityContextRepository.getInstance())
            .csrf(ServerHttpSecurity.CsrfSpec::disable)
            .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
            .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
            .build();
    }

    // Keycloak puts realm roles in realm_access.roles; expose them as ROLE_<name> (e.g. ROLE_admin)
    private static Converter<Jwt, Mono<AbstractAuthenticationToken>> keycloakAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(SecurityConfig::realmRoles);
        return new ReactiveJwtAuthenticationConverterAdapter(converter);
    }

    private static Collection<GrantedAuthority> realmRoles(Jwt jwt) {
        Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
        if (realmAccess == null || !(realmAccess.get("roles") instanceof Collection<?> roles)) {
            return List.of();
        }
        return roles.stream()
            .map(role -> (GrantedAuthority) new SimpleGrantedAuthority("ROLE_" + role))
            .toList();
    }

    private static Mono<Void> writeError(ServerWebExchange exchange, JsonMapper jsonMapper, HttpStatus status,
                                         String message, String description) {
        var response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        if (status == HttpStatus.UNAUTHORIZED) {
            response.getHeaders().set(HttpHeaders.WWW_AUTHENTICATE, "Bearer");
        }
        byte[] body = jsonMapper.writeValueAsBytes(new ErrorResponse(message, description));
        return response.writeWith(Mono.just(response.bufferFactory().wrap(body)));
    }
}
