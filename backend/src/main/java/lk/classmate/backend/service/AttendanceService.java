package lk.classmate.backend.service;

import lk.classmate.backend.dto.*;
import lk.classmate.backend.entity.*;
import lk.classmate.backend.repository.AttendanceRepository;
import lk.classmate.backend.repository.EnrollmentRepository;
import lk.classmate.backend.repository.TuitionClassRepository;
import lk.classmate.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final TuitionClassRepository classRepository;
    private final UserRepository userRepository;

    public AttendanceService(AttendanceRepository attendanceRepository,
                             EnrollmentRepository enrollmentRepository,
                             TuitionClassRepository classRepository,
                             UserRepository userRepository) {
        this.attendanceRepository = attendanceRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.classRepository = classRepository;
        this.userRepository = userRepository;
    }

    // Teacher: attendance mark karanna (ekama dawasata aye yawwoth update wenawa)
    @Transactional
    public ClassAttendanceResponse mark(Long classId, MarkAttendanceRequest req, String teacherEmail) {
        TuitionClass c = findOwnedClass(classId, teacherEmail);
        if (req.date().isAfter(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot mark attendance for a future date");
        }

        // Me class eke students: studentId -> enrollment
        Map<Long, Enrollment> byStudent = enrollmentRepository.findByTuitionClassId(classId).stream()
                .collect(Collectors.toMap(e -> e.getStudent().getId(), e -> e));

        for (MarkAttendanceRequest.StudentStatus r : req.records()) {
            Enrollment e = byStudent.get(r.studentId());
            if (e == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Student " + r.studentId() + " is not in this class");
            }
            Attendance a = attendanceRepository.findByEnrollmentIdAndDate(e.getId(), req.date())
                    .orElseGet(() -> {
                        Attendance n = new Attendance();
                        n.setEnrollment(e);
                        n.setDate(req.date());
                        return n;
                    });
            a.setStatus(r.status());
            attendanceRepository.save(a);
        }
        return buildClassView(c, req.date());
    }

    // Teacher: ema dawase register eka
    public ClassAttendanceResponse getForDate(Long classId, LocalDate date, String teacherEmail) {
        TuitionClass c = findOwnedClass(classId, teacherEmail);
        return buildClassView(c, date);
    }

    // Student: mage attendance history eka
    public List<MyAttendanceResponse> getMine(String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        return attendanceRepository.findByEnrollmentStudentIdOrderByDateDesc(student.getId())
                .stream().map(MyAttendanceResponse::from).toList();
    }

    // ---- helpers ----
    private ClassAttendanceResponse buildClassView(TuitionClass c, LocalDate date) {
        Map<Long, AttendanceStatus> statusByEnrollment =
                attendanceRepository.findByEnrollmentTuitionClassIdAndDate(c.getId(), date).stream()
                        .collect(Collectors.toMap(a -> a.getEnrollment().getId(), Attendance::getStatus));

        // Class eke hama student ma pennanawa; mark karala nathnam status = null
        List<AttendanceRow> rows = enrollmentRepository.findByTuitionClassIdOrderByStudentNameAsc(c.getId())
                .stream()
                .map(e -> new AttendanceRow(e.getStudent().getId(), e.getStudent().getName(),
                        statusByEnrollment.get(e.getId())))
                .toList();

        return new ClassAttendanceResponse(
                c.getId(), c.getSubject(), date,
                count(rows, AttendanceStatus.PRESENT),
                count(rows, AttendanceStatus.ABSENT),
                count(rows, AttendanceStatus.LATE),
                count(rows, null),
                rows
        );
    }

    private int count(List<AttendanceRow> rows, AttendanceStatus status) {
        return (int) rows.stream().filter(r -> r.status() == status).count();
    }

    private TuitionClass findOwnedClass(Long classId, String teacherEmail) {
        TuitionClass c = classRepository.findById(classId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Class not found"));
        if (!c.getTeacher().getEmail().equals(teacherEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This is not your class");
        }
        return c;
    }
}