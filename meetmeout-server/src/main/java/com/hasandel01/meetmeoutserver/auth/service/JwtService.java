package com.hasandel01.meetmeoutserver.auth.service;

import com.hasandel01.meetmeoutserver.user.model.User;
import io.jsonwebtoken.Claims;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

@Service
public interface JwtService {

    String generateToken(Map<String, Object> claims, UserDetails userDetails);

    <T> T parseToken(String token, Function<Claims, T> claimsResolver);

    String generateToken(User user);

    boolean isTokenValid(String token, UserDetails userDetails);

    boolean isTokenExpired(String token);

    Date getExpiration(String token);

    String getSubject(String token);

    String generateRefreshToken(Map<String, Object> claims, UserDetails userDetails);

    String generateRefreshToken(User user);

}
