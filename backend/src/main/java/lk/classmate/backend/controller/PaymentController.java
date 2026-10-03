package lk.classmate.backend.controller;

import jakarta.validation.Valid;
import lk.classmate.backend.dto.ClassPaymentSummary;
import lk.classmate.backend.dto.PaymentResponse;
import lk.classmate.backend.dto.RecordPaymentRequest;
import lk.classmate.backend.service.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/api/classes/{classId}/payments")
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentResponse record(@PathVariable Long classId,
                                  @Valid @RequestBody RecordPaymentRequest req,
                                  @AuthenticationPrincipal Jwt jwt) {
        return paymentService.record(classId, req, jwt.getSubject());
    }

    @GetMapping("/api/classes/{classId}/payments")
    public ClassPaymentSummary summary(@PathVariable Long classId,
                                       @RequestParam String month,
                                       @AuthenticationPrincipal Jwt jwt) {
        return paymentService.summary(classId, month, jwt.getSubject());
    }

    @DeleteMapping("/api/classes/{classId}/payments/{paymentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long classId, @PathVariable Long paymentId,
                       @AuthenticationPrincipal Jwt jwt) {
        paymentService.delete(classId, paymentId, jwt.getSubject());
    }

    @GetMapping("/api/students/me/payments")
    public List<PaymentResponse> myPayments(@AuthenticationPrincipal Jwt jwt) {
        return paymentService.getMine(jwt.getSubject());
    }
}