package com.lvmp.paymentservice.service;

import com.lvmp.paymentservice.model.request.BulkPaymentRequest;
import com.lvmp.paymentservice.persistence.repository.BulkPaymentBatchRepository;
import com.lvmp.paymentservice.persistence.repository.BulkPaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.lvmp.paymentservice.model.response.BulkPaymentResponse;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class BulkPaymentService {
    private final BulkPaymentRepository bulkPaymentRepository;
    private final BulkPaymentBatchRepository bulkPaymentBatchRepository;

    public BulkPaymentResponse bulkPayment(BulkPaymentRequest request) {
        return null;
    }
}
