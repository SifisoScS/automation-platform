from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID


class WorkflowNodeConfig(BaseModel):
    id: str
    type: str
    position: Dict[str, float]
    config: Dict[str, Any]
    data: Optional[Dict[str, Any]] = None


class WorkflowEdgeConfig(BaseModel):
    from_node: str
    to_node: str


class WorkflowDefinition(BaseModel):
    nodes: List[WorkflowNodeConfig]
    edges: List[WorkflowEdgeConfig]


class WorkflowCreate(BaseModel):
    name: str
    description: Optional[str] = None
    definition: WorkflowDefinition
    schedule: Optional[str] = None


class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    definition: Optional[WorkflowDefinition] = None
    is_active: Optional[bool] = None
    schedule: Optional[str] = None


class WorkflowResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    description: Optional[str]
    definition: WorkflowDefinition
    is_active: bool
    schedule: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

