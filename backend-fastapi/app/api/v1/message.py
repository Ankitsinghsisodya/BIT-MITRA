import uuid
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.api.deps import CurrentUser, DbSession
from app.models.message import Message
from app.models.conversation import Conversation
from app.models.user import User
from app.schemas.message import MessageRequest, MessageResponse, SendMessageResponse, GetMessagesResponse
from app.websocket.manager import manager

router = APIRouter()


@router.post("/send/{receiver_id}", response_model=SendMessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    receiver_id: uuid.UUID,
    request: MessageRequest,  # Pydantic validates automatically
    current_user: CurrentUser,
    db: DbSession,
) -> dict:
    """Send a message to another user."""
    # Find or create conversation
    result = await db.execute(
        select(Conversation)
        .options(selectinload(Conversation.participants))
    )
    conversations = result.scalars().all()
    
    conversation = None
    for conv in conversations:
        participant_ids = {p.id for p in conv.participants}
        if current_user.id in participant_ids and receiver_id in participant_ids:
            conversation = conv
            break
    
    if not conversation:
        # Get receiver
        result = await db.execute(select(User).where(User.id == receiver_id))
        receiver = result.scalar_one_or_none()
        
        if not receiver:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Receiver not found")
        
        # Create new conversation
        conversation = Conversation()
        conversation.participants.append(current_user)
        conversation.participants.append(receiver)
        db.add(conversation)
        await db.flush()
    
    # Create message
    message = Message(
        sender_id=current_user.id,
        receiver_id=receiver_id,
        message=request.message,
        conversation_id=conversation.id,
    )
    db.add(message)
    await db.flush()
    await db.refresh(message)
    
    # Send via WebSocket
    await manager.send_message(
        str(receiver_id),
        MessageResponse.model_validate(message).model_dump(mode="json"),
    )
    
    return {
        "success": True,
        "new_message": MessageResponse.model_validate(message),
    }


@router.get("/conversation/{receiver_id}", response_model=GetMessagesResponse)
async def get_messages(receiver_id: uuid.UUID, current_user: CurrentUser, db: DbSession) -> dict:
    """Get all messages in a conversation with another user."""
    # Find conversation
    result = await db.execute(
        select(Conversation)
        .options(
            selectinload(Conversation.participants),
            selectinload(Conversation.messages),
        )
    )
    conversations = result.scalars().all()
    
    conversation = None
    for conv in conversations:
        participant_ids = {p.id for p in conv.participants}
        if current_user.id in participant_ids and receiver_id in participant_ids:
            conversation = conv
            break
    
    if not conversation:
        return {"success": True, "messages": []}
    
    return {
        "success": True,
        "messages": [MessageResponse.model_validate(m) for m in conversation.messages],
    }
