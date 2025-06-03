package com.hasandel01.meetmeoutserver.wsrelay;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class WSRelayConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

}
