package com.hasandel01.meetmeoutws.auth;

import com.hasandel01.meetmeoutws.user.User;
import io.jsonwebtoken.Claims;
import org.springframework.stereotype.Service;

import java.util.function.Function;

@Service
public interface JwtService {

    <T> T parseToken(String token, Function<Claims, T> claimsResolver);

    String getSubject(String token);

    String generateToken(User user);

}
