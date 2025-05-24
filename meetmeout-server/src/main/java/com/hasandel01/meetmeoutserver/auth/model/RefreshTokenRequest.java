package com.hasandel01.meetmeoutserver.auth.model;

import lombok.Data;

@Data
public class RefreshTokenRequest {
    private String refreshToken;
}
