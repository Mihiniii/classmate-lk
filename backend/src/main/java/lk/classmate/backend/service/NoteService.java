package lk.classmate.backend.service;

import lk.classmate.backend.dto.NoteResponse;
import lk.classmate.backend.entity.ClassNote;
import lk.classmate.backend.entity.TuitionClass;
import lk.classmate.backend.entity.User;
import lk.classmate.backend.repository.ClassNoteRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
public class NoteService {

    public static final long MAX_FILE_SIZE = 10 * 1024 * 1024;   // 10 MB
    private static final int MAX_TITLE_LENGTH = 100;
    private static final int MAX_FILE_NAME_LENGTH = 255;
    private static final byte[] PDF_HEADER = "%PDF-".getBytes(StandardCharsets.US_ASCII);

    private final ClassNoteRepository noteRepository;
    private final ClassAccessService classAccess;

    public NoteService(ClassNoteRepository noteRepository, ClassAccessService classAccess) {
        this.noteRepository = noteRepository;
        this.classAccess = classAccess;
    }

    public NoteResponse upload(Long classId, String title, MultipartFile file, String teacherEmail) {
        TuitionClass c = classAccess.findOwnedClass(classId, teacherEmail);

        String cleanTitle = title == null ? "" : title.trim();
        if (cleanTitle.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title is required");
        }
        if (cleanTitle.length() > MAX_TITLE_LENGTH) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Title must be at most " + MAX_TITLE_LENGTH + " characters");
        }
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a PDF file to upload");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is too large (max 10 MB)");
        }

        byte[] data;
        try {
            data = file.getBytes();
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not read the uploaded file");
        }
        // File name eka ho content type eka wishwasa karanne naha - file eke palamu bytes balanawa
        if (!isPdf(data)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PDF files can be uploaded");
        }

        ClassNote n = new ClassNote();
        n.setTuitionClass(c);
        n.setTitle(cleanTitle);
        n.setFileName(cleanFileName(file.getOriginalFilename()));
        n.setFileSize((long) data.length);
        n.setData(data);
        return NoteResponse.from(noteRepository.save(n));
    }

    public List<NoteResponse> getForClass(Long classId, String email) {
        classAccess.findReadableClass(classId, email);
        return noteRepository.findSummariesByClassId(classId);
    }

    public List<NoteResponse> getMine(String studentEmail) {
        User student = classAccess.findUser(studentEmail);
        return noteRepository.findSummariesByStudentId(student.getId());
    }

    public ClassNote getFile(Long classId, Long noteId, String email) {
        classAccess.findReadableClass(classId, email);
        return findNote(classId, noteId);
    }

    public void delete(Long classId, Long noteId, String teacherEmail) {
        classAccess.findOwnedClass(classId, teacherEmail);
        noteRepository.delete(findNote(classId, noteId));
    }

    private ClassNote findNote(Long classId, Long noteId) {
        return noteRepository.findByIdAndTuitionClassId(noteId, classId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Note not found"));
    }

    private boolean isPdf(byte[] data) {
        if (data.length < PDF_HEADER.length) return false;
        for (int i = 0; i < PDF_HEADER.length; i++) {
            if (data[i] != PDF_HEADER[i]) return false;
        }
        return true;
    }

    // "C:\Users\me\lesson 3.pdf" -> "lesson 3.pdf" (path eka saha control characters ain karanawa)
    private String cleanFileName(String original) {
        String name = original == null ? "" : original;
        name = name.substring(Math.max(name.lastIndexOf('/'), name.lastIndexOf('\\')) + 1);
        name = name.replaceAll("\\p{Cntrl}", "").trim();
        if (name.toLowerCase().endsWith(".pdf")) {
            name = name.substring(0, name.length() - 4);
        }
        if (name.isBlank()) name = "notes";
        if (name.length() > MAX_FILE_NAME_LENGTH - 4) name = name.substring(0, MAX_FILE_NAME_LENGTH - 4);
        return name + ".pdf";
    }
}
