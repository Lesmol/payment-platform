package com.lvmp.authservice.config.clients;

import com.lvmp.usermanagement.grpc.v1.UserManagementServiceGrpc;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.grpc.client.GrpcChannelFactory;

@Configuration
public class GrpcClientConfig {

    // Channel "user-management" is configured under spring.grpc.client.channel
    @Bean
    UserManagementServiceGrpc.UserManagementServiceBlockingStub userManagementStub(GrpcChannelFactory channels) {
        return UserManagementServiceGrpc.newBlockingStub(channels.createChannel("user-management"));
    }
}
