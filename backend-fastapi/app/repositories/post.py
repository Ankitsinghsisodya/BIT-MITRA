"""Post repository - Database operations for posts."""
import uuid
from sqlalchemy import select, delete as sql_delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.post import Post
from app.models.comment import Comment
from app.models.user import User


class PostRepository:
    """Repository for Post database operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_by_id(self, post_id: uuid.UUID) -> Post | None:
        """Get post by ID with all relations."""
        result = await self.db.execute(
            select(Post)
            .where(Post.id == post_id)
            .options(
                selectinload(Post.author),
                selectinload(Post.likes),
                selectinload(Post.comments).selectinload(Comment.author),
            )
        )
        return result.scalar_one_or_none()
    
    async def get_all(self) -> list[Post]:
        """Get all posts sorted by newest first."""
        result = await self.db.execute(
            select(Post)
            .order_by(Post.created_at.desc())
            .options(
                selectinload(Post.author),
                selectinload(Post.likes),
                selectinload(Post.comments).selectinload(Comment.author),
            )
        )
        return list(result.scalars().all())
    
    async def get_by_author(self, author_id: uuid.UUID) -> list[Post]:
        """Get all posts by author."""
        result = await self.db.execute(
            select(Post)
            .where(Post.author_id == author_id)
            .order_by(Post.created_at.desc())
            .options(
                selectinload(Post.author),
                selectinload(Post.likes),
                selectinload(Post.comments).selectinload(Comment.author),
            )
        )
        return list(result.scalars().all())
    
    async def create(self, post: Post) -> Post:
        """Create a new post."""
        self.db.add(post)
        await self.db.flush()
        
        # Refresh with relations
        result = await self.db.execute(
            select(Post)
            .where(Post.id == post.id)
            .options(selectinload(Post.author), selectinload(Post.comments))
        )
        return result.scalar_one()
    
    async def delete(self, post_id: uuid.UUID) -> None:
        """Delete post and associated comments."""
        # Delete comments
        await self.db.execute(sql_delete(Comment).where(Comment.post_id == post_id))
        
        # Delete post
        result = await self.db.execute(select(Post).where(Post.id == post_id))
        post = result.scalar_one_or_none()
        if post:
            await self.db.delete(post)
            await self.db.flush()
    
    async def add_like(self, post: Post, user: User) -> None:
        """Add a like to post."""
        if user not in post.likes:
            post.likes.append(user)
            await self.db.flush()
    
    async def remove_like(self, post: Post, user: User) -> None:
        """Remove a like from post."""
        if user in post.likes:
            post.likes.remove(user)
            await self.db.flush()
    
    async def add_bookmark(self, post: Post, user: User) -> None:
        """Add post to user's bookmarks."""
        result = await self.db.execute(
            select(User).where(User.id == user.id).options(selectinload(User.bookmarks))
        )
        user_with_bookmarks = result.scalar_one()
        
        if post not in user_with_bookmarks.bookmarks:
            user_with_bookmarks.bookmarks.append(post)
            await self.db.flush()
    
    async def remove_bookmark(self, post: Post, user: User) -> None:
        """Remove post from user's bookmarks."""
        result = await self.db.execute(
            select(User).where(User.id == user.id).options(selectinload(User.bookmarks))
        )
        user_with_bookmarks = result.scalar_one()
        
        if post in user_with_bookmarks.bookmarks:
            user_with_bookmarks.bookmarks.remove(post)
            await self.db.flush()
