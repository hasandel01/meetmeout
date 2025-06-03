package com.hasandel01.meetmeoutws.auth;

import io.jsonwebtoken.Claims;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.function.Function;

@Service
public interface JwtService {

    <T> T parseToken(String token, Function<Claims, T> claimsResolver);

    Date getExpiration(String token);

    String getSubject(String token);

}
