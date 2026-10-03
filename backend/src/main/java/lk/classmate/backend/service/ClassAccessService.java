package lk.classmate.backend.service;

import lk.classmate.backend.entity.TuitionClass;
import lk.classmate.backend.entity.User;
import lk.classmate.backend.repository.TuitionClassRepository;
import lk.classmate.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ClassAccessService {

    private final TuitionClassRepository classRepository;
    private final UserRepository userRepository;

    public ClassAccessService(TuitionClassRepository classRepository, UserRepository userRepository) {
        this.classRepository = classRepository;
        this.userRepository = userRepository;
    }

    public TuitionClass findOwnedClass(Long classId, String teacherEmail) {
        TuitionClass c = classRepository.findById(classId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Class not found"));
        if (!c.getTeacher().getEmail().equals(teacherEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This is not your class");
        }
        return c;
    }

    public User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }
}