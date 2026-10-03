package lk.classmate.backend.service;

import lk.classmate.backend.dto.*;
import lk.classmate.backend.entity.*;
import lk.classmate.backend.repository.EnrollmentRepository;
import lk.classmate.backend.repository.PaymentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private static final String MONTH_PATTERN = "\\d{4}-(0[1-9]|1[0-2])";

    private final PaymentRepository paymentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ClassAccessService classAccess;

    public PaymentService(PaymentRepository paymentRepository,
                          EnrollmentRepository enrollmentRepository,
                          ClassAccessService classAccess) {
        this.paymentRepository = paymentRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.classAccess = classAccess;
    }

    public PaymentResponse record(Long classId, RecordPaymentRequest req, String teacherEmail) {
        TuitionClass c = classAccess.findOwnedClass(classId, teacherEmail);

        Enrollment e = enrollmentRepository.findByStudentIdAndTuitionClassId(req.studentId(), classId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Student is not in this class"));

        if (paymentRepository.existsByEnrollmentIdAndMonth(e.getId(), req.month())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This month is already paid");
        }

        Payment p = new Payment();
        p.setEnrollment(e);
        p.setMonth(req.month());
        p.setAmount(req.amount() != null ? req.amount() : c.getMonthlyFee());
        p.setMethod(req.method());
        p.setNote(req.note());
        return PaymentResponse.from(paymentRepository.save(p));
    }

    public ClassPaymentSummary summary(Long classId, String month, String teacherEmail) {
        TuitionClass c = classAccess.findOwnedClass(classId, teacherEmail);
        if (month == null || !month.matches(MONTH_PATTERN)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Month must look like 2026-10");
        }

        Map<Long, Payment> paidByEnrollment = paymentRepository
                .findByEnrollmentTuitionClassIdAndMonth(classId, month).stream()
                .collect(Collectors.toMap(p -> p.getEnrollment().getId(), Function.identity()));

        List<PaymentRow> rows = enrollmentRepository.findByTuitionClassIdOrderByStudentNameAsc(classId)
                .stream()
                .map(e -> {
                    Payment p = paidByEnrollment.get(e.getId());
                    return p == null
                            ? new PaymentRow(e.getStudent().getId(), e.getStudent().getName(), false, null, null, null, null)
                            : new PaymentRow(e.getStudent().getId(), e.getStudent().getName(), true,
                            p.getId(), p.getAmount(), p.getMethod(), p.getPaidAt());
                })
                .toList();

        int paidCount = (int) rows.stream().filter(PaymentRow::paid).count();
        int collected = rows.stream().filter(PaymentRow::paid).mapToInt(PaymentRow::amount).sum();

        return new ClassPaymentSummary(
                c.getId(), c.getSubject(), month, c.getMonthlyFee(),
                paidCount, rows.size() - paidCount,
                collected, c.getMonthlyFee() * rows.size(),
                rows
        );
    }

    public void delete(Long classId, Long paymentId, String teacherEmail) {
        classAccess.findOwnedClass(classId, teacherEmail);
        Payment p = paymentRepository.findByIdAndEnrollmentTuitionClassId(paymentId, classId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));
        paymentRepository.delete(p);
    }

    public List<PaymentResponse> getMine(String studentEmail) {
        User student = classAccess.findUser(studentEmail);
        return paymentRepository.findByEnrollmentStudentIdOrderByMonthDesc(student.getId())
                .stream().map(PaymentResponse::from).toList();
    }
}