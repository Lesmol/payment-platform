package com.lvmp.paymentservice.persistence.repository;

import com.lvmp.paymentservice.persistence.entity.BulkPaymentBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BulkPaymentBatchRepository extends JpaRepository<BulkPaymentBatch, UUID> {
    Optional<List<BulkPaymentBatch>> findAllByUserId(UUID userId);
}
