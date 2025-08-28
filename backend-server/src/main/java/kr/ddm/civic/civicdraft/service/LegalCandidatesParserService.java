package kr.ddm.civic.civicdraft.service;

import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.*;

@Service
public class LegalCandidatesParserService {
    public List<Map<String, Object>> parse(String legalCandidatesJson) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(legalCandidatesJson,
                mapper.getTypeFactory().constructCollectionType(List.class,
                    mapper.getTypeFactory().constructMapType(Map.class, String.class, Object.class)));
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
}
