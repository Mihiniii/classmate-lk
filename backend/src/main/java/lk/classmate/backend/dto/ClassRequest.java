package lk.classmate.backend.dto;

import jakarta.validation.constraints.*;

import java.time.DayOfWeek;
import java.time.LocalTime;

public record ClassRequest(
        @NotBlank String subject,
        @NotBlank String grade,
        @NotNull DayOfWeek dayOfWeek,
        @NotNull LocalTime startTime,
        @NotNull LocalTime endTime,
        @NotNull @Min(0) Integer monthlyFee
) {}