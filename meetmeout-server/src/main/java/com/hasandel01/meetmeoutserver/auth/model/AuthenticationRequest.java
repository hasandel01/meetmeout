package com.hasandel01.meetmeoutserver.auth.model;


import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthenticationRequest {

    private String username;

    private String password;
}
