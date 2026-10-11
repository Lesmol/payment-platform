package com.lvmp.paymentservice.model.response;

import lombok.Builder;

@Builder
public record ErrorResponse(String message, String description) { }
