from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from database import get_db
from models.workflow import Workflow
from services.engine import execute_workflow_live

router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])

@router.post("/{workflow_id}")
async def incoming_webhook(workflow_id: str, request: Request, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Workflow).where(Workflow.id == workflow_id))
    workflow = result.scalars().first()
    
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
        
    try:
        payload = await request.json()
    except:
        payload = {}

    initial_state = {"webhook_payload": payload}

    # Execute in background (For now, we will iterate the generator synchronously but discard SSE wrapping to run it without streaming)
    # Ideally this would be queued in Celery. For MVP, we iterate it.
    import asyncio
    async def run_in_bg():
        try:
            async for _ in execute_workflow_live(workflow.definition, initial_state):
                pass
        except Exception as e:
            print("Background webhook error:", e)

    asyncio.create_task(run_in_bg())

    return {"status": "success", "message": "Workflow started"}
