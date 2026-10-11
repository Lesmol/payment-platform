package com.lvmp.paymentservice.model.response;

import lombok.Builder;

import java.util.List;
import java.util.UUID;

@Builder
public record BulkPaymentResponse(UUID batchId, int totalRows, int validRows, List<RowError> errors) {
    public record RowError(int row, String field, String message) {
    }
}
