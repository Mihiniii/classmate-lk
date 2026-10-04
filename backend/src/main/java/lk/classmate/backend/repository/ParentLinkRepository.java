package lk.classmate.backend.repository;

import lk.classmate.backend.entity.ParentLink;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ParentLinkRepository extends JpaRepository<ParentLink, Long> {
    boolean existsByParentIdAndStudentId(Long parentId, Long studentId);
    Optional<ParentLink> findByParentIdAndStudentId(Long parentId, Long studentId);
    List<ParentLink> findByParentIdOrderByStudentNameAsc(Long parentId);
    List<ParentLink> findByStudentIdOrderByParentNameAsc(Long studentId);
}
