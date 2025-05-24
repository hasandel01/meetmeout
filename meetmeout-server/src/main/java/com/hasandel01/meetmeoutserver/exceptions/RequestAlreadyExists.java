package com.hasandel01.meetmeoutserver.exceptions;

public class RequestAlreadyExists extends RuntimeException {
    public RequestAlreadyExists(String message) {
        super(message);
    }
}
