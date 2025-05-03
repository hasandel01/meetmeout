package com.hasandel01.meetmeoutserver.interceptor;

import com.hasandel01.meetmeoutserver.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

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
                                   Map<String, Object> attributes) throws Exception {


        if(request instanceof ServletServerHttpRequest servletServerHttpRequest) {
            var params = servletServerHttpRequest.getServletRequest().getParameterMap();

            if(params.containsKey("token")) {
                var token = params.get("token")[0];

                UserDetails userDetails = userDetailsService.loadUserByUsername(jwtService.getSubject(token));

                if (token != null && jwtService.isTokenValid(token, userDetails)) {
                    String username = jwtService.getSubject(token);
                    attributes.put("username", username);
                    return true;
                }
            }

        }

        return false;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request,
                               ServerHttpResponse response,
                               WebSocketHandler wsHandler,
                               Exception exception) {

    }
}
