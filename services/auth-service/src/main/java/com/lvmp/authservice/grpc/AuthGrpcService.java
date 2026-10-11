package com.lvmp.authservice.grpc;

import com.google.protobuf.Timestamp;
import com.lvmp.authservice.grpc.v1.AuthServiceGrpc;
import com.lvmp.authservice.grpc.v1.GetUserRequest;
import com.lvmp.authservice.grpc.v1.ListUsersRequest;
import com.lvmp.authservice.grpc.v1.ListUsersResponse;
import com.lvmp.authservice.grpc.v1.User;
import com.lvmp.authservice.model.keycloak.KeycloakUser;
import com.lvmp.authservice.service.UserService;
import com.lvmp.authservice.service.UserService.UserPage;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import org.springframework.grpc.server.service.GrpcService;

@GrpcService
@RequiredArgsConstructor
public class AuthGrpcService extends AuthServiceGrpc.AuthServiceImplBase {
    private final UserService userService;

    @Override
    public void getUser(GetUserRequest request, StreamObserver<User> responseObserver) {
        responseObserver.onNext(toProto(userService.getUser(request.getUserId())));
        responseObserver.onCompleted();
    }

    @Override
    public void listUsers(ListUsersRequest request, StreamObserver<ListUsersResponse> responseObserver) {
        UserPage page = userService.listUsers(request.getOffset(), request.getLimit(), request.getSearch());

        responseObserver.onNext(ListUsersResponse.newBuilder()
            .addAllUsers(page.users().stream().map(AuthGrpcService::toProto).toList())
            .setTotal(page.total())
            .build());
        responseObserver.onCompleted();
    }

    private static User toProto(KeycloakUser user) {
        User.Builder builder = User.newBuilder()
            .setEnabled(Boolean.TRUE.equals(user.enabled()))
            .setEmailVerified(Boolean.TRUE.equals(user.emailVerified()));
        if (user.id() != null) builder.setId(user.id());
        if (user.email() != null) builder.setEmail(user.email());
        if (user.firstName() != null) builder.setFirstName(user.firstName());
        if (user.lastName() != null) builder.setLastName(user.lastName());
        if (user.createdTimestamp() != null) {
            long millis = user.createdTimestamp();
            builder.setCreatedAt(Timestamp.newBuilder()
                .setSeconds(millis / 1000)
                .setNanos((int) (millis % 1000) * 1_000_000));
        }
        return builder.build();
    }
}
