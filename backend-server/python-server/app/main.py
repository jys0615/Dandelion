from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from typing import Any, List, Dict
import time
import traceback
from dotenv import load_dotenv
load_dotenv()
from gpt_service import call_gpt
from draft_generator import generate_draft
from legal_basis import build_legal_basis

app = FastAPI()

# =====================
# Exception Handling
# =====================
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print("=== FastAPI 글로벌 예외 발생 ===")
    print("Request:", request)
    print("Exception:", exc)
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)}
    )

# =====================
# Data Models
# =====================
class CivicAssistRequest(BaseModel):
    """민원 초안 생성 요청 모델 (요약+제목)"""
    summary: str           # 민원 요약
    title: str             # 민원 제목

class CivicAssistResponse(BaseModel):
    """민원 초안 생성 응답 모델"""
    channel: str
    title: str
    body: str

class Issue(BaseModel):
    """민원 요약 모델 (추천용)"""
    summary: str

class Channel(BaseModel):
    """추천 채널 모델"""
    id: str
    title: str

class RecommendRequest(BaseModel):
    """추천 요청 모델"""
    issue: Issue
    channels: List[Channel]

# =====================
# 초안 생성 API (REST)
# =====================
@app.post("/process")
def process(request: CivicAssistRequest):
    """
    민원 초안 생성 (REST)
    - 사용자의 민원 요약+제목을 바탕으로 초안 전체 결과 반환
    """
    prompt_text = f"""
민원 요약: {request.summary}
민원 제목: {request.title}
위 정보를 바탕으로 민원 본문을 작성해줘. 어떤 사진 첨부가 필요한지 안내해줘. 관련 법률정보도 함께 추천해줘.
"""
    messages = [
        {"role": "system", "content": "민원 초안 생성 서비스. 사용자의 민원 요약과 제목을 바탕으로 초안을 생성하세요."},
        {"role": "user", "content": prompt_text}
    ]
    gpt_result = call_gpt(messages) or ""
    try:
        draft_result = generate_draft(request.summary, request.title)
        if draft_result:
            gpt_result = draft_result
    except Exception as e:
        print("LangChain 초안 생성 오류:", e)
        traceback.print_exc()
    # 예시: candidates는 실제로는 GPT/LLM 또는 DB 등에서 받아야 함
    return CivicAssistResponse(
        channel="saeol",
        title=request.title,
        body=gpt_result
    )

# =====================
# 초안 생성 API (SSE)
# =====================
@app.post("/process/stream")
def process_stream(request: CivicAssistRequest):
    """
    민원 초안 생성 (SSE)
    - 요약+제목 기반 초안 결과를 실시간 chunk 단위로 반환
    """
    prompt_text = f"""
민원 요약: {request.summary}
민원 제목: {request.title}
위 정보를 바탕으로 민원 본문을 작성해줘. 어떤 사진 첨부가 필요한지 안내해줘. 관련 법률정보도 함께 추천해줘.
"""
    messages = [
        {"role": "system", "content": "민원 초안 생성 서비스. 사용자의 민원 요약과 제목을 바탕으로 초안을 생성하세요."},
        {"role": "user", "content": prompt_text}
    ]
    gpt_result = call_gpt(messages) or ""
    try:
        draft_result = generate_draft(request.summary, request.title)
        if draft_result:
            gpt_result = draft_result
    except Exception as e:
        print("LangChain 초안 생성 오류:", e)
        traceback.print_exc()
    import re
    def split_chunks(text):
        for s in re.split(r'(?<=[.!?]) +|\n', text):
            if s.strip():
                yield s.strip()
    def event_stream():
        for chunk in split_chunks(gpt_result):
            yield f"data: {chunk}\n\n"
            time.sleep(0.2)
        yield "data: [END]\n\n"
    return StreamingResponse(event_stream(), media_type="text/event-stream")

# =====================
# 채널 추천 API
# =====================
@app.post("/api/recommend")
def recommend_api(request: RecommendRequest):
    """
    채널 추천 API
    - 민원 요약과 채널 목록을 받아 AI가 적합한 채널 후보 추천
    """
    prompt = f"""
민원 내용: {request.issue.summary}
채널 목록:
{', '.join([f'{ch.id}: {ch.title}' for ch in request.channels])}

위 민원에 가장 적합한 채널 후보를 1개 이상 추천하고, 각 후보별로 추천 이유를 설명해줘.
결과는 JSON 형식으로 반환해줘. 예시:
{{
  "options": [
    {{ "id": "mayor_board", "title": "구청장에게 바란다", "reason": "신호주기 관련 민원" }}
  ],
  "recommendedChannel": "mayor_board"
}}
"""
    ai_result = call_gpt([{"role": "user", "content": prompt}]) or ""
    import json
    try:
        result = json.loads(ai_result)
    except Exception as e:
        print("AI 응답 파싱 오류:", e)
        result = {"options": [], "recommendedChannel": None}
    return result
