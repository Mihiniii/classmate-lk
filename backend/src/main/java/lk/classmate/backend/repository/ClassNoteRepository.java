package lk.classmate.backend.repository;

import lk.classmate.backend.dto.NoteResponse;
import lk.classmate.backend.entity.ClassNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ClassNoteRepository extends JpaRepository<ClassNote, Long> {

    Optional<ClassNote> findByIdAndTuitionClassId(Long id, Long classId);

    // List walata file eke bytes load karanne naha (details witharai)
    @Query("""
            select new lk.classmate.backend.dto.NoteResponse(
                n.id, c.id, c.subject, n.title, n.fileName, n.fileSize, n.uploadedAt)
            from ClassNote n join n.tuitionClass c
            where c.id = :classId
            order by n.uploadedAt desc
            """)
    List<NoteResponse> findSummariesByClassId(@Param("classId") Long classId);

    // Student enroll wela inna classes wala notes
    @Query("""
            select new lk.classmate.backend.dto.NoteResponse(
                n.id, c.id, c.subject, n.title, n.fileName, n.fileSize, n.uploadedAt)
            from ClassNote n join n.tuitionClass c
            where c.id in (select e.tuitionClass.id from Enrollment e where e.student.id = :studentId)
            order by n.uploadedAt desc
            """)
    List<NoteResponse> findSummariesByStudentId(@Param("studentId") Long studentId);
}
