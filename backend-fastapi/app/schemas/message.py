from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field


class MessageRequest(BaseModel):
    """Send message request."""
    message: str = Field(..., min_length=1, max_length=5000, description="Message text")


class MessageResponse(BaseModel):
    """Message response."""
    id: UUID
    sender_id: UUID
    receiver_id: UUID
    message: str
    created_at: datetime
    
    model_config = {"from_attributes": True}


class SendMessageResponse(BaseModel):
    """Response after sending a message."""
    success: bool = True
    new_message: MessageResponse


class GetMessagesResponse(BaseModel):
    """List of messages response."""
    success: bool = True
    messages: list[MessageResponse]
