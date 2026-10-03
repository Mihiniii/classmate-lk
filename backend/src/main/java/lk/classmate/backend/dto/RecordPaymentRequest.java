package lk.classmate.backend.dto;

import jakarta.validation.constraints.*;
import lk.classmate.backend.entity.PaymentMethod;

public record RecordPaymentRequest(
        @NotNull Long studentId,
        @NotBlank @Pattern(regexp = "\\d{4}-(0[1-9]|1[0-2])", message = "Month must look like 2026-10")
        String month,
        @Min(0) Integer amount,          // optional: nathnam monthly fee eka
        @NotNull PaymentMethod method,
        @Size(max = 200) String note
) {}