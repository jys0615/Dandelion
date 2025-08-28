# legal_basis.py
# 법률정보 생성 및 요약 파이썬 모듈
from typing import List, Dict

def build_legal_basis(candidates: List[Dict]) -> List[Dict]:
    """
    candidates: 법률 후보 리스트
    return: 중복 제거, 최신순 정렬된 법률 근거 리스트(최대 3개)
    """
    candidates = sorted(candidates, key=lambda x: x.get("effective_date", ""), reverse=True)
    seen = set()
    result = []
    for candidate in candidates:
        key = f"{candidate.get('law_name')}_{candidate.get('article')}"
        if key in seen:
            continue
        seen.add(key)
        basis = {
            "law_level": candidate.get("law_level"),
            "law_name": candidate.get("law_name"),
            "article": candidate.get("article"),
            "effective_date": candidate.get("effective_date"),
            "quote": candidate.get("text"),
            "summary": "해당 법령은 민원 이슈와 직접적으로 관련되어 있습니다.",
            "relevance_reason": "민원과의 관련성",
            "source_url": candidate.get("source_url"),
            "confidence": 1.0
        }
        result.append(basis)
        if len(result) >= 3:
            break
    return result

def build_legal_info_summary(legal_basis: List[Dict]) -> str:
    if not legal_basis:
        return "관련 법률정보 없음"
    lines = []
    for basis in legal_basis:
        lines.append(f"{basis.get('law_name')} 제{basis.get('article')} - {basis.get('summary')}")
    return "\n".join(lines)
