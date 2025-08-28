# LangChain 실제 연동 예시 함수
from langchain_community.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import os

def call_langchain(messages, model="gpt-4"):
	"""
	LangChain 기반 초안 생성. ChatOpenAI LLMChain + PromptTemplate 예시.
	"""
	print("call_langchain 호출됨")
	openai_api_key = os.getenv("OPENAI_API_KEY")
	if not openai_api_key:
		raise ValueError("OPENAI_API_KEY 환경변수가 설정되어 있지 않습니다.")
	user_message = ""
	for m in messages:
		if m.get("role") == "user":
			user_message = m.get("content", "")
	if not user_message:
		print("user_message가 비어있음")
		return ""
	prompt = PromptTemplate(
		input_variables=["user_text"],
		template="민원 초안 생성 서비스입니다. 아래 민원 내용을 바탕으로 초안을 생성하세요.\n민원 내용: {user_text}"
	)
	print("ChatOpenAI 인스턴스 생성 시도")
	llm = ChatOpenAI(api_key=openai_api_key, model=model, temperature=0.2, max_tokens=1200)
	print("LLMChain 생성 시도")
	chain = LLMChain(prompt=prompt, llm=llm)
	print("LLMChain 실행 시도")
	result = chain.run(user_text=user_message)
	print("LLMChain 실행 결과:", result)
	return result
