package com.hasandel01.meetmeoutserver.event.dto;

public record FeeUpdateRequest(
        String feeDescription,
        double feeAmount,
        boolean isFeeRequired
) {
}
