# 🌼 민들레 — 동대문구 통합 민원 서비스

> **"축적되지 않던 민원을 모아, 정책 담당자가 바로 활용할 수 있는 동대문구만의 전용 창구"**

[![2025 K-HTML Hackathon](https://img.shields.io/badge/2025_K--HTML_Hackathon-Finalist-blue)](https://github.com/jys0615/Dandelion)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5.5-brightgreen)](https://spring.io/projects/spring-boot)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688)](https://fastapi.tiangolo.com)
[![LangChain](https://img.shields.io/badge/LangChain-LLM-orange)](https://langchain.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org)

---

## 📌 프로젝트 개요

**민들레**는 2025 K-HTML 해커톤(2025.08.30)에서 팀 쿠크다스(김리원, 신진수, 오종현, 정윤서)가 개발한 동대문구 통합 민원 자동화 서비스입니다.

동대문구 이문뉴타운 일대는 2027년까지 약 **1만 3천 가구**가 입주할 예정으로, 폭발적인 교통 수요 증가가 예상됩니다. 그러나 주민들의 목소리는 국민신문고·구청·주민센터 등 여러 채널에 분산되어 정책에 반영되지 못하는 문제가 있었습니다.

민원'잇다는 이 문제를 해결하기 위해, **AI가 민원 내용을 분석하여 최적의 민원 채널을 자동 추천하고 초안까지 작성**해주는 서비스입니다.

---

## 🎯 핵심 기능

### 1. AI 채널 자동 추천
사용자가 민원 내용을 입력하면, AI가 3개의 주요 민원 채널 중 가장 적합한 채널을 분석·추천합니다.

| 채널                | 설명                                   |
| ------------------- | -------------------------------------- |
| 🛡 안전신문고        | 불법주차, 보행 안전 등 즉각 처리 민원  |
| 📣 구청장에게 바란다 | 교통 개선, 도로 확장 등 정책 제안 민원 |
| 🏛 새올전자민원창구  | 공식 행정 처리가 필요한 민원           |

### 2. LLM 기반 민원 초안 자동 생성 (SSE 스트리밍)
LangChain + GPT를 활용하여 민원 제목과 요약만 입력해도 **완성된 민원 본문을 실시간으로 생성**합니다.
- 민원 본문 자동 작성
- 필요한 첨부 사진 안내
- 관련 법률 정보 자동 첨부

### 3. 상태 플래그 기반 이벤트 구조로 DB 정합성 보장
이기종 서버(Spring Boot ↔ FastAPI ↔ Node.js) 간 통신에서 **상태 플래그 이벤트 구조**를 적용, DB 정합성 100%를 확보했습니다.

---

## 🏗 시스템 아키텍처

```
[Client (Browser)]
        │
        ▼
[Spring Boot Server :8443]  ←── Main Orchestration Server
   ├── REST API (/api/civicdraft/recommend)
   ├── SSE Stream (/api/civicdraft/draft/stream)
   ├── Bookmarklet API
   ├── Spring Security + JWT
   ├── JPA + PostgreSQL
   └── Swagger UI (/swagger-ui.html)
        │                        │
        ▼                        ▼
[FastAPI Server :8000]    [Node.js Server :3000]
   ├── /process              └── Bookmarklet 연동
   ├── /process/stream            (기존 민원 창구 자동 입력)
   └── /api/recommend
   (LangChain + GPT)
        │
        ▼
[PostgreSQL :5432]
[pgAdmin :8080]
```

**서버 역할 분리**

- **Spring Boot** — 메인 오케스트레이션, 인증/인가(Spring Security), DB 관리, 클라이언트 응답
- **FastAPI (Python)** — LLM 추론, 채널 추천, 민원 초안 생성 (AI 처리 전담)
- **Node.js** — 기존 민원 창구(새올 등) 자동화 Bookmarklet 연동

---

## 🛠 기술 스택

| 구분           | 기술                                             |
| -------------- | ------------------------------------------------ |
| Backend (Main) | Java 17, Spring Boot 3.5.5, Spring Security, JPA |
| AI Server      | Python, FastAPI, LangChain, OpenAI GPT           |
| Automation     | Node.js                                          |
| DB             | PostgreSQL 15                                    |
| Infra          | Docker Compose                                   |
| API Docs       | Swagger / OpenAPI 3                              |
| HTTP Client    | OkHttp (Spring → FastAPI SSE 연동)               |

---

## 📁 프로젝트 구조

```
Dandelion/
└── backend-server/
    ├── src/main/java/kr/ddm/civic/civicdraft/
    │   ├── controller/
    │   │   ├── CivicDraftController.java   # 민원 추천·초안 생성 API
    │   │   └── BookmarkletController.java  # Bookmarklet 연동 API
    │   ├── service/
    │   │   ├── CivicDraftService.java       # SSE 스트리밍 오케스트레이션
    │   │   ├── ChannelClassifierService.java # 채널 분류 (classifier.yml 기반)
    │   │   ├── DraftGeneratorService.java   # 민원 초안 생성
    │   │   ├── LegalBasisService.java       # 법률 근거 생성
    │   │   ├── AiImprovementService.java    # AI 품질 개선
    │   │   └── BookmarkletService.java      # Node.js 연동
    │   ├── dto/                             # 요청/응답 DTO
    │   ├── model/                           # JPA Entity
    │   ├── repository/                      # DB Repository
    │   └── config/                          # Security, Swagger 설정
    ├── python-server/
    │   └── app/
    │       ├── main.py                      # FastAPI 엔드포인트
    │       ├── gpt_service.py               # GPT API 연동
    │       ├── draft_generator.py           # LangChain 초안 생성
    │       ├── legal_basis.py               # 법률 근거 처리
    │       └── channel_recommendation_service.py
    └── docker-compose.yml                   # PostgreSQL + pgAdmin
```

---

## 🚀 시작하기

### 사전 요구사항
- Java 17+
- Python 3.12+
- Docker & Docker Compose
- OpenAI API Key

### 1. 저장소 클론

```bash
git clone -b mergev2 https://github.com/jys0615/Dandelion.git
cd Dandelion/backend-server
```

### 2. 환경변수 설정

`backend-server/.env` 파일 생성:

```env
POSTGRES_DB=dandelion
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
PGADMIN_DEFAULT_EMAIL=admin@admin.com
PGADMIN_DEFAULT_PASSWORD=admin
```

`python-server/.env` 파일 생성:

```env
OPENAI_API_KEY=sk-...
```

### 3. DB 실행 (Docker)

```bash
docker-compose up -d
```

### 4. FastAPI 서버 실행

```bash
cd python-server
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 5. Spring Boot 서버 실행

```bash
./gradlew bootRun
```

### 6. API 문서 확인

```
http://localhost:8443/swagger-ui.html
```

---

## 📡 주요 API

| Method | Endpoint                       | 설명                            |
| ------ | ------------------------------ | ------------------------------- |
| `POST` | `/api/civicdraft/recommend`    | 민원 내용 기반 채널 자동 추천   |
| `POST` | `/api/civicdraft/draft/stream` | 민원 초안 실시간 생성 (SSE)     |
| `POST` | `/api/bookmarklet`             | Bookmarklet 기반 민원 자동 입력 |

### 요청 예시 — 채널 추천

```json
POST /api/civicdraft/recommend
{
  "summary": "이문로 앞 불법주차로 인해 보행자 통행이 어렵습니다."
}
```

### 응답 예시

```json
{
  "recommendedChannel": "안전신문고",
  "reason": "불법주차 및 보행 안전 관련 즉각 처리 민원에 해당",
  "options": [
    { "id": "safety", "title": "안전신문고", "score": 0.91 },
    { "id": "mayor_board", "title": "구청장에게 바란다", "score": 0.72 },
    { "id": "saeol", "title": "새올전자민원창구", "score": 0.45 }
  ]
}
```

---

## 🔑 기술적 도전과 해결

### 이기종 서버 간 SSE 스트리밍 연동
Spring Boot → FastAPI 간 SSE 스트리밍 전달 시 응답 지연 문제가 있었습니다. OkHttp의 장기 연결 설정(10분 타임아웃)과 chunk 단위 실시간 전달 구조로 해결했습니다.

### 상태 플래그 기반 DB 정합성
서버 3개가 비동기로 통신하는 환경에서 민원 데이터 정합성 문제가 발생했습니다. 상태 플래그(PENDING → PROCESSING → DONE) 기반 이벤트 구조를 도입하여 정합성 100%를 달성했습니다.

### 채널 분류 정확도
단순 키워드 매칭 대신 `classifier.yml` 기반 룰 엔진 + GPT 채널 추천을 결합하여 분류 정확도를 높였습니다.

---

## 🗺 서비스 배경

- 동대문구 이문뉴타운, 2027년까지 약 **1만 3천 가구** 입주 예정
- 설문조사 673명 중 **80%**가 새로운 교통 노선 희망
- 국민권익위원회: 민원 기반 정책으로 최근 5년간 479건 집단민원 해결, 14만 명 고충 해소(수용률 96%)
- 기존 민원 채널 분산 문제 → 주민 목소리가 정책에 반영되지 못함

---

## 👥 팀 쿠크다스

| 이름   | 역할                                                   |
| ------ | ------------------------------------------------------ |
| 김리원 | 기획 / 프론트엔드                                      |
| 신진수 | 백엔드                                         |
| 오종현 | 기획 / 프론트엔드                                                |
| 정윤서 | 백엔드 |

---
