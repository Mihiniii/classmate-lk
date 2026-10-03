package lk.classmate.backend.dto;

import lk.classmate.backend.entity.TuitionClass;

import java.time.DayOfWeek;
import java.time.LocalTime;

public record ClassResponse(
        Long id,
        String subject,
        String grade,
        DayOfWeek dayOfWeek,
        LocalTime startTime,
        LocalTime endTime,
        Integer monthlyFee,
        Long teacherId,
        String teacherName
) {
    public static ClassResponse from(TuitionClass c) {
        return new ClassResponse(
                c.getId(), c.getSubject(), c.getGrade(), c.getDayOfWeek(),
                c.getStartTime(), c.getEndTime(), c.getMonthlyFee(),
                c.getTeacher().getId(), c.getTeacher().getName()
        );
    }
}
