package com.hasandel01.meetmeoutserver.event.exception;


import com.hasandel01.meetmeoutserver.exceptions.EventNotFoundException;
import com.hasandel01.meetmeoutserver.exceptions.RestrictedUserException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.io.IOException;

@RestControllerAdvice
public class EventExceptionHandler {

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<String> handleUsernameNotFoundException(UsernameNotFoundException e) {
        return ResponseEntity.status(404).body("User not found");
    }

    @ExceptionHandler(IOException.class)
    public ResponseEntity<String> handleIOException(IOException e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal server error");
    }

    @ExceptionHandler(EventNotFoundException.class)
    public ResponseEntity<String> handleEventNotFoundException(EventNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    }

    @ExceptionHandler(RestrictedUserException.class)
    public ResponseEntity<String> handleRestrictedUserException(RestrictedUserException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal server error");
    }

}
