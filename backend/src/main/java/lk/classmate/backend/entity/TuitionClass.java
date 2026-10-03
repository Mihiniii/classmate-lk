package lk.classmate.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "classes")
@Getter @Setter @NoArgsConstructor
public class TuitionClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String subject;          // e.g. "Combined Maths"

    @Column(nullable = false)
    private String grade;            // e.g. "A/L 2027"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DayOfWeek dayOfWeek;     // MONDAY ... SUNDAY

    @Column(nullable = false)
    private LocalTime startTime;     // 16:00

    @Column(nullable = false)
    private LocalTime endTime;       // 18:00

    @Column(nullable = false)
    private Integer monthlyFee;      // LKR

    // Me class eka ayithi teacher (users table ekata link ekak)
    @ManyToOne(optional = false)
    @JoinColumn(name = "teacher_id")
    private User teacher;

    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }
}