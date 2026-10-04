package lk.classmate.backend.service;

import lk.classmate.backend.dto.AddParentRequest;
import lk.classmate.backend.entity.ParentLink;
import lk.classmate.backend.entity.Role;
import lk.classmate.backend.entity.User;
import lk.classmate.backend.repository.ParentLinkRepository;
import lk.classmate.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ParentServiceTest {

    @Mock ParentLinkRepository parentLinkRepository;
    @Mock UserRepository userRepository;
    @Mock ClassAccessService classAccess;

    @InjectMocks ParentService parentService;

    private static final String STUDENT = "student1@test.com";
    private static final String PARENT = "parent1@test.com";
    private User kasun;
    private User nimal;

    @BeforeEach
    void setUp() {
        // Kasun (student) saha eyage thaththa Nimal (parent)
        kasun = user(2L, "Kasun", STUDENT, Role.STUDENT);
        nimal = user(3L, "Nimal", PARENT, Role.PARENT);
    }

    @Test
    void addParent_savesLink_forParentAccount() {
        when(classAccess.findUser(STUDENT)).thenReturn(kasun);
        when(userRepository.findByEmail(PARENT)).thenReturn(Optional.of(nimal));
        when(parentLinkRepository.existsByParentIdAndStudentId(3L, 2L)).thenReturn(false);

        var res = parentService.addParent(new AddParentRequest(" Parent1@Test.com "), STUDENT);

        assertEquals("Nimal", res.name());
        verify(parentLinkRepository).save(any(ParentLink.class));
    }

    @Test
    void addParent_returns400_whenUserIsNotAParent() {
        User teacher = user(1L, "Mihini", "mihini@test.com", Role.TEACHER);
        when(classAccess.findUser(STUDENT)).thenReturn(kasun);
        when(userRepository.findByEmail("mihini@test.com")).thenReturn(Optional.of(teacher));

        var ex = assertThrows(ResponseStatusException.class,
                () -> parentService.addParent(new AddParentRequest("mihini@test.com"), STUDENT));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(parentLinkRepository, never()).save(any());
    }

    @Test
    void addParent_returns409_whenAlreadyLinked() {
        when(classAccess.findUser(STUDENT)).thenReturn(kasun);
        when(userRepository.findByEmail(PARENT)).thenReturn(Optional.of(nimal));
        when(parentLinkRepository.existsByParentIdAndStudentId(3L, 2L)).thenReturn(true);

        var ex = assertThrows(ResponseStatusException.class,
                () -> parentService.addParent(new AddParentRequest(PARENT), STUDENT));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        verify(parentLinkRepository, never()).save(any());
    }

    @Test
    void findLinkedChild_returnsChild_whenLinked() {
        ParentLink link = new ParentLink();
        link.setParent(nimal);
        link.setStudent(kasun);
        when(classAccess.findUser(PARENT)).thenReturn(nimal);
        when(parentLinkRepository.findByParentIdAndStudentId(3L, 2L)).thenReturn(Optional.of(link));

        assertSame(kasun, parentService.findLinkedChild(2L, PARENT));
    }

    @Test
    void findLinkedChild_returns403_forSomeoneElsesChild() {
        when(classAccess.findUser(PARENT)).thenReturn(nimal);
        when(parentLinkRepository.findByParentIdAndStudentId(3L, 99L)).thenReturn(Optional.empty());

        var ex = assertThrows(ResponseStatusException.class,
                () -> parentService.findLinkedChild(99L, PARENT));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    private static User user(Long id, String name, String email, Role role) {
        User u = new User();
        u.setId(id);
        u.setName(name);
        u.setEmail(email);
        u.setRole(role);
        return u;
    }
}
