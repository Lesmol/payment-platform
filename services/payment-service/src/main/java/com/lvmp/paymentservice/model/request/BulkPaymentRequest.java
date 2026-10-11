package com.lvmp.paymentservice.model.request;

import com.lvmp.paymentservice.validation.ValidCsvFile;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public record BulkPaymentRequest(@ValidCsvFile MultipartFile file, @NotNull UUID sourceAccountId) { }
