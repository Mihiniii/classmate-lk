package lk.classmate.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lk.classmate.backend.entity.AttendanceStatus;

import java.time.LocalDate;
import java.util.List;

public record MarkAttendanceRequest(
        @NotNull(message = "Date is required")
        LocalDate date,

        @NotEmpty(message = "Mark at least one student")
        List<@Valid StudentStatus> records
) {
    public record StudentStatus(
            @NotNull(message = "Student is required") Long studentId,
            @NotNull(message = "Status is required") AttendanceStatus status
    ) {}
}
