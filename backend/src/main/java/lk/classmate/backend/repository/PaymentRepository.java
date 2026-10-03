package lk.classmate.backend.repository;

import lk.classmate.backend.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    boolean existsByEnrollmentIdAndMonth(Long enrollmentId, String month);
    List<Payment> findByEnrollmentTuitionClassIdAndMonth(Long classId, String month);
    List<Payment> findByEnrollmentStudentIdOrderByMonthDesc(Long studentId);
    Optional<Payment> findByIdAndEnrollmentTuitionClassId(Long id, Long classId);
}