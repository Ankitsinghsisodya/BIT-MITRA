import uuid
from datetime import datetime
from sqlalchemy import String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
from app.models.user import likes_table


class Post(Base):
    """Post model."""
    __tablename__ = "posts"
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4
    )
    caption: Mapped[str | None] = mapped_column(Text, default="")
    image: Mapped[str] = mapped_column(Text, nullable=False)
    author_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("users.id"), 
        nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationships
    author: Mapped["User"] = relationship(
        "User", 
        back_populates="posts",
        lazy="selectin"
    )
    
    comments: Mapped[list["Comment"]] = relationship(
        "Comment",
        back_populates="post",
        lazy="selectin",
        cascade="all, delete-orphan"
    )
    
    # Many-to-many for likes
    likes: Mapped[list["User"]] = relationship(
        "User",
        secondary=likes_table,
        backref="liked_posts",
        lazy="selectin"
    )


# Forward reference imports
from app.models.user import User  # noqa: E402, F401
from app.models.comment import Comment  # noqa: E402, F401
