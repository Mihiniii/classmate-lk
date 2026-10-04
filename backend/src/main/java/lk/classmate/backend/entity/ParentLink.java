package lk.classmate.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Parent kenek saha eyage lamaya (student) athara link eka
@Entity
@Table(name = "parent_links",
        uniqueConstraints = @UniqueConstraint(columnNames = {"parent_id", "student_id"}))
@Getter @Setter @NoArgsConstructor
public class ParentLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "parent_id")
    private User parent;

    @ManyToOne(optional = false)
    @JoinColumn(name = "student_id")
    private User student;
}
