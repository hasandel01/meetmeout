package com.hasandel01.meetmeoutserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@ComponentScan(basePackages = "com.hasandel01")
@EnableJpaAuditing
@EnableScheduling
public class MeetMeOutServerApplication {

	public static void main(String[] args) {

		SpringApplication.run(MeetMeOutServerApplication.class, args);

	}

}
