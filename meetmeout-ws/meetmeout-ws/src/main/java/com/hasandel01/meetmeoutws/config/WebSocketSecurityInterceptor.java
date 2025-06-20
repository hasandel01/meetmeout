package com.hasandel01.meetmeoutws.config;

import com.hasandel01.meetmeoutws.auth.JwtServiceImpl;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.lang.Nullable;
import org.springframework.messaging.Message;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@RequiredArgsConstructor
public class WebSocketSecurityInterceptor implements HandshakeInterceptor {

    private final JwtServiceImpl jwtService;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request,
                                   ServerHttpResponse response,
                                   WebSocketHandler wsHandler,
                                   Map<String, Object> attributes) throws Exception {

        if (!(request instanceof ServletServerHttpRequest servletRequest)) {
            System.out.println("❌ Not a servlet request");
            return false;
        }

        HttpServletRequest httpRequest = servletRequest.getServletRequest();
        Cookie[] cookies = httpRequest.getCookies();

        if (cookies == null) {
            System.out.println("❌ Cookie bulunamadı");
            return false;
        }

        String token = null;
        for (Cookie cookie : cookies) {
            if ("jwt".equals(cookie.getName())) {
                token = cookie.getValue();
                break;
            }
        }

        if (token == null) {
            System.out.println("❌ JWT cookie yok");
            return false;
        }

        try {
            String username = jwtService.getSubject(token);
            attributes.put("username", username);
            System.out.println("✅ WebSocket Cookie JWT doğrulandı: " + username);
            return true;
        } catch (Exception e) {
            System.out.println("❌ JWT geçersiz: " + e.getMessage());
            return false;
        }
    }


    @Override
    public void afterHandshake(ServerHttpRequest request,
                               ServerHttpResponse response,
                               WebSocketHandler wsHandler,
                               Exception exception) {
        //NOTHING
    }
}
