import uuid
from io import BytesIO
from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form, BackgroundTasks
from PIL import Image
from app.api.deps import CurrentUser, DbSession
from app.schemas.user import (
    UserSignUpRequest,
    UserEditProfileRequest,
    UserResponse,
    UserProfileResponse,
    UserBasicResponse,
    TokenResponse,
    MessageResponse,
)
from app.core.security import OAuth2Form
from app.core.cloudinary import upload_image
from app.repositories.user import UserRepository
from app.services.user import UserService

router = APIRouter()


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(request: UserSignUpRequest, db: DbSession) -> UserResponse:
    """Register a new user with automatic validation."""
    repo = UserRepository(db)
    service = UserService(repo)
    
    user = await service.create_user(
        username=request.username,
        email=request.email,
        password=request.password,
    )
    
    return UserResponse.model_validate(user)


@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2Form, db: DbSession) -> TokenResponse:
    """OAuth2 compatible login endpoint."""
    repo = UserRepository(db)
    service = UserService(repo)
    
    access_token = await service.authenticate_user(
        email=form_data.username,  # OAuth2 uses 'username' field
        password=form_data.password,
    )
    
    return TokenResponse(access_token=access_token)


@router.post("/logout", response_model=MessageResponse)
async def logout() -> MessageResponse:
    """Logout endpoint (client-side token removal)."""
    return MessageResponse(message="Logout successful")


@router.get("/{user_id}/profile", response_model=UserProfileResponse)
async def get_profile(user_id: uuid.UUID, db: DbSession, current_user: CurrentUser) -> UserProfileResponse:
    """Get user profile by ID."""
    repo = UserRepository(db)
    service = UserService(repo)
    
    user = await service.get_profile(user_id)
    return UserProfileResponse.model_validate(user)


@router.patch("/profile", response_model=UserResponse)
async def edit_profile(
    current_user: CurrentUser,
    db: DbSession,
    bio: str | None = Form(None),
    gender: str | None = Form(None),
    profile_picture: UploadFile | None = File(None),
) -> UserResponse:
    """
    PATCH endpoint for partial profile update.
    
    Follows REST standards - PATCH for partial updates.
    """
    repo = UserRepository(db)
    service = UserService(repo)
    
    image_url = None
    if profile_picture:
        content = await profile_picture.read()
        img = Image.open(BytesIO(content))
        img.thumbnail((800, 800))
        buffer = BytesIO()
        img.save(buffer, format="JPEG", quality=80)
        buffer.seek(0)
        image_url = await upload_image(buffer.getvalue())
    
    user = await service.update_profile(
        user=current_user,
        bio=bio,
        gender=gender,
        profile_picture=image_url,
    )
    
    return UserResponse.model_validate(user)


@router.get("/suggested", response_model=list[UserBasicResponse])
async def get_suggested_users(current_user: CurrentUser, db: DbSession) -> list[UserBasicResponse]:
    """Get suggested users."""
    repo = UserRepository(db)
    service = UserService(repo)
    
    users = await service.get_suggested_users(current_user.id)
    return [UserBasicResponse.model_validate(u) for u in users]


@router.post("/{user_id}/follow", response_model=MessageResponse)
async def follow_user(user_id: uuid.UUID, current_user: CurrentUser, db: DbSession) -> MessageResponse:
    """Follow or unfollow a user."""
    repo = UserRepository(db)
    service = UserService(repo)
    
    message = await service.follow_user(user_id, current_user)
    return MessageResponse(message=message)
