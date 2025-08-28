package kr.ddm.civic.civicdraft;

import kr.ddm.civic.civicdraft.service.ChannelClassifierService;
import kr.ddm.civic.civicdraft.dto.Issue;
import kr.ddm.civic.civicdraft.dto.RecommendationResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class ChannelClassifierServiceTest {

    @Autowired
    private ChannelClassifierService channelClassifierService;

    @Test
    public void testChannelRecommendation() {
        Issue issue = new Issue();
        issue.setSummary("이문로 불법주정차로 인한 교통체증 신고, 사진 2장 첨부");

        RecommendationResponse response = channelClassifierService.recommend(issue);

        assertNotNull(response);
        assertNotNull(response.getRecommendedChannel());
        assertNotNull(response.getOptions());
        assertTrue(response.getOptions().size() > 0);
    }

    @Test
    public void testSafetyReportRecommendation() {
        Issue issue = new Issue();
        issue.setSummary("위험한 불법주정차 사고 발생");

        RecommendationResponse response = channelClassifierService.recommend(issue);

        assertNotNull(response);
        assertEquals("safety_report", response.getRecommendedChannel());
    }

    @Test
    public void testMayorBoardRecommendation() {
        Issue issue = new Issue();
        issue.setSummary("신호주기 개선 및 좌회전 분리 요청");

        RecommendationResponse response = channelClassifierService.recommend(issue);

        assertNotNull(response);
        assertEquals("mayor_board", response.getRecommendedChannel());
    }

    @Test
    public void testSaeolRecommendation() {
        Issue issue = new Issue();
        issue.setSummary("도로점용허가 정보공개 청구");

        RecommendationResponse response = channelClassifierService.recommend(issue);

        assertNotNull(response);
        assertEquals("saeol", response.getRecommendedChannel());
    }
}