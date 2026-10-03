package lk.classmate.backend.repository;

import lk.classmate.backend.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findByEnrollmentIdAndDate(Long enrollmentId, LocalDate date);
    List<Attendance> findByEnrollmentTuitionClassIdAndDate(Long classId, LocalDate date);
    List<Attendance> findByEnrollmentStudentIdOrderByDateDesc(Long studentId);
}