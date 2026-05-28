import json
import logging
from typing import Dict, Any
from config import settings
from schemas.workflow import WorkflowDefinition

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """
You are an expert workflow automation engineer. Convert the user's natural language request into a valid JSON workflow definition.

Allowed Triggers:
- gmail.new_email
- schedule.daily
- file.uploaded

Allowed Actions:
- summarize
- notify
- save_to_drive
- extract_deadline
- send_email

Output MUST be a valid JSON matching this schema:
{
  "trigger": {
    "type": "<allowed trigger>",
    "config": { ... }
  },
  "actions": [
    {
      "id": "action-1",
      "type": "<allowed action>",
      "config": { ... },
      "next": ["action-2"]
    }
  ]
}

Only return the raw JSON, no markdown formatting.
"""

async def parse_prompt_to_workflow(prompt: str) -> WorkflowDefinition:
    provider = settings.AI_PROVIDER.lower()
    
    if provider == "openai":
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        
        response = await client.chat.completions.create(
            model="gpt-4o",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=0
        )
        content = response.choices[0].message.content
        data = json.loads(content)
        return WorkflowDefinition(**data)
        
    elif provider == "gemini":
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        response = await model.generate_content_async(
            contents=[SYSTEM_PROMPT, prompt]
        )
        
        text = response.text.strip()
        # Clean up any potential markdown formatting
        if text.startswith('```json'):
            text = text[7:]
        if text.startswith('```'):
            text = text[3:]
        if text.endswith('```'):
            text = text[:-3]
            
        data = json.loads(text.strip())
        return WorkflowDefinition(**data)
    
    else:
        raise ValueError(f"Unsupported AI provider: {provider}")
