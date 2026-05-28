from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class Trigger(BaseModel):
    type: str
    config: Dict[str, Any] = Field(default_factory=dict)

class Action(BaseModel):
    id: str
    type: str
    config: Dict[str, Any] = Field(default_factory=dict)
    next: Optional[List[str]] = None

class WorkflowDefinition(BaseModel):
    trigger: Trigger
    actions: List[Action]

class WorkflowCreate(BaseModel):
    name: str
    description: Optional[str] = None
    definition: WorkflowDefinition

class WorkflowResponse(BaseModel):
    id: str
    user_id: str
    name: str
    description: Optional[str] = None
    definition: Dict[str, Any]
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class GenerateRequest(BaseModel):
    prompt: str
