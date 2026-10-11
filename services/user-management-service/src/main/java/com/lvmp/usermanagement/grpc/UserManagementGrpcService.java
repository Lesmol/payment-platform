package com.lvmp.usermanagement.grpc;

import com.lvmp.usermanagement.grpc.v1.CreateUserRequest;
import com.lvmp.usermanagement.grpc.v1.CreateUserResponse;
import com.lvmp.usermanagement.grpc.v1.UserManagementServiceGrpc;
import com.lvmp.usermanagement.service.UserService;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import org.springframework.grpc.server.service.GrpcService;

import java.util.UUID;

@GrpcService
@RequiredArgsConstructor
public class UserManagementGrpcService extends UserManagementServiceGrpc.UserManagementServiceImplBase {
    private final UserService userService;

    @Override
    public void createUser(CreateUserRequest request, StreamObserver<CreateUserResponse> responseObserver) {
        userService.createUser(parseUuid(request.getKeycloakUserId()));
        responseObserver.onNext(CreateUserResponse.getDefaultInstance());
        responseObserver.onCompleted();
    }

    private static UUID parseUuid(String value) {
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("keycloak_user_id must be a UUID");
        }
    }
}
