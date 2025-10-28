from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from core.database import get_db
from core.dependencies import get_current_user
from schemas.user import UserCreate, LoginRequest, LoginResponse, UserResponse
from services.auth_service import AuthService
from models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=LoginResponse)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    """Register a new user"""
    try:
        user = AuthService.register(db, user_data)
        # Create access token
        from core.security import create_access_token
        from datetime import timedelta
        
        access_token = create_access_token(
            data={"sub": str(user.id)},
            expires_delta=timedelta(minutes=30),
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user,
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/login", response_model=LoginResponse)
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db),
):
    """Login user and return access token"""
    try:
        user, access_token = AuthService.login(db, login_data)
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user,
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )


@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: User = Depends(get_current_user),
):
    """Get current user information"""
    return current_user

