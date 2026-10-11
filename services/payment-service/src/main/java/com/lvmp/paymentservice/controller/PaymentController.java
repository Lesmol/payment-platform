package com.lvmp.paymentservice.controller;

import com.lvmp.paymentservice.model.request.BulkPaymentRequest;
import com.lvmp.paymentservice.service.BulkPaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.lvmp.paymentservice.model.response.BulkPaymentResponse;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/payment/v1")
@RequiredArgsConstructor
public class PaymentController {
    private final BulkPaymentService bulkPaymentService;

    @PostMapping(value = "/bulk", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BulkPaymentResponse> bulkPayment(@Valid @ModelAttribute BulkPaymentRequest request) {
        return ResponseEntity.ok().body(bulkPaymentService.bulkPayment(request));
    }

}
