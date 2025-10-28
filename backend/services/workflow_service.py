from sqlalchemy.orm import Session
from uuid import UUID
from models.workflow import Workflow
from models.user import User
from schemas.workflow import WorkflowCreate, WorkflowUpdate
from utils.errors import WorkflowNotFound


class WorkflowService:
    """Service for workflow operations"""
    
    @staticmethod
    def create_workflow(db: Session, user: User, workflow_data: WorkflowCreate) -> Workflow:
        """Create a new workflow"""
        workflow = Workflow(
            user_id=user.id,
            name=workflow_data.name,
            description=workflow_data.description,
            definition=workflow_data.definition.model_dump(),
            schedule=workflow_data.schedule,
        )
        
        db.add(workflow)
        db.commit()
        db.refresh(workflow)
        
        return workflow
    
    @staticmethod
    def get_workflow(db: Session, workflow_id: UUID, user: User) -> Workflow:
        """Get workflow by ID"""
        workflow = db.query(Workflow).filter(
            Workflow.id == workflow_id,
            Workflow.user_id == user.id,
        ).first()
        
        if not workflow:
            raise WorkflowNotFound(f"Workflow {workflow_id} not found")
        
        return workflow
    
    @staticmethod
    def list_workflows(db: Session, user: User, skip: int = 0, limit: int = 100) -> list[Workflow]:
        """List all workflows for a user"""
        return db.query(Workflow).filter(
            Workflow.user_id == user.id
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    def update_workflow(db: Session, workflow_id: UUID, user: User, workflow_data: WorkflowUpdate) -> Workflow:
        """Update a workflow"""
        workflow = WorkflowService.get_workflow(db, workflow_id, user)
        
        if workflow_data.name is not None:
            workflow.name = workflow_data.name
        if workflow_data.description is not None:
            workflow.description = workflow_data.description
        if workflow_data.definition is not None:
            workflow.definition = workflow_data.definition.model_dump()
        if workflow_data.is_active is not None:
            workflow.is_active = workflow_data.is_active
        if workflow_data.schedule is not None:
            workflow.schedule = workflow_data.schedule
        
        db.commit()
        db.refresh(workflow)
        
        return workflow
    
    @staticmethod
    def delete_workflow(db: Session, workflow_id: UUID, user: User) -> None:
        """Delete a workflow"""
        workflow = WorkflowService.get_workflow(db, workflow_id, user)
        db.delete(workflow)
        db.commit()

