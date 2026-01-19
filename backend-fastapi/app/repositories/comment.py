"""Comment repository - Database operations for comments."""
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.comment import Comment


class CommentRepository:
    """Repository for Comment database operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_by_post_id(self, post_id: uuid.UUID) -> list[Comment]:
        """Get all comments for a post."""
        result = await self.db.execute(
            select(Comment)
            .where(Comment.post_id == post_id)
            .options(selectinload(Comment.author))
            .order_by(Comment.created_at.desc())
        )
        return list(result.scalars().all())
    
    async def create(self, comment: Comment) -> Comment:
        """Create a new comment."""
        self.db.add(comment)
        await self.db.flush()
        
        # Refresh with author
        result = await self.db.execute(
            select(Comment)
            .where(Comment.id == comment.id)
            .options(selectinload(Comment.author))
        )
        return result.scalar_one()
