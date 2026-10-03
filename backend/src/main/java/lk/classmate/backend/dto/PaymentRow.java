package lk.classmate.backend.dto;

import lk.classmate.backend.entity.PaymentMethod;

import java.time.LocalDateTime;

public record PaymentRow(
        Long studentId, String studentName, boolean paid,
        Long paymentId, Integer amount, PaymentMethod method, LocalDateTime paidAt
) {}