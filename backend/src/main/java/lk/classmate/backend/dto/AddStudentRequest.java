package lk.classmate.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AddStudentRequest(
        @NotBlank(message = "Student email is required")
        @Email(message = "Enter a valid email address")
        String studentEmail
) {}
