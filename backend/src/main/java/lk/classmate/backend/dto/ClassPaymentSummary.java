package lk.classmate.backend.dto;

import java.util.List;

public record ClassPaymentSummary(
        Long classId, String subject, String month, Integer monthlyFee,
        int paidCount, int unpaidCount,
        int collected, int expected,
        List<PaymentRow> students
) {}