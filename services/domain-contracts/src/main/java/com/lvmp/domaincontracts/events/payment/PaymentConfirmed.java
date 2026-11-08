package com.lvmp.domaincontracts.events.payment;

import java.time.Instant;
import java.util.UUID;

public record PaymentConfirmed(UUID eventId, UUID paymentId, Instant occurredAt) {
}
