package com.hasandel01.meetmeoutserver.user.exception;


import com.hasandel01.meetmeoutserver.exceptions.UserIsRegisteredException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class UserExceptionHandler {

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<String> handleUsernameNotFoundException(UsernameNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
    }

    @ExceptionHandler(UserIsRegisteredException.class)
    public ResponseEntity<String> handleUserIsRegisteredException(UserIsRegisteredException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    }


}
