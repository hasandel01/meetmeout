package com.hasandel01.meetmeoutserver.common.service;

public interface EmailSenderService {

    void sendEmail(String to, String subject, String body);
}
