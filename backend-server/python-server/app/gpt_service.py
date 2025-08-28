import openai
import os

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY

def call_gpt(messages, model="gpt-4"):
    response = openai.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0.2,
        max_tokens=1200
    )
    return response.choices[0].message.content
