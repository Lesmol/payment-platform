package com.lvmp.usermanagement.service;

import com.lvmp.usermanagement.persistence.entity.User;
import com.lvmp.usermanagement.persistence.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    // TODO: role mapping between Keycloak realm roles and this record is still open (ADR 0011)
    static final String DEFAULT_ROLE = "customer";

    private final UserRepository userRepository;

    /** Creates the platform user for a Keycloak user; no-op if it already exists (safe for auth-service retries). */
    @Transactional
    public void createUser(UUID keycloakUserId) {
        if (userRepository.existsById(keycloakUserId)) {
            log.info("User {} already exists, skipping create", keycloakUserId);
            return;
        }

        userRepository.save(User.builder()
            .id(keycloakUserId)
            .role(DEFAULT_ROLE)
            .createdAt(Instant.now())
            .build());
        log.info("Created user {}", keycloakUserId);

        // TODO: write UserRegistered to the outbox in this transaction once the event payload is defined (events.md)
    }
}
