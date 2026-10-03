package lk.classmate.backend.controller;

import jakarta.validation.Valid;
import lk.classmate.backend.dto.AddStudentRequest;
import lk.classmate.backend.dto.ClassResponse;
import lk.classmate.backend.dto.EnrollmentResponse;
import lk.classmate.backend.service.EnrollmentService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @PostMapping("/api/classes/{classId}/students")
    @ResponseStatus(HttpStatus.CREATED)
    public EnrollmentResponse addStudent(@PathVariable Long classId,
                                         @Valid @RequestBody AddStudentRequest req,
                                         @AuthenticationPrincipal Jwt jwt) {
        return enrollmentService.addStudent(classId, req, jwt.getSubject());
    }

    @GetMapping("/api/classes/{classId}/students")
    public List<EnrollmentResponse> getStudents(@PathVariable Long classId,
                                                @AuthenticationPrincipal Jwt jwt) {
        return enrollmentService.getStudents(classId, jwt.getSubject());
    }

    @DeleteMapping("/api/classes/{classId}/students/{studentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeStudent(@PathVariable Long classId, @PathVariable Long studentId,
                              @AuthenticationPrincipal Jwt jwt) {
        enrollmentService.removeStudent(classId, studentId, jwt.getSubject());
    }

    @GetMapping("/api/students/me/classes")
    public List<ClassResponse> myClasses(@AuthenticationPrincipal Jwt jwt) {
        return enrollmentService.getMyClasses(jwt.getSubject());
    }
}