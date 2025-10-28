import asyncio
from uuid import UUID
from sqlalchemy.orm import Session
from workers.celery_app import celery_app
from core.database import SessionLocal
from workflows.engine import WorkflowEngine
from services.workflow_service import WorkflowService
from services.execution_service import ExecutionService
from utils.logging import get_logger

logger = get_logger(__name__)


@celery_app.task(bind=True, name="execute_workflow")
def execute_workflow(self, execution_id: str, workflow_id: str, user_id: str):
    """
    Execute a workflow asynchronously
    
    Args:
        execution_id: UUID of the execution
        workflow_id: UUID of the workflow
        user_id: UUID of the user
    """
    db = SessionLocal()
    
    try:
        execution_id = UUID(execution_id)
        workflow_id = UUID(workflow_id)
        user_id = UUID(user_id)
        
        logger.info(f"Task: Starting execution {execution_id} for workflow {workflow_id}")
        
        # Get workflow
        from models.user import User
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise ValueError(f"User {user_id} not found")
        
        workflow = WorkflowService.get_workflow(db, workflow_id, user)
        
        # Create workflow engine
        engine = WorkflowEngine(workflow.definition, db)
        
        # Execute workflow
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            result = loop.run_until_complete(engine.execute(execution_id))
            logger.info(f"Task: Execution {execution_id} completed successfully")
            return {
                "status": "success",
                "execution_id": str(execution_id),
                "result": result,
            }
        finally:
            loop.close()
        
    except Exception as e:
        logger.error(f"Task: Execution {execution_id} failed - {str(e)}")
        
        try:
            execution_id_obj = UUID(execution_id)
            ExecutionService.update_execution_status(
                db,
                execution_id_obj,
                "failed",
                str(e)
            )
        except:
            pass
        
        raise
    
    finally:
        db.close()


@celery_app.task(bind=True, name="execute_scheduled_workflow")
def execute_scheduled_workflow(self, workflow_id: str, user_id: str):
    """
    Execute a scheduled workflow
    
    Args:
        workflow_id: UUID of the workflow
        user_id: UUID of the user
    """
    db = SessionLocal()
    
    try:
        workflow_id = UUID(workflow_id)
        user_id = UUID(user_id)
        
        logger.info(f"Task: Starting scheduled execution for workflow {workflow_id}")
        
        # Get workflow
        from models.user import User
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise ValueError(f"User {user_id} not found")
        
        workflow = WorkflowService.get_workflow(db, workflow_id, user)
        
        # Create execution
        from schemas.execution import ExecutionCreate
        execution_data = ExecutionCreate(
            workflow_id=workflow_id,
            trigger_type="scheduled"
        )
        execution = ExecutionService.create_execution(db, user, execution_data)
        
        # Create workflow engine
        engine = WorkflowEngine(workflow.definition, db)
        
        # Execute workflow
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            result = loop.run_until_complete(engine.execute(execution.id))
            logger.info(f"Task: Scheduled execution {execution.id} completed successfully")
            return {
                "status": "success",
                "execution_id": str(execution.id),
                "result": result,
            }
        finally:
            loop.close()
        
    except Exception as e:
        logger.error(f"Task: Scheduled workflow execution failed - {str(e)}")
        raise
    
    finally:
        db.close()

