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
@Table(name = "bulk_payment_batch")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkPaymentBatch {
    @Id
    private UUID id;

    @Column(nullable = false, updatable = false, name = "user_id")
    private UUID userId;

    @Column(nullable = false, name = "batch_count")
    private BigInteger batchCount;

    @Column(nullable = false, name = "batch_value")
    private BigInteger batchValue;

    @Column(nullable = false, name = "status")
    private String status;

    @Column(nullable = false, updatable = false, name = "createdAt")
    private Instant createdAt;
}
