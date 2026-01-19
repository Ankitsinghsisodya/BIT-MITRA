import uuid
from datetime import datetime
from sqlalchemy import String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class Comment(Base):
    """Comment model."""
    __tablename__ = "comments"
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4
    )
    text: Mapped[str] = mapped_column(Text, nullable=False)
    author_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("users.id"), 
        nullable=False
    )
    post_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("posts.id"), 
        nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationships
    author: Mapped["User"] = relationship(
        "User",
        lazy="selectin"
    )
    
    post: Mapped["Post"] = relationship(
        "Post",
        back_populates="comments",
        lazy="selectin"
    )


# Forward reference imports
from app.models.user import User  # noqa: E402, F401
from app.models.post import Post  # noqa: E402, F401
