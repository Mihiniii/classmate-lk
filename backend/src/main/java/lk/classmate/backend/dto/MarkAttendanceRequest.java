package lk.classmate.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lk.classmate.backend.entity.AttendanceStatus;

import java.time.LocalDate;
import java.util.List;

public record MarkAttendanceRequest(
        @NotNull LocalDate date,
        @NotEmpty List<@Valid StudentStatus> records
) {
    public record StudentStatus(@NotNull Long studentId, @NotNull AttendanceStatus status) {}
}