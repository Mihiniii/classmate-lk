package lk.classmate.backend.controller;

import jakarta.validation.Valid;
import lk.classmate.backend.dto.AddParentRequest;
import lk.classmate.backend.dto.ClassResponse;
import lk.classmate.backend.dto.MyAttendanceResponse;
import lk.classmate.backend.dto.PaymentResponse;
import lk.classmate.backend.dto.UserResponse;
import lk.classmate.backend.service.AttendanceService;
import lk.classmate.backend.service.EnrollmentService;
import lk.classmate.backend.service.ParentService;
import lk.classmate.backend.service.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ParentController {

    private final ParentService parentService;
    private final EnrollmentService enrollmentService;
    private final AttendanceService attendanceService;
    private final PaymentService paymentService;

    public ParentController(ParentService parentService, EnrollmentService enrollmentService,
                            AttendanceService attendanceService, PaymentService paymentService) {
        this.parentService = parentService;
        this.enrollmentService = enrollmentService;
        this.attendanceService = attendanceService;
        this.paymentService = paymentService;
    }

    // Student: thamange parents la manage karanawa
    @PostMapping("/api/students/me/parents")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse addParent(@Valid @RequestBody AddParentRequest req, @AuthenticationPrincipal Jwt jwt) {
        return parentService.addParent(req, jwt.getSubject());
    }

    @GetMapping("/api/students/me/parents")
    public List<UserResponse> myParents(@AuthenticationPrincipal Jwt jwt) {
        return parentService.getMyParents(jwt.getSubject());
    }

    @DeleteMapping("/api/students/me/parents/{parentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeParent(@PathVariable Long parentId, @AuthenticationPrincipal Jwt jwt) {
        parentService.removeParent(parentId, jwt.getSubject());
    }

    // Parent: link wela inna lamainge data balanawa (read only)
    @GetMapping("/api/parents/me/children")
    public List<UserResponse> myChildren(@AuthenticationPrincipal Jwt jwt) {
        return parentService.getMyChildren(jwt.getSubject());
    }

    @GetMapping("/api/parents/me/children/{childId}/classes")
    public List<ClassResponse> childClasses(@PathVariable Long childId, @AuthenticationPrincipal Jwt jwt) {
        return enrollmentService.getClassesOf(parentService.findLinkedChild(childId, jwt.getSubject()));
    }

    @GetMapping("/api/parents/me/children/{childId}/attendance")
    public List<MyAttendanceResponse> childAttendance(@PathVariable Long childId, @AuthenticationPrincipal Jwt jwt) {
        return attendanceService.getAttendanceOf(parentService.findLinkedChild(childId, jwt.getSubject()));
    }

    @GetMapping("/api/parents/me/children/{childId}/payments")
    public List<PaymentResponse> childPayments(@PathVariable Long childId, @AuthenticationPrincipal Jwt jwt) {
        return paymentService.getPaymentsOf(parentService.findLinkedChild(childId, jwt.getSubject()));
    }
}
