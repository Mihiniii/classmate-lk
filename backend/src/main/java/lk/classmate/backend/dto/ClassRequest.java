package lk.classmate.backend.dto;

import jakarta.validation.constraints.*;

import java.time.DayOfWeek;
import java.time.LocalTime;

public record ClassRequest(
        @NotBlank(message = "Subject is required")
        @Size(max = 100, message = "Subject must be at most 100 characters")
        String subject,

        @NotBlank(message = "Grade is required")
        @Size(max = 50, message = "Grade must be at most 50 characters")
        String grade,

        @NotNull(message = "Day is required")
        DayOfWeek dayOfWeek,

        @NotNull(message = "Start time is required")
        LocalTime startTime,

        @NotNull(message = "End time is required")
        LocalTime endTime,

        @NotNull(message = "Monthly fee is required")
        @Min(value = 0, message = "Monthly fee cannot be negative")
        @Max(value = 1_000_000, message = "Monthly fee cannot be more than 1,000,000")
        Integer monthlyFee
) {}
