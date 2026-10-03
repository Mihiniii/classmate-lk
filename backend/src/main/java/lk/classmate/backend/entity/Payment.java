package lk.classmate.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments",
        uniqueConstraints = @UniqueConstraint(columnNames = {"enrollment_id", "pay_month"}))
@Getter @Setter @NoArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "enrollment_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Enrollment enrollment;

    @Column(name = "pay_month", nullable = false, length = 7)
    private String month;            // "2026-10"

    @Column(nullable = false)
    private Integer amount;          // LKR

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod method;

    private String note;

    @Column(nullable = false)
    private LocalDateTime paidAt;

    @PrePersist
    void onCreate() {
        if (paidAt == null) paidAt = LocalDateTime.now();
    }
}