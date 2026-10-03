package lk.classmate.backend.repository;

import lk.classmate.backend.entity.TuitionClass;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TuitionClassRepository extends JpaRepository<TuitionClass, Long> {
    List<TuitionClass> findByTeacherIdOrderByDayOfWeekAscStartTimeAsc(Long teacherId);
}