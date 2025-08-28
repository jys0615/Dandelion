package kr.ddm.civic.civicdraft.service;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class ChannelFieldsBuilderService {
    public Map<String, Object> build(String channel, String location) {
        Map<String, Object> channelFields = new HashMap<>();
        channelFields.put("public_visibility", channel.equals("saeol") ? "private" : "private");
        channelFields.put("sms_notify", true);
        channelFields.put("category", "교통/도로");
        channelFields.put("address_text", location);
        return channelFields;
    }
}
