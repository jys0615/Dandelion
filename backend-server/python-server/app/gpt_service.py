import openai
import os

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY 환경변수가 설정되어 있지 않습니다.")
openai.api_key = OPENAI_API_KEY

def call_gpt(messages, model="gpt-5-nano", temperature=0.2, max_tokens=1200):
    """
    OpenAI GPT 채팅 API 호출 함수
    """
    try:
        response = openai.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens
        )
        if response.choices and response.choices[0].message:
            return response.choices[0].message.content
        else:
            print("GPT 응답이 비어있음:", response)
            return ""
    except Exception as e:
        print("OpenAI 호출 오류:", e)
        return ""
