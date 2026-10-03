package lk.classmate.backend.dto;

public record AuthResponse(String token, UserResponse user) {}