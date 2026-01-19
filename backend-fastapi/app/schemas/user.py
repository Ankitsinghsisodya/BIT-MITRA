from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator
from enum import Enum
import re


class GenderEnum(str, Enum):
    male = "male"
    female = "female"
    others = "others"


# Request schemas with Pydantic validators
class UserSignUpRequest(BaseModel):
    """User signup request with automatic validation."""
    username: str = Field(..., min_length=3, max_length=100, description="Username")
    email: EmailStr = Field(..., description="Email address")
    password: str = Field(..., min_length=6, description="Password")
    
    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        """Validate username contains only alphanumeric and underscores."""
        if not re.match(r"^[a-zA-Z0-9_]+$", v):
            raise ValueError("Username can only contain letters, numbers, and underscores")
        return v.lower()
    
    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password strength."""
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class UserEditProfileRequest(BaseModel):
    """Edit profile request."""
    bio: str | None = Field(None, max_length=500)
    gender: GenderEnum | None = None


# Response schemas - used with response_model for automatic serialization
class UserBasicResponse(BaseModel):
    """Basic user info for nested responses."""
    id: UUID
    user_name: str
    profile_picture: str = ""
    
    model_config = {"from_attributes": True}


class UserResponse(BaseModel):
    """Full user response."""
    id: UUID
    user_name: str
    email: str
    profile_picture: str = ""
    bio: str = ""
    gender: GenderEnum | None = None
    followers: list[UserBasicResponse] = []
    following: list[UserBasicResponse] = []
    created_at: datetime
    
    model_config = {"from_attributes": True}


class UserProfileResponse(BaseModel):
    """User profile with posts and bookmarks."""
    id: UUID
    user_name: str
    email: str
    profile_picture: str = ""
    bio: str = ""
    gender: GenderEnum | None = None
    followers: list[UserBasicResponse] = []
    following: list[UserBasicResponse] = []
    posts: list["PostResponse"] = []
    bookmarks: list["PostResponse"] = []
    
    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """OAuth2 token response - FastAPI standard."""
    access_token: str
    token_type: str = "bearer"


class MessageResponse(BaseModel):
    """Generic message response."""
    message: str
    success: bool = True


# Import PostResponse after definition to avoid circular import
from app.schemas.post import PostResponse  # noqa: E402

UserProfileResponse.model_rebuild()
