package lk.classmate.backend.repository;

import lk.classmate.backend.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    boolean existsByStudentIdAndTuitionClassId(Long studentId, Long classId);
    Optional<Enrollment> findByStudentIdAndTuitionClassId(Long studentId, Long classId);
    List<Enrollment> findByTuitionClassIdOrderByStudentNameAsc(Long classId);
    List<Enrollment> findByStudentId(Long studentId);
    List<Enrollment> findByTuitionClassId(Long classId);
}