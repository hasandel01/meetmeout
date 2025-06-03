package com.hasandel01.meetmeoutws.config;

import com.hasandel01.meetmeoutws.auth.JwtServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtServiceImpl jwtService;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*");
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    var authHeaders = accessor.getNativeHeader("Authorization");

                    if (authHeaders != null && !authHeaders.isEmpty()) {
                        String token = authHeaders.get(0).replace("Bearer ", "");
                        try {
                            String username = jwtService.getSubject(token);
                            accessor.setUser(() -> username); // Principal objesi gibi davranır
                            accessor.getSessionAttributes().put("username", username);
                            System.out.println("✅ WebSocket bağlandı: " + username);
                        } catch (Exception e) {
                            System.out.println("❌ Token doğrulama hatası: " + e.getMessage());
                            return null; // bağlantıyı kes
                        }
                    } else {
                        System.out.println("⚠️ Authorization header yok!");
                        return null;
                    }
                }

                return message;
            }
        });
    }
}
