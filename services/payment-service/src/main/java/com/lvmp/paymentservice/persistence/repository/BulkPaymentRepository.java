package com.lvmp.paymentservice.persistence.repository;

import com.lvmp.paymentservice.persistence.entity.BulkPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BulkPaymentRepository extends JpaRepository<BulkPayment, UUID> {
    Optional<BulkPayment> getBulkPaymentsByBatchId(UUID batchId);
    Optional<BulkPayment> getBulkPaymentById(UUID id);
}
