package com.hasandel01.meetmeoutserver.event.dto;

import java.util.Set;

public record TagUpdateRequest(
        Set<String> tags
) {
}
