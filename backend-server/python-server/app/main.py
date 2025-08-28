from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Any, List, Dict
import time
from dotenv import load_dotenv
load_dotenv()
from gpt_service import call_gpt
from langchain_service import call_langchain


app = FastAPI()

# 글로벌 Exception Handler 추가
from fastapi.responses import JSONResponse
import traceback
from fastapi import Request

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

class CivicAssistRequest(BaseModel):
    userText: str
    photos: bool
    videos: bool
    locationText: str
    legalCandidatesJson: str

class CivicAssistResponse(BaseModel):
    channel: str
    title: str
    body: str
    bulletedRequests: List[str]
    channelFields: Dict[str, Any]
    legalBasis: List[Dict[str, Any]]
    confidence: float
    missingFields: List[str]
    safetyFlags: Dict[str, Any]


# REST 방식 엔드포인트
@app.post("/process")
def process(request: CivicAssistRequest):
    """
    REST 방식: 전체 초안 결과를 한 번에 반환 (GPT 연동)
    """
    messages = [
        {"role": "system", "content": "민원 초안 생성 서비스. 사용자의 민원 내용을 바탕으로 초안을 생성하세요."},
        {"role": "user", "content": request.userText}
    ]
    # GPT 결과 우선, LangChain 결과가 있으면 우선 사용
    gpt_result = call_gpt(messages) or ""
    import traceback
    try:
        lc_result = call_langchain(messages)
        if lc_result:
            gpt_result = lc_result
    except Exception as e:
        print("LangChain 오류:", e)
        traceback.print_exc()
    # 예시: GPT/LangChain 결과를 본문에 반영
    return CivicAssistResponse(
        channel="saeol",
        title="AI 초안 제목",
        body=gpt_result,
        bulletedRequests=["요청1", "요청2"],
        channelFields={"public_visibility": "private", "sms_notify": True, "category": "교통/도로", "address_text": request.locationText},
        legalBasis=[],
        confidence=0.9,
        missingFields=[],
        safetyFlags={"contains_pii": False, "defamation_risk": "low"}
    )

# SSE 방식 엔드포인트
@app.post("/process/stream")
def process_stream(request: CivicAssistRequest):
    """
    SSE 방식: 초안 생성 결과를 토큰 단위로 실시간 스트리밍 (GPT 연동)
    """
    messages = [
        {"role": "system", "content": "민원 초안 생성 서비스. 사용자의 민원 내용을 바탕으로 초안을 생성하세요."},
        {"role": "user", "content": request.userText}
    ]
    # GPT/LangChain 결과 우선, None 처리
    gpt_result = call_gpt(messages) or ""
    import traceback
    try:
        lc_result = call_langchain(messages)
        if lc_result:
            gpt_result = lc_result
    except Exception as e:
        print("LangChain 오류:", e)
        traceback.print_exc()
    # chunk 처리: 문장 단위로 분할, 없으면 50자 단위
    import re
    def split_chunks(text):
        # 문장 단위 분할
        sentences = re.split(r'(?<=[.!?]) +', text)
        for s in sentences:
            if s.strip():
                yield s.strip()
    def event_stream():
        for chunk in split_chunks(gpt_result):
            yield f"data: {chunk}\n\n"
            time.sleep(0.2)
        yield "data: [END]\n\n"
    return StreamingResponse(event_stream(), media_type="text/event-stream")
