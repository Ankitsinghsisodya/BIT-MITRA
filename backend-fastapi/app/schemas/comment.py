from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field


class CommentAuthor(BaseModel):
    """Comment author info."""
    id: UUID
    user_name: str
    profile_picture: str = ""
    
    model_config = {"from_attributes": True}


class CommentRequest(BaseModel):
    """Create comment request with validation."""
    text: str = Field(..., min_length=1, max_length=1000, description="Comment text")


class CommentResponse(BaseModel):
    """Comment response - used with response_model."""
    id: UUID
    text: str
    author: CommentAuthor
    post_id: UUID
    created_at: datetime
    
    model_config = {"from_attributes": True}


class CommentsListResponse(BaseModel):
    """List of comments response."""
    comments: list[CommentResponse]
    success: bool = True
