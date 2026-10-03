package lk.classmate.backend.dto;

import jakarta.validation.constraints.*;
import lk.classmate.backend.entity.Role;

public record RegisterRequest(
        @NotBlank String name,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 6) String password,
        @NotNull Role role
) {}