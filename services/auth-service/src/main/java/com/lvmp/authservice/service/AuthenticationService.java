package com.lvmp.authservice.service;

import com.lvmp.authservice.model.keycloak.KeycloakUser;
import com.lvmp.authservice.model.request.LoginRequest;
import com.lvmp.authservice.model.request.RefreshRequest;
import com.lvmp.authservice.model.response.LoginResponse;
import com.lvmp.usermanagement.grpc.v1.CreateUserRequest;
import com.lvmp.usermanagement.grpc.v1.UserManagementServiceGrpc.UserManagementServiceBlockingStub;
import io.grpc.StatusRuntimeException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private static final long CREATE_USER_DEADLINE_SECONDS = 5;

    private final KeycloakService keycloakService;
    private final UserManagementServiceBlockingStub userManagementStub;

    public LoginResponse loginWithPassword(LoginRequest request) {
        return keycloakService.passwordGrant(request.email(), request.password());
    }

    public LoginResponse refresh(RefreshRequest request) {
        return keycloakService.refreshGrant(request.refreshToken());
    }

    // Keycloak user first, then the user-management record synchronously, keyed by the Keycloak id.
    // If CreateUser fails the Keycloak user is deleted again so the sign-up can be retried.
    public void signUp(LoginRequest request) {
        String userId = keycloakService.createUser(KeycloakUser.newUser(request.email(), request.password()));
        log.info("Created Keycloak user {}", userId);

        try {
            userManagementStub
                .withDeadlineAfter(CREATE_USER_DEADLINE_SECONDS, TimeUnit.SECONDS)
                .createUser(CreateUserRequest.newBuilder().setKeycloakUserId(userId).build());
        } catch (StatusRuntimeException e) {
            log.error("CreateUser failed for Keycloak user {}, deleting it: {}", userId, e.getStatus());
            deleteKeycloakUser(userId);
            throw e;
        }
    }

    private void deleteKeycloakUser(String userId) {
        try {
            keycloakService.deleteUser(userId);
        } catch (RuntimeException e) {
            log.error("Could not delete Keycloak user {} after a failed sign-up; remove it manually", userId, e);
        }
    }
}
