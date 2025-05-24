package com.hasandel01.meetmeoutserver.exceptions;

public class RestrictedUserException extends RuntimeException {
    public RestrictedUserException(String message) {
        super(message);
    }
}
