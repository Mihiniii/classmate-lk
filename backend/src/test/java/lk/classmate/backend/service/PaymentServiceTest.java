package lk.classmate.backend.service;

import lk.classmate.backend.dto.PaymentResponse;
import lk.classmate.backend.dto.RecordPaymentRequest;
import lk.classmate.backend.entity.*;
import lk.classmate.backend.repository.EnrollmentRepository;
import lk.classmate.backend.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    // Bogus (mock) dependencies - database ekak naha
    @Mock PaymentRepository paymentRepository;
    @Mock EnrollmentRepository enrollmentRepository;
    @Mock ClassAccessService classAccess;

    // Test karana real service eka, mocks ekka
    @InjectMocks PaymentService paymentService;

    private static final String TEACHER = "mihini@test.com";
    private TuitionClass chemistry;
    private Enrollment kasunInChemistry;

    @BeforeEach
    void setUp() {
        // Hama test ekakatama kalin: Chemistry class + Kasun enroll wela
        User kasun = new User();
        kasun.setName("Kasun");
        kasun.setEmail("student1@test.com");
        kasun.setRole(Role.STUDENT);

        chemistry = new TuitionClass();
        chemistry.setSubject("Chemistry");
        chemistry.setMonthlyFee(5000);

        kasunInChemistry = new Enrollment();
        kasunInChemistry.setStudent(kasun);
        kasunInChemistry.setTuitionClass(chemistry);

        when(classAccess.findOwnedClass(1L, TEACHER)).thenReturn(chemistry);
    }

    @Test
    void record_usesClassFee_whenAmountIsMissing() {
        // Given (sudanam karanawa)
        when(enrollmentRepository.findByStudentIdAndTuitionClassId(2L, 1L))
                .thenReturn(Optional.of(kasunInChemistry));
        when(paymentRepository.existsByEnrollmentIdAndMonth(any(), eq("2026-10"))).thenReturn(false);
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        var req = new RecordPaymentRequest(2L, "2026-10", null, PaymentMethod.CASH, null);

        // When (wada eka karanawa)
        PaymentResponse res = paymentService.record(1L, req, TEACHER);

        // Then (result eka check karanawa)
        assertEquals(5000, res.amount());
        assertEquals("2026-10", res.month());
        verify(paymentRepository).save(any(Payment.class));
    }

    @Test
    void record_returns409_whenMonthAlreadyPaid() {
        when(enrollmentRepository.findByStudentIdAndTuitionClassId(2L, 1L))
                .thenReturn(Optional.of(kasunInChemistry));
        when(paymentRepository.existsByEnrollmentIdAndMonth(any(), eq("2026-10"))).thenReturn(true);

        var req = new RecordPaymentRequest(2L, "2026-10", null, PaymentMethod.CASH, null);

        var ex = assertThrows(ResponseStatusException.class,
                () -> paymentService.record(1L, req, TEACHER));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        verify(paymentRepository, never()).save(any());   // save wela nathi bawa sure karanawa
    }

    @Test
    void summary_returns400_forInvalidMonth() {
        var ex = assertThrows(ResponseStatusException.class,
                () -> paymentService.summary(1L, "2026-13", TEACHER));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }
}
