from sqlalchemy.orm import Session
from uuid import UUID
from models.integration import Integration
from models.user import User
from schemas.integration import IntegrationCreate, IntegrationUpdate


class IntegrationService:
    """Service for integration operations"""
    
    @staticmethod
    def create_integration(db: Session, user: User, integration_data: IntegrationCreate) -> Integration:
        """Create a new integration"""
        integration = Integration(
            user_id=user.id,
            name=integration_data.name,
            type=integration_data.type,
            config=integration_data.config,
        )
        
        db.add(integration)
        db.commit()
        db.refresh(integration)
        
        return integration
    
    @staticmethod
    def get_integration(db: Session, integration_id: UUID, user: User) -> Integration:
        """Get integration by ID"""
        integration = db.query(Integration).filter(
            Integration.id == integration_id,
            Integration.user_id == user.id,
        ).first()
        
        if not integration:
            raise ValueError(f"Integration {integration_id} not found")
        
        return integration
    
    @staticmethod
    def list_integrations(db: Session, user: User, skip: int = 0, limit: int = 100) -> list[Integration]:
        """List all integrations for a user"""
        return db.query(Integration).filter(
            Integration.user_id == user.id
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    def update_integration(db: Session, integration_id: UUID, user: User, integration_data: IntegrationUpdate) -> Integration:
        """Update an integration"""
        integration = IntegrationService.get_integration(db, integration_id, user)
        
        if integration_data.name is not None:
            integration.name = integration_data.name
        if integration_data.config is not None:
            integration.config = integration_data.config
        if integration_data.is_active is not None:
            integration.is_active = integration_data.is_active
        
        db.commit()
        db.refresh(integration)
        
        return integration
    
    @staticmethod
    def delete_integration(db: Session, integration_id: UUID, user: User) -> None:
        """Delete an integration"""
        integration = IntegrationService.get_integration(db, integration_id, user)
        db.delete(integration)
        db.commit()

