package lk.classmate.backend.dto;

import jakarta.validation.constraints.*;
import lk.classmate.backend.entity.PaymentMethod;

public record RecordPaymentRequest(
        @NotNull(message = "Student is required")
        Long studentId,

        @NotBlank(message = "Month is required")
        @Pattern(regexp = "\\d{4}-(0[1-9]|1[0-2])", message = "Month must look like 2026-10")
        String month,

        // optional: nathnam monthly fee eka
        @Min(value = 0, message = "Amount cannot be negative")
        @Max(value = 1_000_000, message = "Amount cannot be more than 1,000,000")
        Integer amount,

        @NotNull(message = "Payment method is required")
        PaymentMethod method,

        @Size(max = 200, message = "Note must be at most 200 characters")
        String note
) {}
