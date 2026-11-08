package com.lvmp.domaincontracts.events.payment;

import java.time.Instant;
import java.util.UUID;

public record PaymentFailed(UUID eventId, UUID paymentId, Instant occurredAt) {
}
