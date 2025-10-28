from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime
from models.execution import Execution
from models.execution_log import ExecutionLog
from models.user import User
from schemas.execution import ExecutionCreate


class ExecutionService:
    """Service for execution operations"""
    
    @staticmethod
    def create_execution(db: Session, user: User, execution_data: ExecutionCreate) -> Execution:
        """Create a new execution"""
        execution = Execution(
            workflow_id=execution_data.workflow_id,
            status="pending",
            trigger_type=execution_data.trigger_type,
            triggered_by=user.id,
        )
        
        db.add(execution)
        db.commit()
        db.refresh(execution)
        
        return execution
    
    @staticmethod
    def get_execution(db: Session, execution_id: UUID, user: User) -> Execution:
        """Get execution by ID"""
        execution = db.query(Execution).filter(
            Execution.id == execution_id
        ).first()
        
        if not execution:
            raise ValueError(f"Execution {execution_id} not found")
        
        return execution
    
    @staticmethod
    def list_executions(db: Session, workflow_id: UUID, skip: int = 0, limit: int = 100) -> list[Execution]:
        """List executions for a workflow"""
        return db.query(Execution).filter(
            Execution.workflow_id == workflow_id
        ).order_by(Execution.created_at.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def update_execution_status(db: Session, execution_id: UUID, status: str, error_message: str = None) -> Execution:
        """Update execution status"""
        execution = db.query(Execution).filter(Execution.id == execution_id).first()
        
        if not execution:
            raise ValueError(f"Execution {execution_id} not found")
        
        execution.status = status
        if error_message:
            execution.error_message = error_message
        
        if status == "running" and not execution.started_at:
            execution.started_at = datetime.utcnow()
        elif status in ["success", "failed", "cancelled"]:
            execution.completed_at = datetime.utcnow()
        
        db.commit()
        db.refresh(execution)
        
        return execution
    
    @staticmethod
    def add_execution_log(db: Session, execution_id: UUID, node_id: str, level: str, message: str, metadata: dict = None) -> ExecutionLog:
        """Add log entry for execution"""
        log = ExecutionLog(
            execution_id=execution_id,
            node_id=node_id,
            level=level,
            message=message,
            metadata=metadata,
        )
        
        db.add(log)
        db.commit()
        db.refresh(log)
        
        return log
    
    @staticmethod
    def get_execution_logs(db: Session, execution_id: UUID) -> list[ExecutionLog]:
        """Get all logs for an execution"""
        return db.query(ExecutionLog).filter(
            ExecutionLog.execution_id == execution_id
        ).order_by(ExecutionLog.timestamp.asc()).all()

