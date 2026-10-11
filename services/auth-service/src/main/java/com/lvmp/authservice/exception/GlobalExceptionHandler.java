package com.lvmp.authservice.exception;

import com.lvmp.authservice.model.response.ErrorResponse;
import io.grpc.StatusRuntimeException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.ResourceAccessException;

import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    private static final String AN_ERROR_OCCURRED = "An unexpected error occurred";
    private static final String VALIDATION_FAILED = "Validation failed";
    private static final String AUTHENTICATION_FAILED = "Authentication failed";
    private static final String ACCOUNT_CONFLICT = "Account already exists";
    private static final String AUTHENTICATION_SERVICE_UNAVAILABLE = "Authentication service unavailable";
    private static final String USER_SERVICE_UNAVAILABLE = "User service unavailable";

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleArgumentNotValidException(MethodArgumentNotValidException e) {
        log.warn(e.getMessage());

        String validationDetails = e.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + " " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));

        return ResponseEntity.badRequest().body(
                ErrorResponse.builder()
                        .message(VALIDATION_FAILED)
                        .description(validationDetails)
                        .build());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException e) {
        log.warn(e.getMessage());

        return ResponseEntity.badRequest().body(
                ErrorResponse.builder()
                        .message(VALIDATION_FAILED)
                        .description(e.getMessage())
                        .build());
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadableException(HttpMessageNotReadableException e) {
        log.warn(e.getMessage());

        return ResponseEntity.badRequest().body(
                ErrorResponse.builder()
                        .message(VALIDATION_FAILED)
                        .description("Malformed request body")
                        .build());
    }

    @ExceptionHandler(KeycloakException.class)
    public ResponseEntity<ErrorResponse> handleKeycloakException(KeycloakException e) {
        int status = e.getStatus().value();

        if (!e.isAdminApi() && "invalid_grant".equals(e.getError().error())) {
            log.warn(e.getMessage());

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ErrorResponse.builder()
                            .message(AUTHENTICATION_FAILED)
                            .description(e.getError().message())
                            .build());
        }

        if (e.isAdminApi() && status == HttpStatus.CONFLICT.value()) {
            log.warn(e.getMessage());

            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    ErrorResponse.builder()
                            .message(ACCOUNT_CONFLICT)
                            .description(e.getError().message())
                            .build());
        }

        if (e.isAdminApi() && status == HttpStatus.BAD_REQUEST.value()) {
            log.warn(e.getMessage());

            return ResponseEntity.badRequest().body(
                    ErrorResponse.builder()
                            .message(VALIDATION_FAILED)
                            .description(e.getError().message())
                            .build());
        }

        // Anything else (invalid_client, service account not allowed, Keycloak 5xx) is a platform problem, not the user's
        log.error(e.getMessage(), e);

        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(
                ErrorResponse.builder()
                        .message(AUTHENTICATION_SERVICE_UNAVAILABLE)
                        .build());
    }

    // gRPC call to another platform service failed (e.g. user-management CreateUser during sign-up)
    @ExceptionHandler(StatusRuntimeException.class)
    public ResponseEntity<ErrorResponse> handleStatusRuntimeException(StatusRuntimeException e) {
        log.error("gRPC call failed: {}", e.getStatus(), e);

        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(
                ErrorResponse.builder()
                        .message(USER_SERVICE_UNAVAILABLE)
                        .build());
    }

    @ExceptionHandler(ResourceAccessException.class)
    public ResponseEntity<ErrorResponse> handleResourceAccessException(ResourceAccessException e) {
        log.error("Unable to reach the auth provider", e);

        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(
                ErrorResponse.builder()
                        .message(AUTHENTICATION_SERVICE_UNAVAILABLE)
                        .build());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception e) {
        log.error(e.getMessage(), e);

        return ResponseEntity.internalServerError().body(
                ErrorResponse.builder()
                        .message(AN_ERROR_OCCURRED)
                        .build());
    }
}
