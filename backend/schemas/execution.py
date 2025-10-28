from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID


class ExecutionCreate(BaseModel):
    workflow_id: UUID
    trigger_type: str = "manual"


class ExecutionResponse(BaseModel):
    id: UUID
    workflow_id: UUID
    status: str
    trigger_type: str
    triggered_by: Optional[UUID]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    error_message: Optional[str]
    result_data: Optional[Dict[str, Any]]
    created_at: datetime
    
    class Config:
        from_attributes = True


class ExecutionLogResponse(BaseModel):
    id: UUID
    execution_id: UUID
    node_id: str
    level: str
    message: str
    metadata: Optional[Dict[str, Any]]
    timestamp: datetime
    
    class Config:
        from_attributes = True

