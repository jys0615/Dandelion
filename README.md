# 🌼 Dandelion
> AI 기반 기술 면접 코칭 플랫폼

**"답변하고, 분석받고, 개념을 채운다"**

면접 질문에 답하면 AI Agent가 답변을 분석하고, RAG 기반으로 부족한 개념을 찾아 피드백을 생성한다.
단순 정답 제공이 아니라 *왜 틀렸는지, 무엇을 보완해야 하는지*를 구체적으로 코칭한다.

---

## 목표

- **포트폴리오 목표**: 네카라쿠배 백엔드 / AI 백엔드 엔지니어 포지션 합격
- **기술 목표**: Spring AI + MSA + RAG + Kafka + K8s 실전 경험
- **서비스 목표**: 실제로 사용 가능한 기술 면접 준비 도구

---

## 시스템 아키텍처

```
Client (React / Next.js)
        │
        ▼
┌─────────────────────┐
│    API Gateway       │  Spring Cloud Gateway
│  (라우팅 / 인증)     │
└──────┬──────────────┘
       │
  ┌────┴────────────────────────────┐
  │                                 │
  ▼                                 ▼
┌──────────────┐          ┌─────────────────────┐
│ Auth Service  │          │  Coach Service       │  ← AI Agent 핵심
│ (JWT 인증)    │          │  (LLM + Tool Calling)│
└──────────────┘          └──────────┬──────────┘
                                     │ Tool 호출
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
          ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
          │ Question      │ │ Feedback     │ │ User         │
          │ Service       │ │ Service      │ │ Service      │
          │ (문제 관리)   │ │ (RAG 피드백) │ │ (이력/통계)  │
          └──────────────┘ └──────────────┘ └──────────────┘
                    │                │
                    ▼                ▼
          ┌──────────────────────────────┐
          │     Message Broker (Kafka)    │
          │  답변 제출 이벤트 비동기 처리  │
          └──────────────────────────────┘
                    │
          ┌─────────┴──────────┐
          │                    │
          ▼                    ▼
  ┌──────────────┐    ┌──────────────┐
  │  PostgreSQL   │    │  pgvector    │
  │  (도메인 DB)  │    │  (임베딩 DB) │
  └──────────────┘    └──────────────┘
```

---

## 서비스 구성

| 서비스 | 역할 | 핵심 기술 |
|--------|------|----------|
| **API Gateway** | 라우팅, 인증 필터, Rate Limiting | Spring Cloud Gateway |
| **Auth Service** | 회원가입 / 로그인 / JWT 발급 | Spring Security, JWT |
| **Question Service** | 카테고리별 면접 문제 관리 및 제공 | Spring Boot, PostgreSQL |
| **Coach Service** | 답변 분석 + Tool Calling 오케스트레이션 | Spring AI, Claude API |
| **Feedback Service** | RAG 기반 개념 검색 및 피드백 생성 | pgvector, Spring AI |
| **User Service** | 학습 이력, 취약 영역 분석, 통계 | Spring Boot, PostgreSQL |

---

## AI Agent 동작 흐름

```
사용자 답변 제출
       │
       ▼
Coach Service (Agent Orchestrator)
       │
       ├─── Tool 1: Question Service 호출 → 정답 기준 조회
       ├─── Tool 2: Feedback Service 호출 → RAG로 관련 개념 검색
       └─── Tool 3: User Service 호출 → 사용자 취약 패턴 조회
       │
       ▼
LLM (Claude API) → 피드백 종합 생성
       │
       ▼
WebSocket으로 실시간 스트리밍 응답
```

---

## 기술 스택

### Backend
- **Language**: Java 21
- **Framework**: Spring Boot 3.x, Spring Cloud
- **AI**: Spring AI, Claude API (Tool Calling, Streaming)
- **Async**: Apache Kafka
- **Cache**: Redis
- **DB**: PostgreSQL, pgvector

### Infrastructure
- **Container**: Docker, Kubernetes (K8s)
- **CI/CD**: GitHub Actions (서비스별 독립 파이프라인)
- **Monitoring**: Prometheus, Grafana, Zipkin (분산 추적)
- **Registry**: Spring Cloud Eureka

### Frontend (MVP)
- Next.js (포트폴리오 데모용)

---

## 수치화 목표 (성능 지표)

| 지표 | 목표 |
|------|------|
| 동시 세션 처리 | 500+ concurrent users (k6 부하테스트) |
| AI 응답 레이턴시 | P99 < 3s (스트리밍 첫 토큰 기준) |
| API 평균 응답시간 | < 200ms (AI 제외 일반 API) |
| 서비스 가용성 | 99.9% 이상 |
| CI 파이프라인 | 서비스별 독립 배포, 빌드 < 5분 |

---

## 질문 카테고리

- **운영체제**: 프로세스/스레드, 메모리 관리, 동기화
- **네트워크**: TCP/UDP, HTTP/HTTPS, REST
- **데이터베이스**: 인덱스, 트랜잭션, 정규화
- **자료구조 / 알고리즘**: 시간복잡도, 정렬, 트리
- **Spring / Java**: JVM, GC, DI, AOP
- **시스템 설계**: MSA, CAP 정리, 캐싱 전략

---

## 개발 로드맵

### Phase 1 — 기반 구축 (2주)
- [ ] 프로젝트 멀티모듈 구조 설정
- [ ] API Gateway + Auth Service 구현
- [ ] Question Service CRUD
- [ ] Docker Compose로 로컬 환경 구성

### Phase 2 — AI 핵심 기능 (3주)
- [ ] Spring AI + Claude API 연동
- [ ] Tool Calling 기반 Coach Service 구현
- [ ] pgvector + RAG 파이프라인 구축
- [ ] Feedback Service 구현
- [ ] Kafka 이벤트 기반 비동기 처리

### Phase 3 — 고도화 (2주)
- [ ] WebSocket 실시간 스트리밍
- [ ] User Service (취약 영역 분석)
- [ ] Redis 캐싱 전략 적용
- [ ] k6 부하테스트 + 성능 최적화

### Phase 4 — DevOps / 배포 (2주)
- [ ] GitHub Actions CI/CD (서비스별 독립 파이프라인)
- [ ] Kubernetes 배포 (Helm Chart)
- [ ] Prometheus + Grafana 모니터링 대시보드
- [ ] Zipkin 분산 추적 설정

---

## 프로젝트 구조 (예정)

```
dandelion/
├── api-gateway/
├── auth-service/
├── question-service/
├── coach-service/          ← AI Agent 핵심
├── feedback-service/       ← RAG 파이프라인
├── user-service/
├── common/                 ← 공통 DTO, 예외 처리
├── k8s/                    ← K8s 매니페스트
├── docker-compose.yml
└── .github/
    └── workflows/          ← 서비스별 CI/CD
```

---

## 기대 학습 성과

- Spring AI Tool Calling + Streaming 실전 경험
- MSA 서비스 분리 기준과 통신 패턴 (동기/비동기) 체득
- RAG 파이프라인 설계 및 pgvector 활용
- Kafka 기반 이벤트 드리븐 아키텍처
- K8s 배포 + 서비스 독립 CI/CD 운영
- k6 부하테스트 기반 성능 수치화

---

*Built with Spring AI + MSA — Portfolio Project for Backend / AI Backend Engineer Position*
