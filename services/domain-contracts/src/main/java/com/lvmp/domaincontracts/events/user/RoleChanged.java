package com.lvmp.domaincontracts.events.user;

import java.time.Instant;
import java.util.UUID;

public record RoleChanged(UUID eventId, UUID userId, Instant occurredAt) {
}
