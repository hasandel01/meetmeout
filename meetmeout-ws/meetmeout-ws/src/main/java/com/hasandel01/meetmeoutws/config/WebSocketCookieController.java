package com.hasandel01.meetmeoutws.config;

import com.hasandel01.meetmeoutws.auth.JwtServiceImpl;
import com.hasandel01.meetmeoutws.user.User;
import com.hasandel01.meetmeoutws.user.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@RestController
@RequestMapping("/ws-cookie")
@RequiredArgsConstructor
public class WebSocketCookieController {

    private final JwtServiceImpl jwtService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Void> setWebSocketCookie(@RequestParam("username") String username,
                                                   HttpServletResponse response) {

        User user = userRepository.findByUsername(username).orElseThrow(
                () -> new IllegalArgumentException("Invalid username: " + username)
        );

        String wsJwt = jwtService.generateToken(user);

        ResponseCookie cookie = ResponseCookie.from("jwt", wsJwt)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/")
                .maxAge(Duration.ofMinutes(10))
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        System.out.println("✅ jwt cookie set for user: " + username);
        return ResponseEntity.ok().build();
    }
}
