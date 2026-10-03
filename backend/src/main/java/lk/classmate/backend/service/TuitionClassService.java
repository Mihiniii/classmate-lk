package lk.classmate.backend.service;

import lk.classmate.backend.repository.EnrollmentRepository;
import org.springframework.transaction.annotation.Transactional;
import lk.classmate.backend.dto.ClassRequest;
import lk.classmate.backend.dto.ClassResponse;
import lk.classmate.backend.entity.TuitionClass;
import lk.classmate.backend.entity.User;
import lk.classmate.backend.repository.TuitionClassRepository;
import lk.classmate.backend.repository.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TuitionClassService {

    private final TuitionClassRepository classRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    public TuitionClassService(TuitionClassRepository classRepository,
                               UserRepository userRepository,
                               EnrollmentRepository enrollmentRepository) {
        this.classRepository = classRepository;
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    // CREATE
    public ClassResponse create(ClassRequest req, String teacherEmail) {
        validateTimes(req);
        TuitionClass c = new TuitionClass();
        copy(req, c);
        c.setTeacher(findUser(teacherEmail));
        return ClassResponse.from(classRepository.save(c));
    }

    // READ - okkoma
    public List<ClassResponse> getAll() {
        return classRepository.findAll(Sort.by("dayOfWeek", "startTime"))
                .stream().map(ClassResponse::from).toList();
    }

    // READ - mage classes
    public List<ClassResponse> getMine(String teacherEmail) {
        User teacher = findUser(teacherEmail);
        return classRepository.findByTeacherIdOrderByDayOfWeekAscStartTimeAsc(teacher.getId())
                .stream().map(ClassResponse::from).toList();
    }

    // READ - ekak
    public ClassResponse getById(Long id) {
        return ClassResponse.from(findClass(id));
    }

    // UPDATE
    public ClassResponse update(Long id, ClassRequest req, String teacherEmail) {
        validateTimes(req);
        TuitionClass c = findClass(id);
        checkOwner(c, teacherEmail);
        copy(req, c);
        return ClassResponse.from(classRepository.save(c));
    }

    // DELETE
    @Transactional
    public void delete(Long id, String teacherEmail) {
        TuitionClass c = findClass(id);
        checkOwner(c, teacherEmail);
        enrollmentRepository.deleteAll(enrollmentRepository.findByTuitionClassId(id));
        classRepository.delete(c);
    }

    // ---- helpers ----
    private void copy(ClassRequest req, TuitionClass c) {
        c.setSubject(req.subject().trim());
        c.setGrade(req.grade().trim());
        c.setDayOfWeek(req.dayOfWeek());
        c.setStartTime(req.startTime());
        c.setEndTime(req.endTime());
        c.setMonthlyFee(req.monthlyFee());
    }

    private void validateTimes(ClassRequest req) {
        if (!req.endTime().isAfter(req.startTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time");
        }
    }

    private TuitionClass findClass(Long id) {
        return classRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Class not found"));
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private void checkOwner(TuitionClass c, String teacherEmail) {
        if (!c.getTeacher().getEmail().equals(teacherEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only change your own classes");
        }
    }
}