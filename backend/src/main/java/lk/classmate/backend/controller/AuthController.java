package lk.classmate.backend.controller;

import jakarta.validation.Valid;
import lk.classmate.backend.dto.*;
import lk.classmate.backend.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(@Valid @RequestBody RegisterRequest req) {
        return authService.register(req);
    }

    @PostMapping("/login")
    public UserResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }
}