package com.hasandel01.meetmeoutserver.service;


import com.hasandel01.meetmeoutserver.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private UserRepository userRepository;


}
