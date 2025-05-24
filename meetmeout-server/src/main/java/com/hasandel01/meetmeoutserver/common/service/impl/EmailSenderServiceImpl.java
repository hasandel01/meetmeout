package com.hasandel01.meetmeoutserver.common.service.impl;


import com.hasandel01.meetmeoutserver.common.service.EmailSenderService;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class EmailSenderServiceImpl implements EmailSenderService {

    private final JavaMailSender javaMailSender;

    public void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        message.setFrom("apolarbear01@gmail.com");

        javaMailSender.send(message);

    }
}
