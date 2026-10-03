package lk.classmate.backend.dto;

import jakarta.validation.constraints.*;
import lk.classmate.backend.entity.Role;

public record RegisterRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 100, message = "Name must be at most 100 characters")
        String name,

        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email address")
        @Size(max = 255, message = "Email is too long")
        String email,

        // BCrypt eka palamu bytes 72 witharai use karanne
        @NotBlank(message = "Password is required")
        @Size(min = 6, max = 72, message = "Password must be 6 to 72 characters")
        String password,

        @NotNull(message = "Role is required")
        Role role
) {}
