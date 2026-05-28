from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import uuid

from database import get_db
from models.workflow import Workflow
from schemas.workflow import WorkflowCreate, WorkflowResponse, GenerateRequest, WorkflowDefinition
from services.ai_parser import parse_prompt_to_workflow

router = APIRouter(prefix="/api/workflows", tags=["workflows"])

USER_ID = "demo-user"

@router.post("/generate", response_model=WorkflowDefinition)
async def generate_workflow(request: GenerateRequest):
    try:
        workflow_def = await parse_prompt_to_workflow(request.prompt)
        return workflow_def
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("", response_model=list[WorkflowResponse])
async def list_workflows(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Workflow).where(Workflow.user_id == USER_ID))
    workflows = result.scalars().all()
    return workflows

@router.post("", response_model=WorkflowResponse)
async def create_workflow(workflow: WorkflowCreate, db: AsyncSession = Depends(get_db)):
    new_workflow = Workflow(
        id=str(uuid.uuid4()),
        user_id=USER_ID,
        name=workflow.name,
        description=workflow.description,
        definition=workflow.definition.model_dump()
    )
    db.add(new_workflow)
    await db.commit()
    await db.refresh(new_workflow)
    return new_workflow

@router.get("/{id}", response_model=WorkflowResponse)
async def get_workflow(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Workflow).where(Workflow.id == id, Workflow.user_id == USER_ID))
    workflow = result.scalars().first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow

@router.put("/{id}", response_model=WorkflowResponse)
async def update_workflow(id: str, update_data: WorkflowCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Workflow).where(Workflow.id == id, Workflow.user_id == USER_ID))
    workflow = result.scalars().first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    workflow.name = update_data.name
    workflow.description = update_data.description
    workflow.definition = update_data.definition.model_dump()
    
    await db.commit()
    await db.refresh(workflow)
    return workflow

@router.delete("/{id}")
async def delete_workflow(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Workflow).where(Workflow.id == id, Workflow.user_id == USER_ID))
    workflow = result.scalars().first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    await db.delete(workflow)
    await db.commit()
    return {"status": "success"}
