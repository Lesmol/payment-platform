package com.lvmp.authservice.model.response;

import lombok.Builder;
import tools.jackson.databind.PropertyNamingStrategies;
import tools.jackson.databind.annotation.JsonNaming;

@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record LoginResponse(String accessToken, String refreshToken, long expiresIn, String tokenType) {
}
