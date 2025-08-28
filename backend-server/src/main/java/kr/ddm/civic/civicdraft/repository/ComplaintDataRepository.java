package kr.ddm.civic.civicdraft.repository;

import kr.ddm.civic.civicdraft.model.ComplaintData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface ComplaintDataRepository extends JpaRepository<ComplaintData, Long> {
    List<ComplaintData> findBySystemOrderByCreatedAtDesc(String system);

    List<ComplaintData> findBySystemAndIsPublicOrderByCreatedAtDesc(String system, String isPublic);

    @Modifying
    @Query("UPDATE ComplaintData c SET c.aiImprovedContent = :content WHERE c.id = :id")
    int updateImprovedContent(@Param("id") Long id, @Param("content") String content);
}