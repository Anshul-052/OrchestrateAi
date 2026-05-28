import asyncio
import json
import random
from typing import Dict, Any
from datetime import datetime
from sse_starlette.sse import ServerSentEvent

async def simulate_execution(workflow_definition: Dict[str, Any]):
    yield ServerSentEvent(
        data=json.dumps({'status': 'started', 'timestamp': datetime.utcnow().isoformat()}),
        event='update'
    )
    
    trigger = workflow_definition.get('trigger', {})
    await asyncio.sleep(random.uniform(0.3, 1.2))
    yield ServerSentEvent(
        data=json.dumps({'status': 'running', 'step': 'trigger', 'type': trigger.get('type'), 'timestamp': datetime.utcnow().isoformat()}),
        event='update'
    )
    
    actions = workflow_definition.get('actions', [])
    for action in actions:
        await asyncio.sleep(random.uniform(0.3, 1.2))
        yield ServerSentEvent(
            data=json.dumps({'status': 'running', 'step': 'action', 'id': action.get('id'), 'type': action.get('type'), 'timestamp': datetime.utcnow().isoformat()}),
            event='update'
        )
    
    await asyncio.sleep(random.uniform(0.3, 1.2))
    yield ServerSentEvent(
        data=json.dumps({'status': 'completed', 'timestamp': datetime.utcnow().isoformat()}),
        event='update'
    )
