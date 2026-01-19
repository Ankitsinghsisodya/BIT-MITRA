import uuid
from datetime import datetime
from enum import Enum as PyEnum
from sqlalchemy import String, Text, Enum, DateTime, Table, Column, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class GenderEnum(str, PyEnum):
    male = "male"
    female = "female"
    others = "others"


# Association table for followers/following (many-to-many self-referential)
followers_table = Table(
    "followers",
    Base.metadata,
    Column("follower_id", UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True),
    Column("following_id", UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True),
)

# Association table for bookmarks (many-to-many user-post)
bookmarks_table = Table(
    "bookmarks",
    Base.metadata,
    Column("user_id", UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True),
    Column("post_id", UUID(as_uuid=True), ForeignKey("posts.id"), primary_key=True),
)

# Association table for likes (many-to-many user-post)
likes_table = Table(
    "likes",
    Base.metadata,
    Column("user_id", UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True),
    Column("post_id", UUID(as_uuid=True), ForeignKey("posts.id"), primary_key=True),
)


class User(Base):
    """User model."""
    __tablename__ = "users"
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4
    )
    user_name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    profile_picture: Mapped[str | None] = mapped_column(Text, default="")
    bio: Mapped[str | None] = mapped_column(Text, default="")
    gender: Mapped[str | None] = mapped_column(
        Enum(GenderEnum, name="gender_enum", create_constraint=True),
        nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow
    )
    
    # Relationships
    posts: Mapped[list["Post"]] = relationship(
        "Post", 
        back_populates="author",
        lazy="selectin"
    )
    
    # Self-referential many-to-many for followers/following
    followers: Mapped[list["User"]] = relationship(
        "User",
        secondary=followers_table,
        primaryjoin=id == followers_table.c.following_id,
        secondaryjoin=id == followers_table.c.follower_id,
        backref="following",
        lazy="selectin"
    )
    
    # Bookmarks
    bookmarks: Mapped[list["Post"]] = relationship(
        "Post",
        secondary=bookmarks_table,
        backref="bookmarked_by",
        lazy="selectin"
    )


# Import Post here to avoid circular imports - it will be defined in post.py
from app.models.post import Post  # noqa: E402, F401
