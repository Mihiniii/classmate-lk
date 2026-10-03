package lk.classmate.backend.dto;

import lk.classmate.backend.entity.Attendance;
import lk.classmate.backend.entity.AttendanceStatus;

import java.time.LocalDate;

public record MyAttendanceResponse(Long classId, String subject, LocalDate date, AttendanceStatus status) {
    public static MyAttendanceResponse from(Attendance a) {
        return new MyAttendanceResponse(
                a.getEnrollment().getTuitionClass().getId(),
                a.getEnrollment().getTuitionClass().getSubject(),
                a.getDate(),
                a.getStatus()
        );
    }
}