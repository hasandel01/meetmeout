package com.hasandel01.meetmeoutserver.common.config;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.Map;

@Component
public class CustomHandshakeHandler extends DefaultHandshakeHandler {

    @Override
    protected Principal determineUser(ServerHttpRequest request, WebSocketHandler wsHandler, Map<String, Object> attributes) {
        Object principalAttr = attributes.get("principal");

        System.out.println("Handshake user: " + principalAttr);

        if (principalAttr instanceof Principal) {
            return (Principal) principalAttr;
        }
        return null;
    }

}
