from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sse_starlette.sse import EventSourceResponse

from database import get_db
from models.workflow import Workflow
from models.workflow_run import WorkflowRun
from schemas.workflow_run import WorkflowRunResponse
from services.execution_simulator import simulate_execution
from services.workflow_runner import create_workflow_run

router = APIRouter(prefix="/api/workflows", tags=["runs"])

USER_ID = "demo-user"

@router.post("/{id}/run")
async def run_workflow(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Workflow).where(Workflow.id == id, Workflow.user_id == USER_ID))
    workflow = result.scalars().first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    await create_workflow_run(db, id)
    
    return EventSourceResponse(simulate_execution(workflow.definition))

@router.get("/{id}/runs", response_model=list[WorkflowRunResponse])
async def get_workflow_runs(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(WorkflowRun).where(WorkflowRun.workflow_id == id))
    runs = result.scalars().all()
    return runs
