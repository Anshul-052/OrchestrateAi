from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class WorkflowRunResponse(BaseModel):
    id: str
    workflow_id: str
    status: str
    logs: List[Dict[str, Any]]
    started_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
