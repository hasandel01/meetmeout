package com.hasandel01.meetmeoutserver.auth.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ResetPasswordRequest {
    private String password;
    private String resetPasswordToken;
}
