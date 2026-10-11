package com.lvmp.authservice.grpc;

import com.lvmp.authservice.exception.KeycloakException;
import io.grpc.Status;
import io.grpc.StatusException;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.grpc.server.exception.GrpcExceptionHandler;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;

@Slf4j
@Component
public class GrpcExceptionHandlers implements GrpcExceptionHandler {
    private static final String AUTHENTICATION_SERVICE_UNAVAILABLE = "Authentication service unavailable";

    @Override
    public StatusException handleException(@NonNull Throwable e) {
        if (e instanceof IllegalArgumentException) {
            log.warn(e.getMessage());
            return Status.INVALID_ARGUMENT.withDescription(e.getMessage()).asException();
        }
        if (e instanceof KeycloakException ke && ke.isAdminApi() && ke.getStatus().value() == HttpStatus.NOT_FOUND.value()) {
            log.warn(e.getMessage());
            return Status.NOT_FOUND.withDescription("User not found").asException();
        }
        if (e instanceof KeycloakException || e instanceof ResourceAccessException) {
            log.error(e.getMessage(), e);
            return Status.UNAVAILABLE.withDescription(AUTHENTICATION_SERVICE_UNAVAILABLE).asException();
        }
        return null;
    }
}
