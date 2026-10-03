package lk.classmate.backend.controller;

import jakarta.validation.Valid;
import lk.classmate.backend.dto.ClassRequest;
import lk.classmate.backend.dto.ClassResponse;
import lk.classmate.backend.service.TuitionClassService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classes")
public class TuitionClassController {

    private final TuitionClassService classService;

    public TuitionClassController(TuitionClassService classService) {
        this.classService = classService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClassResponse create(@Valid @RequestBody ClassRequest req, @AuthenticationPrincipal Jwt jwt) {
        return classService.create(req, jwt.getSubject());
    }

    @GetMapping
    public List<ClassResponse> getAll() {
        return classService.getAll();
    }

    @GetMapping("/my")
    public List<ClassResponse> getMine(@AuthenticationPrincipal Jwt jwt) {
        return classService.getMine(jwt.getSubject());
    }

    @GetMapping("/{id}")
    public ClassResponse getById(@PathVariable Long id) {
        return classService.getById(id);
    }

    @PutMapping("/{id}")
    public ClassResponse update(@PathVariable Long id, @Valid @RequestBody ClassRequest req,
                                @AuthenticationPrincipal Jwt jwt) {
        return classService.update(id, req, jwt.getSubject());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        classService.delete(id, jwt.getSubject());
    }
}