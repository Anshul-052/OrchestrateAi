import json
import uuid
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.workflow_run import WorkflowRun

async def create_workflow_run(db: AsyncSession, workflow_id: str) -> str:
    run_id = str(uuid.uuid4())
    run = WorkflowRun(
        id=run_id,
        workflow_id=workflow_id,
        status="running",
        logs=[]
    )
    db.add(run)
    await db.commit()
    return run_id
