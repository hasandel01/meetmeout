package com.hasandel01.meetmeoutserver.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class EventFullException extends RuntimeException {
    public EventFullException(String message) {
        super(message);
    }
}
