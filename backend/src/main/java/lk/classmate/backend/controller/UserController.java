package lk.classmate.backend.controller;

import lk.classmate.backend.dto.UserResponse;
import lk.classmate.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Login wela inna kenata witharai
    @GetMapping("/api/users/me")
    public UserResponse me(@AuthenticationPrincipal Jwt jwt) {
        return userRepository.findByEmail(jwt.getSubject())
                .map(UserResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    // TEACHER la witharai
    @GetMapping("/api/teacher/ping")
    public Map<String, String> teacherPing(@AuthenticationPrincipal Jwt jwt) {
        return Map.of("message", "Hello Teacher " + jwt.getSubject());
    }
}