package kr.ddm.civic.civicdraft.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

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

    /**
     * Swagger UI 및 OpenAPI 문서 캐시 무효화 필터
     * 모든 /v3/api-docs 및 /swagger-ui 경로에 대해 캐시 헤더 비활성화
     */
    @Bean
    public FilterRegistrationBean<Filter> swaggerNoCacheFilter() {
        FilterRegistrationBean<Filter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(new Filter() {
            @Override
            public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
                if (response instanceof HttpServletResponse resp) {
                    resp.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
                    resp.setHeader("Pragma", "no-cache");
                    resp.setDateHeader("Expires", 0);
                }
                chain.doFilter(request, response);
            }
        });
        registrationBean.addUrlPatterns("/v3/api-docs/*", "/swagger-ui/*", "/swagger-ui.html");
        registrationBean.setName("swaggerNoCacheFilter");
        registrationBean.setOrder(1);
        return registrationBean;
    }
}
