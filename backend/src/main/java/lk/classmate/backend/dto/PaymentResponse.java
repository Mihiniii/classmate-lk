package lk.classmate.backend.dto;

import lk.classmate.backend.entity.Payment;
import lk.classmate.backend.entity.PaymentMethod;

import java.time.LocalDateTime;

public record PaymentResponse(
        Long paymentId, Long classId, String subject,
        Long studentId, String studentName,
        String month, Integer amount, PaymentMethod method, String note, LocalDateTime paidAt
) {
    public static PaymentResponse from(Payment p) {
        var e = p.getEnrollment();
        return new PaymentResponse(
                p.getId(), e.getTuitionClass().getId(), e.getTuitionClass().getSubject(),
                e.getStudent().getId(), e.getStudent().getName(),
                p.getMonth(), p.getAmount(), p.getMethod(), p.getNote(), p.getPaidAt()
        );
    }
}