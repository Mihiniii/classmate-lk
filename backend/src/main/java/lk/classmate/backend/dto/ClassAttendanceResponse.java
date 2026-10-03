package lk.classmate.backend.dto;

import java.time.LocalDate;
import java.util.List;

public record ClassAttendanceResponse(
        Long classId,
        String subject,
        LocalDate date,
        int present,
        int absent,
        int late,
        int notMarked,
        List<AttendanceRow> students
) {}