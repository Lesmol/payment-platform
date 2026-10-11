package com.lvmp.paymentservice.model.request;

import jakarta.validation.constraints.NotNull;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public record BulkPaymentRequest(@NotNull MultipartFile file, @NotNull UUID sourceAccountId) { }
