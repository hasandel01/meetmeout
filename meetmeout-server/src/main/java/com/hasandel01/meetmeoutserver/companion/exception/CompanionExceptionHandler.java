package com.hasandel01.meetmeoutserver.companion.exception;


import com.hasandel01.meetmeoutserver.exceptions.RequestAlreadyExists;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class CompanionExceptionHandler {


    @ExceptionHandler(RequestAlreadyExists.class)
    public ResponseEntity<String> handleRequestAlreadyExists(RequestAlreadyExists e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<String> handleUsernameNotFoundException(UsernameNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    }



}
