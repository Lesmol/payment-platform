package com.lvmp.authservice.service;

import com.lvmp.authservice.model.keycloak.KeycloakUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    public static final int MAX_PAGE_SIZE = 100;

    private final KeycloakService keycloakService;

    public KeycloakUser getUser(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("user_id is required");
        }
        return keycloakService.getUser(userId);
    }

    public UserPage listUsers(int offset, int limit, String search) {
        if (offset < 0) {
            throw new IllegalArgumentException("offset must not be negative");
        }
        int pageSize = limit <= 0 ? MAX_PAGE_SIZE : Math.min(limit, MAX_PAGE_SIZE);
        return new UserPage(keycloakService.listUsers(offset, pageSize, search), keycloakService.countUsers(search));
    }

    public record UserPage(List<KeycloakUser> users, int total) { }
}
