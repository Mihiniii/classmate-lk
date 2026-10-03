package lk.classmate.backend.dto;

import lk.classmate.backend.entity.Enrollment;

import java.time.LocalDate;

public record EnrollmentResponse(
        Long enrollmentId,
        Long classId,
        String subject,
        Long studentId,
        String studentName,
        String studentEmail,
        LocalDate joinedDate
) {
    public static EnrollmentResponse from(Enrollment e) {
        return new EnrollmentResponse(
                e.getId(),
                e.getTuitionClass().getId(),
                e.getTuitionClass().getSubject(),
                e.getStudent().getId(),
                e.getStudent().getName(),
                e.getStudent().getEmail(),
                e.getJoinedDate()
        );
    }
}