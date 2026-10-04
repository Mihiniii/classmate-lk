package lk.classmate.backend.service;

import lk.classmate.backend.entity.TuitionClass;
import lk.classmate.backend.entity.User;
import lk.classmate.backend.repository.EnrollmentRepository;
import lk.classmate.backend.repository.TuitionClassRepository;
import lk.classmate.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ClassAccessService {

    private final TuitionClassRepository classRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    public ClassAccessService(TuitionClassRepository classRepository, UserRepository userRepository,
                              EnrollmentRepository enrollmentRepository) {
        this.classRepository = classRepository;
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    public TuitionClass findOwnedClass(Long classId, String teacherEmail) {
        TuitionClass c = findClass(classId);
        if (!c.getTeacher().getEmail().equals(teacherEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This is not your class");
        }
        return c;
    }

    // Class eke teacher ta ho e class ekata enroll wela inna student kenekta witharai
    public TuitionClass findReadableClass(Long classId, String email) {
        TuitionClass c = findClass(classId);
        if (c.getTeacher().getEmail().equals(email)) return c;
        User user = findUser(email);
        if (!enrollmentRepository.existsByStudentIdAndTuitionClassId(user.getId(), classId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not in this class");
        }
        return c;
    }

    public User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private TuitionClass findClass(Long classId) {
        return classRepository.findById(classId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Class not found"));
    }
}
