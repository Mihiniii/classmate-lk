package lk.classmate.backend.dto;

import lk.classmate.backend.entity.AttendanceStatus;

public record AttendanceRow(Long studentId, String studentName, AttendanceStatus status) {}