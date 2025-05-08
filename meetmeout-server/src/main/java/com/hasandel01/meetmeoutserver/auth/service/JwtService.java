package com.hasandel01.meetmeoutserver.auth.service;

import com.hasandel01.meetmeoutserver.user.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String SECRET;

    @Value("${jwt.expiration}")
    private Long EXPIRATION;

    @Value("${jwt.refresh.expiration}")
    private Long REFRESH_EXPIRATION;

    public String generateToken(Map<String, Object> claims, UserDetails userDetails)  {

        return Jwts.builder()
                .claims(claims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(getKey(), Jwts.SIG.HS256)
                .compact();
    }

    private SecretKey getKey() {
        byte [] keyBytes = Base64.getDecoder().decode(SECRET);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public <T> T parseToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(User user) {
        return generateToken(new HashMap<>(), user);
    }


    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String subject = parseToken(token, Claims::getSubject);
        return subject.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    public boolean isTokenExpired(String token) {
        return getExpiration(token).before(new Date());
    }

    public Date getExpiration(String token) {
        return parseToken(token, Claims::getExpiration);
    }

    public Date getIssuedAt(String token) {
        return parseToken(token, Claims::getIssuedAt);
    }

    public String getSubject(String token) {
        return parseToken(token, Claims::getSubject);
    }

    public String generateRefreshToken(Map<String, Object> claims, UserDetails userDetails) {

        return Jwts.builder()
                .claims(claims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + REFRESH_EXPIRATION))
                .signWith(getKey(), Jwts.SIG.HS256)
                .compact();

    }

    public String generateRefreshToken(User user) {
        return generateRefreshToken(new HashMap<>(), user);
    }

}
