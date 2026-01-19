from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field
from app.schemas.comment import CommentResponse


class PostAuthor(BaseModel):
    """Post author info."""
    id: UUID
    user_name: str
    profile_picture: str = ""
    
    model_config = {"from_attributes": True}


class PostRequest(BaseModel):
    """Create post request."""
    caption: str = Field("", max_length=2000, description="Post caption")


class PostResponse(BaseModel):
    """Post response - used with response_model for automatic serialization."""
    id: UUID
    caption: str = ""
    image: str
    author: PostAuthor
    likes: list[PostAuthor] = []
    comments: list[CommentResponse] = []
    created_at: datetime
    
    model_config = {"from_attributes": True}


class PostCreateResponse(BaseModel):
    """Response after creating a post."""
    message: str
    post: PostResponse
    success: bool = True


class PostListResponse(BaseModel):
    """List of posts response."""
    posts: list[PostResponse]
    success: bool = True
