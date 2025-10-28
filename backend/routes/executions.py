from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from uuid import UUID
from core.database import get_db
from core.dependencies import get_current_user
from schemas.execution import ExecutionCreate, ExecutionResponse, ExecutionLogResponse
from services.execution_service import ExecutionService
from models.user import User

router = APIRouter(prefix="/executions", tags=["executions"])


@router.post("", response_model=ExecutionResponse)
def create_execution(
    execution_data: ExecutionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new execution (trigger workflow)"""
    try:
        execution = ExecutionService.create_execution(db, current_user, execution_data)
        # TODO: Queue execution task with Celery
        return execution
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/{execution_id}", response_model=ExecutionResponse)
def get_execution(
    execution_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific execution"""
    try:
        execution = ExecutionService.get_execution(db, execution_id, current_user)
        return execution
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Execution not found",
        )


@router.get("/{execution_id}/logs", response_model=list[ExecutionLogResponse])
def get_execution_logs(
    execution_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get logs for a specific execution"""
    try:
        logs = ExecutionService.get_execution_logs(db, execution_id)
        return logs
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Execution not found",
        )


@router.get("/workflow/{workflow_id}", response_model=list[ExecutionResponse])
def list_workflow_executions(
    workflow_id: UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List executions for a specific workflow"""
    executions = ExecutionService.list_executions(db, workflow_id, skip, limit)
    return executions

