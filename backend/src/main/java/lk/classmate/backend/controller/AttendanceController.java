package lk.classmate.backend.controller;

import jakarta.validation.Valid;
import lk.classmate.backend.dto.ClassAttendanceResponse;
import lk.classmate.backend.dto.MarkAttendanceRequest;
import lk.classmate.backend.dto.MyAttendanceResponse;
import lk.classmate.backend.service.AttendanceService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping("/api/classes/{classId}/attendance")
    public ClassAttendanceResponse mark(@PathVariable Long classId,
                                        @Valid @RequestBody MarkAttendanceRequest req,
                                        @AuthenticationPrincipal Jwt jwt) {
        return attendanceService.mark(classId, req, jwt.getSubject());
    }

    @GetMapping("/api/classes/{classId}/attendance")
    public ClassAttendanceResponse getForDate(@PathVariable Long classId,
                                              @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                                              @AuthenticationPrincipal Jwt jwt) {
        return attendanceService.getForDate(classId, date, jwt.getSubject());
    }

    @GetMapping("/api/students/me/attendance")
    public List<MyAttendanceResponse> myAttendance(@AuthenticationPrincipal Jwt jwt) {
        return attendanceService.getMine(jwt.getSubject());
    }
}