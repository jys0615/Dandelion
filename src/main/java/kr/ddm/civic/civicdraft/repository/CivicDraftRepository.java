package kr.ddm.civic.civicdraft.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import kr.ddm.civic.civicdraft.model.CivicDraft;

public interface CivicDraftRepository extends JpaRepository<CivicDraft, Long> {
}
