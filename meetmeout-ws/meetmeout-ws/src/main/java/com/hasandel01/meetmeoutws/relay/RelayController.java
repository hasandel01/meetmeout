package com.hasandel01.meetmeoutws.relay;

import com.hasandel01.meetmeoutws.notification.dto.NotificationDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal")
@RequiredArgsConstructor
public class RelayController {

    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping("/relay-notification")
    public ResponseEntity<Void> relayNotification(@RequestBody NotificationDTO dto) {
        System.out.println(dto.sender().username() + " -> " + dto.receiver().username()+ ": " + dto.body() );
        messagingTemplate.convertAndSend(
                "/queue/notifications/" + dto.receiver().username(),
                dto
        );

        return ResponseEntity.ok().build();
    }
}
