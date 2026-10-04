package lk.classmate.backend.controller;

import lk.classmate.backend.dto.NoteResponse;
import lk.classmate.backend.entity.ClassNote;
import lk.classmate.backend.service.NoteService;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    // multipart/form-data: title + file (PDF)
    @PostMapping(value = "/api/classes/{classId}/notes", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public NoteResponse upload(@PathVariable Long classId,
                               @RequestParam(required = false) String title,
                               @RequestParam(required = false) MultipartFile file,
                               @AuthenticationPrincipal Jwt jwt) {
        return noteService.upload(classId, title, file, jwt.getSubject());
    }

    // Class eke teacher ta saha enroll wela inna students lata
    @GetMapping("/api/classes/{classId}/notes")
    public List<NoteResponse> getForClass(@PathVariable Long classId, @AuthenticationPrincipal Jwt jwt) {
        return noteService.getForClass(classId, jwt.getSubject());
    }

    @GetMapping("/api/classes/{classId}/notes/{noteId}/file")
    public ResponseEntity<byte[]> download(@PathVariable Long classId, @PathVariable Long noteId,
                                           @AuthenticationPrincipal Jwt jwt) {
        ClassNote n = noteService.getFile(classId, noteId, jwt.getSubject());
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                        .filename(n.getFileName(), StandardCharsets.UTF_8).build().toString())
                .body(n.getData());
    }

    @DeleteMapping("/api/classes/{classId}/notes/{noteId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long classId, @PathVariable Long noteId,
                       @AuthenticationPrincipal Jwt jwt) {
        noteService.delete(classId, noteId, jwt.getSubject());
    }

    @GetMapping("/api/students/me/notes")
    public List<NoteResponse> myNotes(@AuthenticationPrincipal Jwt jwt) {
        return noteService.getMine(jwt.getSubject());
    }
}
