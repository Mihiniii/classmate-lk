package lk.classmate.backend.service;

import lk.classmate.backend.dto.NoteResponse;
import lk.classmate.backend.entity.ClassNote;
import lk.classmate.backend.entity.TuitionClass;
import lk.classmate.backend.repository.ClassNoteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NoteServiceTest {

    @Mock ClassNoteRepository noteRepository;
    @Mock ClassAccessService classAccess;

    @InjectMocks NoteService noteService;

    private static final String TEACHER = "mihini@test.com";
    private static final String STUDENT = "student1@test.com";
    private static final byte[] PDF = "%PDF-1.7 test".getBytes(StandardCharsets.US_ASCII);

    @BeforeEach
    void setUp() {
        TuitionClass chemistry = new TuitionClass();
        chemistry.setSubject("Chemistry");
        lenient().when(classAccess.findOwnedClass(1L, TEACHER)).thenReturn(chemistry);
    }

    @Test
    void upload_savesPdf_withCleanFileName() {
        when(noteRepository.save(any(ClassNote.class))).thenAnswer(inv -> inv.getArgument(0));
        var file = new MockMultipartFile("file", "C:\\Users\\me\\lesson 3.PDF", "application/pdf", PDF);

        NoteResponse res = noteService.upload(1L, "  Lesson 3  ", file, TEACHER);

        assertEquals("Lesson 3", res.title());
        assertEquals("lesson 3.pdf", res.fileName());
        assertEquals(PDF.length, res.fileSize());
        assertEquals("Chemistry", res.subject());
    }

    @Test
    void upload_returns400_whenFileIsNotAPdf() {
        // Nama saha content type eka PDF wage unath athule thiyenne wena deyak
        var file = new MockMultipartFile("file", "virus.pdf", "application/pdf",
                "MZ not a pdf".getBytes(StandardCharsets.US_ASCII));

        var ex = assertThrows(ResponseStatusException.class,
                () -> noteService.upload(1L, "Lesson 3", file, TEACHER));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(noteRepository, never()).save(any());
    }

    @Test
    void upload_returns400_whenTitleIsBlank() {
        var file = new MockMultipartFile("file", "lesson.pdf", "application/pdf", PDF);

        var ex = assertThrows(ResponseStatusException.class,
                () -> noteService.upload(1L, "   ", file, TEACHER));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(noteRepository, never()).save(any());
    }

    @Test
    void upload_returns400_whenFileIsMissing() {
        var ex = assertThrows(ResponseStatusException.class,
                () -> noteService.upload(1L, "Lesson 3", null, TEACHER));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void getFile_returns403_whenStudentIsNotInTheClass() {
        when(classAccess.findReadableClass(1L, STUDENT))
                .thenThrow(new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not in this class"));

        var ex = assertThrows(ResponseStatusException.class,
                () -> noteService.getFile(1L, 5L, STUDENT));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(noteRepository, never()).findByIdAndTuitionClassId(any(), any());
    }
}
