package com.hasandel01.meetmeoutserver.event.dto;

public record CapacityUpdateRequest(
        int maxCapacity,
        boolean isCapacityRequired
) {
}
