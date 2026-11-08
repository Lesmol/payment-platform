package com.lvmp.domaincontracts.events.payment;

import java.time.Instant;
import java.util.UUID;

public record PaymentReceived(UUID eventId, UUID paymentId, Instant occurredAt) {
}
