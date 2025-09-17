# 민들레 (동대문구 통합 민원 서비스)

## 📌 프로젝트 개요
**민들레**는 동대문구의 교통 및 지역사회 문제 해결을 위한 **통합 민원 자동화 서비스**입니다.  
주민이 입력한 민원 내용을 자동으로 처리하고, 교통 불편 사항을 **지도 기반으로 시각화**하여 정책 제안으로 이어질 수 있도록 설계했습니다.  

전체 시스템은 **프론트엔드(Next.js) – 백엔드(Spring Boot) – AI 서버(FastAPI) – Node.js 서버**로 구성된 **풀스택 파이프라인** 형태이며,  
민원 작성 → 자동 문서화 → 북마클릿 코드 생성 → 실제 민원 사이트 제출까지의 흐름을 지원합니다.

---

## 🔗 관련 리포지토리
- [Frontend-User Repository](https://github.com/Couque-d-Asse/Frontend-User)  
- [Backend Repository](https://github.com/Locathon/BE)  
- [AI Repository](https://github.com/Locathon/AI)  

---

## 🛠 기술 스택
- **Frontend**: Next.js, TypeScript, React  
- **Backend**: Spring Boot, JPA, PostgreSQL  
- **AI**: FastAPI, LLM API (민원 문구 자동 생성)  
- **Utility**: Node.js (북마클릿 코드 생성)  
- **기타**: 지도 API, RESTful API, JSON 기반 통신  

---

## ✨ 주요 기능
- **자동 민원 문서화**  
  주민 입력 내용을 AI 서버에 전달하여 제목·내용을 자동으로 생성  

- **데이터 저장 및 관리**  
  Spring Boot와 DB 연동으로 민원 데이터를 안정적으로 저장  

- **북마클릿 코드 생성**  
  Node.js 서버에서 북마클릿(bookmarklet) 코드 생성 → 사용자는 클릭 한 번으로 실제 민원 사이트에 자동 입력 가능  

- **교통 민원 시각화**  
  지도 기반으로 교통 불편 민원을 표시하여 정책 제안 자료로 활용 가능  

---

## 👩‍💻 기여도
- **프론트엔드 구현**: Next.js 기반 UI 및 API 설계  
- **백엔드 연동**: Spring Boot 서버와 DB를 연동하여 민원 데이터 저장  
- **AI 통합**: FastAPI 서버에 민원 데이터 전달 → 자동 문서화 기능 통합  
- **자동화 기능**: Node.js 서버를 활용해 북마클릿 코드 생성 및 자동 민원 작성 기능 구현  

---

## 📈 성과 및 배운 점
- 복잡한 기능을 **API 단위로 분리·오케스트레이션**하여 통합 서비스로 구현  
- 풀스택 환경에서 **프론트–백–AI–유틸 서버 간 연계 경험** 축적  
- 사용자 중심으로 실제 행정 민원 프로세스를 개선하는 서비스 모델 제시  

---
