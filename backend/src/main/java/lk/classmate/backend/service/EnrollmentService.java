package lk.classmate.backend.service;

import lk.classmate.backend.dto.AddStudentRequest;
import lk.classmate.backend.dto.ClassResponse;
import lk.classmate.backend.dto.EnrollmentResponse;
import lk.classmate.backend.entity.Enrollment;
import lk.classmate.backend.entity.Role;
import lk.classmate.backend.entity.TuitionClass;
import lk.classmate.backend.entity.User;
import lk.classmate.backend.repository.EnrollmentRepository;
import lk.classmate.backend.repository.TuitionClassRepository;
import lk.classmate.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;

@Service
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final TuitionClassRepository classRepository;
    private final UserRepository userRepository;

    public EnrollmentService(EnrollmentRepository enrollmentRepository,
                             TuitionClassRepository classRepository,
                             UserRepository userRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.classRepository = classRepository;
        this.userRepository = userRepository;
    }

    // Teacher: student kenek class ekata add karanna
    public EnrollmentResponse addStudent(Long classId, AddStudentRequest req, String teacherEmail) {
        TuitionClass c = findOwnedClass(classId, teacherEmail);

        User student = userRepository.findByEmail(req.studentEmail().trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
        if (student.getRole() != Role.STUDENT) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This user is not a student");
        }
        if (enrollmentRepository.existsByStudentIdAndTuitionClassId(student.getId(), classId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Student is already in this class");
        }

        Enrollment e = new Enrollment();
        e.setStudent(student);
        e.setTuitionClass(c);
        return EnrollmentResponse.from(enrollmentRepository.save(e));
    }

    // Teacher: class eke students la
    public List<EnrollmentResponse> getStudents(Long classId, String teacherEmail) {
        findOwnedClass(classId, teacherEmail);
        return enrollmentRepository.findByTuitionClassIdOrderByStudentNameAsc(classId)
                .stream().map(EnrollmentResponse::from).toList();
    }

    // Teacher: student wa class eken ain karanna
    public void removeStudent(Long classId, Long studentId, String teacherEmail) {
        findOwnedClass(classId, teacherEmail);
        Enrollment e = enrollmentRepository.findByStudentIdAndTuitionClassId(studentId, classId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student is not in this class"));
        enrollmentRepository.delete(e);
    }

    // Student: mage classes
    public List<ClassResponse> getMyClasses(String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        return enrollmentRepository.findByStudentId(student.getId()).stream()
                .map(Enrollment::getTuitionClass)
                .sorted(Comparator.comparing(TuitionClass::getDayOfWeek)
                        .thenComparing(TuitionClass::getStartTime))
                .map(ClassResponse::from)
                .toList();
    }

    // ---- helper ----
    private TuitionClass findOwnedClass(Long classId, String teacherEmail) {
        TuitionClass c = classRepository.findById(classId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Class not found"));
        if (!c.getTeacher().getEmail().equals(teacherEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This is not your class");
        }
        return c;
    }
}