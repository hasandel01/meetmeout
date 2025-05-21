package com.hasandel01.meetmeoutserver.common.config.interceptor;

import com.hasandel01.meetmeoutserver.auth.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.security.Principal;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class AuthHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request,
                                   ServerHttpResponse response,
                                   WebSocketHandler wsHandler,
                                   Map<String, Object> attributes) {

        System.out.println("👉 Interceptor çağrıldı! URI: " + request.getURI());


        String token = null;

        if (request.getURI().getQuery() != null) {
            String query = request.getURI().getQuery();
            for (String param : query.split("&")) {
                if (param.startsWith("token=")) {
                    token = param.split("=")[1];
                    break;
                }
            }
        }

        if (token != null) {
            String username = jwtService.getSubject(token);
            if (username != null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                if (jwtService.isTokenValid(token, userDetails)) {
                    Principal principal = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    attributes.put("principal", principal);
                    System.out.println("✅ WebSocket HTTP handshake authenticated for " + username);
                    return true;
                }
            }
        }

        System.out.println("❌ WebSocket HTTP handshake failed auth");
        return false;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request,
                               ServerHttpResponse response,
                               WebSocketHandler wsHandler,
                               Exception exception) {
        // no-op
    }
}
