package com.hasandel01.meetmeoutserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class MeetMeOutServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(MeetMeOutServerApplication.class, args);
	}

}
