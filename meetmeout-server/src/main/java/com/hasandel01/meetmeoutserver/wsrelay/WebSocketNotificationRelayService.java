package com.hasandel01.meetmeoutserver.wsrelay;

import com.hasandel01.meetmeoutserver.notification.dto.NotificationDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebSocketNotificationRelayService {

    private final RestTemplate restTemplate;

    @Value("${ws.server.url}")
    private String wsServerUrl;

    public void send(NotificationDTO dto) {
        try {
            restTemplate.postForEntity(wsServerUrl + "/internal/relay-notification", dto, Void.class);
        } catch (Exception e) {
            log.error("⚠️ WebSocket sunucusuna bildirim iletilemedi: {}", e.getMessage());
        }
    }
}
