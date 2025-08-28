package kr.ddm.civic.civicdraft.service;

import org.springframework.stereotype.Service;

@Service
public class ChannelClassifierService {
    public String classify(String issueType) {
        if (issueType.equals("안전")) return "safety_report";
        if (issueType.equals("정책")) return "mayor_board";
        return "saeol";
    }
}
