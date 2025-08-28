# channel_recommendation_service.py
# 민원 채널 추천 기능을 담당하는 서비스 모듈

from langchain_community.chat_models import ChatOpenAI
import os


def recommend_channel(issue_summary, channels, model="gpt-4"):
    """
    LangChain 기반 민원 채널 추천 함수.
    issue_summary: 민원 요약 텍스트
    channels: [{"id": ..., "title": ...}, ...] 형태의 채널 목록
    """
    steps = [
        ("OPENAI API 키 확인", 10),
        ("채널 목록 파싱", 30),
        ("프롬프트 생성", 50),
        ("ChatOpenAI 인스턴스 생성", 70),
        ("LLM 실행", 100)
    ]
    def print_progress(step, percent):
        print(f"[{percent:3}%] {step}...")

    print_progress(*steps[0])
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        raise ValueError("OPENAI_API_KEY 환경변수가 설정되어 있지 않습니다.")

    print_progress(*steps[1])
    channel_list_str = ', '.join([f'{ch["id"]}: {ch["title"]}' for ch in channels])

    print_progress(*steps[2])
    prompt = f"""
민원 내용: {issue_summary}
채널 목록:
{channel_list_str}

위 민원에 가장 적합한 채널 후보를 1개 이상 추천하고, 각 후보별로 추천 이유를 설명해줘.
결과는 JSON 형식으로 반환해줘. 예시:
{{
  "options": [
    {{ "id": "mayor_board", "title": "구청장에게 바란다", "reason": "신호주기 관련 민원" }}
  ],
  "recommendedChannel": "mayor_board"
}}
"""

    print_progress(*steps[3])
    llm = ChatOpenAI(api_key=openai_api_key, model=model, temperature=0.2, max_tokens=1200)

    print_progress(*steps[4])
    result = llm.invoke(prompt)
    print("채널 추천 결과:", result)
    return result
