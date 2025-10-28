from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from uuid import UUID
from core.database import get_db
from core.dependencies import get_current_user
from schemas.integration import IntegrationCreate, IntegrationUpdate, IntegrationResponse
from services.integration_service import IntegrationService
from models.user import User

router = APIRouter(prefix="/integrations", tags=["integrations"])


@router.post("", response_model=IntegrationResponse)
def create_integration(
    integration_data: IntegrationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new integration"""
    try:
        integration = IntegrationService.create_integration(db, current_user, integration_data)
        return integration
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("", response_model=list[IntegrationResponse])
def list_integrations(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all integrations for current user"""
    integrations = IntegrationService.list_integrations(db, current_user, skip, limit)
    return integrations


@router.get("/{integration_id}", response_model=IntegrationResponse)
def get_integration(
    integration_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific integration"""
    try:
        integration = IntegrationService.get_integration(db, integration_id, current_user)
        return integration
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Integration not found",
        )


@router.put("/{integration_id}", response_model=IntegrationResponse)
def update_integration(
    integration_id: UUID,
    integration_data: IntegrationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update an integration"""
    try:
        integration = IntegrationService.update_integration(db, integration_id, current_user, integration_data)
        return integration
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Integration not found",
        )


@router.delete("/{integration_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_integration(
    integration_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete an integration"""
    try:
        IntegrationService.delete_integration(db, integration_id, current_user)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Integration not found",
        )

