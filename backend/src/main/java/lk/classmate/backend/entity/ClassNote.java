package lk.classmate.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

// Class ekakata teacher upload karana PDF note ekak. File eka database ekema thiyenawa (bytea)
@Entity
@Table(name = "class_notes")
@Getter @Setter @NoArgsConstructor
public class ClassNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "class_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private TuitionClass tuitionClass;

    @Column(nullable = false, length = 100)
    private String title;            // e.g. "Organic Chemistry - Lesson 3"

    @Column(nullable = false)
    private String fileName;         // e.g. "lesson-3.pdf"

    @Column(nullable = false)
    private Long fileSize;           // bytes

    @JdbcTypeCode(SqlTypes.VARBINARY)
    @Column(nullable = false)
    private byte[] data;

    @Column(nullable = false)
    private LocalDateTime uploadedAt;

    @PrePersist
    void onCreate() {
        if (uploadedAt == null) uploadedAt = LocalDateTime.now();
    }
}
