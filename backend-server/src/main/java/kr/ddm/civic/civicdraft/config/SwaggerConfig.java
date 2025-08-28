package kr.ddm.civic.civicdraft.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI civicDraftOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("CivicDraft API")
                        .description("동대문구 민원 초안 생성 서비스 API")
                        .version("v1.0.0"));
    }
}
