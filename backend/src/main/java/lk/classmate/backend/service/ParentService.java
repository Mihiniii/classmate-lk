package lk.classmate.backend.service;

import lk.classmate.backend.dto.AddParentRequest;
import lk.classmate.backend.dto.UserResponse;
import lk.classmate.backend.entity.ParentLink;
import lk.classmate.backend.entity.Role;
import lk.classmate.backend.entity.User;
import lk.classmate.backend.repository.ParentLinkRepository;
import lk.classmate.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ParentService {

    private final ParentLinkRepository parentLinkRepository;
    private final UserRepository userRepository;
    private final ClassAccessService classAccess;

    public ParentService(ParentLinkRepository parentLinkRepository,
                         UserRepository userRepository,
                         ClassAccessService classAccess) {
        this.parentLinkRepository = parentLinkRepository;
        this.userRepository = userRepository;
        this.classAccess = classAccess;
    }

    // Link eka hadanne student wisin - parent ta thaniyen lamayek add karaganna ba
    public UserResponse addParent(AddParentRequest req, String studentEmail) {
        User student = classAccess.findUser(studentEmail);

        User parent = userRepository.findByEmail(req.parentEmail().trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parent not found"));
        if (parent.getRole() != Role.PARENT) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This user is not a parent");
        }
        if (parentLinkRepository.existsByParentIdAndStudentId(parent.getId(), student.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This parent is already added");
        }

        ParentLink link = new ParentLink();
        link.setParent(parent);
        link.setStudent(student);
        parentLinkRepository.save(link);
        return UserResponse.from(parent);
    }

    public List<UserResponse> getMyParents(String studentEmail) {
        User student = classAccess.findUser(studentEmail);
        return parentLinkRepository.findByStudentIdOrderByParentNameAsc(student.getId())
                .stream().map(l -> UserResponse.from(l.getParent())).toList();
    }

    public void removeParent(Long parentId, String studentEmail) {
        User student = classAccess.findUser(studentEmail);
        ParentLink link = parentLinkRepository.findByParentIdAndStudentId(parentId, student.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parent not found"));
        parentLinkRepository.delete(link);
    }

    public List<UserResponse> getMyChildren(String parentEmail) {
        User parent = classAccess.findUser(parentEmail);
        return parentLinkRepository.findByParentIdOrderByStudentNameAsc(parent.getId())
                .stream().map(l -> UserResponse.from(l.getStudent())).toList();
    }

    // Parent ta balanna puluwan thamange link wela inna lamainge data witharai
    public User findLinkedChild(Long childId, String parentEmail) {
        User parent = classAccess.findUser(parentEmail);
        return parentLinkRepository.findByParentIdAndStudentId(parent.getId(), childId)
                .map(ParentLink::getStudent)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "This is not your child"));
    }
}
