package com.lvmp.paymentservice.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "bulk_payments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkPayment {
    @Id
    private UUID id;

    @Column(nullable = false, updatable = false, name = "batch_id")
    private UUID batchId;

    @Column(nullable = false, updatable = false, name = "payment_type")
    private String paymentType;

    @Column(nullable = false, updatable = false, name = "to_account_number")
    private BigInteger toAccountNumber;

    @Column(nullable = false, updatable = false, name = "from_account_number")
    private BigInteger fromAccountNumber;

    @Column(nullable = false, updatable = false, name = "amount")
    private BigInteger amount;

    @Column(nullable = false, updatable = false, name = "created_at")
    private Instant createdAt;
}
