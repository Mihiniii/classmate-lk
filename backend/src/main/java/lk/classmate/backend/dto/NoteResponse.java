package lk.classmate.backend.dto;

import lk.classmate.backend.entity.ClassNote;

import java.time.LocalDateTime;

// File eke bytes methana naha - e tika download endpoint eken witharai
public record NoteResponse(
        Long noteId, Long classId, String subject,
        String title, String fileName, Long fileSize, LocalDateTime uploadedAt
) {
    public static NoteResponse from(ClassNote n) {
        return new NoteResponse(
                n.getId(), n.getTuitionClass().getId(), n.getTuitionClass().getSubject(),
                n.getTitle(), n.getFileName(), n.getFileSize(), n.getUploadedAt()
        );
    }
}
