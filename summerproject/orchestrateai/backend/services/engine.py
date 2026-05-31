import json
import httpx
from typing import Dict, Any, AsyncGenerator
from datetime import datetime
from sse_starlette.sse import ServerSentEvent
from config import settings

async def execute_universal_action(action: Dict[str, Any], state: Dict[str, Any]) -> Dict[str, Any]:
    provider = settings.AI_PROVIDER.lower()
    
    prompt = f"""You are the OrchestrateAi Universal Action execution engine.
Current Workflow State (data from previous steps):
{json.dumps(state, indent=2)}

Action to execute:
Type: {action.get('type')}
Config: {json.dumps(action.get('config', {}))}

Analyze the Action and State. Decide if you need to:
1. Evaluate a condition against the state (if Type is 'filter').
2. Calculate delay seconds from natural language (if Type is 'delay').
3. Transform data locally (if Type is 'formatter' or standard action without API).
4. Make an HTTP request to an external API (if Type is an integration action).

Return ONLY raw JSON matching this schema exactly:
{{
  "execute_http": boolean,
  "http_request": {{
     "method": "POST",
     "url": "https://...",
     "headers": {{"Content-Type": "application/json"}},
     "body": {{}}
  }},
  "filter_passed": boolean (true if condition met, false if not met. Only for 'filter'),
  "delay_seconds": integer (number of seconds to wait. Only for 'delay'),
  "result": "Put transformed data here if execute_http is false, otherwise null"
}}
"""

    if provider == "openai":
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        response = await client.chat.completions.create(
            model="gpt-4o",
            response_format={"type": "json_object"},
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )
        content = response.choices[0].message.content
        ai_resp = json.loads(content)
    elif provider == "gemini":
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = await model.generate_content_async(prompt)
        text = response.text.strip()
        if text.startswith('```json'): text = text[7:]
        if text.startswith('```'): text = text[3:]
        if text.endswith('```'): text = text[:-3]
        ai_resp = json.loads(text.strip())
    else:
        raise ValueError("Unsupported AI provider")
        
    if ai_resp.get("execute_http") and ai_resp.get("http_request"):
        req = ai_resp["http_request"]
        async with httpx.AsyncClient() as http_client:
            api_res = await http_client.request(
                method=req.get("method", "GET"),
                url=req.get("url"),
                headers=req.get("headers", {}),
                json=req.get("body") if req.get("body") else None,
            )
            return {"status_code": api_res.status_code, "response": api_res.text}
    else:
        return ai_resp

async def execute_workflow_live(workflow_definition: Dict[str, Any], initial_state: Dict[str, Any] = None):
    yield ServerSentEvent(
        data=json.dumps({'status': 'started', 'timestamp': datetime.utcnow().isoformat()}),
        event='update'
    )
    
    state = initial_state or {}
    
    trigger = workflow_definition.get('trigger', {})
    yield ServerSentEvent(
        data=json.dumps({'status': 'running', 'step': 'trigger', 'type': trigger.get('type', 'webhook'), 'timestamp': datetime.utcnow().isoformat(), 'state': state}),
        event='update'
    )
    
    actions = workflow_definition.get('actions', [])
    for action in actions:
        yield ServerSentEvent(
            data=json.dumps({'status': 'running', 'step': 'action', 'id': action.get('id'), 'type': action.get('type'), 'timestamp': datetime.utcnow().isoformat()}),
            event='update'
        )
        
        try:
            action_result = await execute_universal_action(action, state)
            state[action.get('id')] = action_result
            
            if action.get('type') == 'filter' and action_result.get('filter_passed') is False:
                yield ServerSentEvent(
                    data=json.dumps({'status': 'completed', 'step': 'action_result', 'id': action.get('id'), 'result': 'Workflow halted: Filter condition not met.', 'timestamp': datetime.utcnow().isoformat()}),
                    event='update'
                )
                return # Stop execution entirely
                
            if action.get('type') == 'delay':
                delay_sec = min(action_result.get('delay_seconds', 0), 10) # limit to 10s for SSE MVP
                if delay_sec > 0:
                    import asyncio
                    yield ServerSentEvent(data=json.dumps({'status': 'running', 'step': 'delay', 'seconds': delay_sec, 'id': action.get('id')}), event='update')
                    await asyncio.sleep(delay_sec)
            
            yield ServerSentEvent(
                data=json.dumps({'status': 'running', 'step': 'action_result', 'id': action.get('id'), 'result': action_result, 'timestamp': datetime.utcnow().isoformat()}),
                event='update'
            )
        except Exception as e:
            yield ServerSentEvent(
                data=json.dumps({'status': 'error', 'step': 'action', 'id': action.get('id'), 'error': str(e), 'timestamp': datetime.utcnow().isoformat()}),
                event='update'
            )
            break
            
    yield ServerSentEvent(
        data=json.dumps({'status': 'completed', 'timestamp': datetime.utcnow().isoformat(), 'final_state': state}),
        event='update'
    )
