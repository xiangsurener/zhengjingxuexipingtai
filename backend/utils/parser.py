import re
import json

_CODEBLOCK_RE = re.compile(r"^```json\s*|\s*```$", re.DOTALL)

def strip_code_fence(s: str) -> str:
    return re.sub(_CODEBLOCK_RE, "", s.strip())

def parse_json_safe(s: str):
    try:
        return json.loads(strip_code_fence(s))
    except json.JSONDecodeError:
        return None