"""Post service - Business logic for post operations."""
import uuid
from fastapi import HTTPException, status, BackgroundTasks
from app.models.post import Post
from app.models.user import User
from app.repositories.post import PostRepository
from app.websocket.manager import manager


class PostService:
    """Service layer for post business logic."""
    
    def __init__(self, repo: PostRepository):
        self.repo = repo
    
    async def create_post(self, caption: str, image_url: str, author_id: uuid.UUID) -> Post:
        """Create a new post."""
        post = Post(
            caption=caption,
            image=image_url,
            author_id=author_id,
        )
        return await self.repo.create(post)
    
    async def get_all_posts(self) -> list[Post]:
        """Get all posts."""
        return await self.repo.get_all()
    
    async def get_user_posts(self, author_id: uuid.UUID) -> list[Post]:
        """Get posts by specific author."""
        return await self.repo.get_by_author(author_id)
    
    async def like_post(
        self,
        post_id: uuid.UUID,
        user: User,
        background_tasks: BackgroundTasks,
    ) -> None:
        """
        Like a post and send notification in background.
        
        Uses BackgroundTasks - FastAPI standard for non-blocking operations.
        """
        post = await self.repo.get_by_id(post_id)
        
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found",
            )
        
        await self.repo.add_like(post, user)
        
        # Send notification in background - non-blocking
        if post.author_id != user.id:
            background_tasks.add_task(
                self._send_like_notification,
                str(post.author_id),
                str(user.id),
                user.user_name,
                user.profile_picture or "",
                str(post_id),
            )
    
    async def unlike_post(self, post_id: uuid.UUID, user: User) -> None:
        """Unlike a post."""
        post = await self.repo.get_by_id(post_id)
        
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found",
            )
        
        await self.repo.remove_like(post, user)
    
    async def delete_post(self, post_id: uuid.UUID, user_id: uuid.UUID) -> None:
        """
        Delete a post.
        
        Raises:
            HTTPException: If post not found or user not authorized
        """
        post = await self.repo.get_by_id(post_id)
        
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found",
            )
        
        if post.author_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this post",
            )
        
        await self.repo.delete(post_id)
    
    async def bookmark_post(self, post_id: uuid.UUID, user: User) -> bool:
        """
        Toggle bookmark on a post.
        
        Returns:
            bool: True if bookmarked, False if removed
        """
        post = await self.repo.get_by_id(post_id)
        
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found",
            )
        
        # Check current bookmark status
        from sqlalchemy import select
        from sqlalchemy.orm import selectinload
        from app.models.user import User as UserModel
        
        result = await self.repo.db.execute(
            select(UserModel)
            .where(UserModel.id == user.id)
            .options(selectinload(UserModel.bookmarks))
        )
        user_with_bookmarks = result.scalar_one()
        
        if post in user_with_bookmarks.bookmarks:
            await self.repo.remove_bookmark(post, user)
            return False
        else:
            await self.repo.add_bookmark(post, user)
            return True
    
    @staticmethod
    async def _send_like_notification(
        author_id: str,
        user_id: str,
        user_name: str,
        profile_picture: str,
        post_id: str,
    ) -> None:
        """Background task to send like notification via WebSocket."""
        await manager.send_notification(
            author_id,
            {
                "type": "like",
                "userId": user_id,
                "userDetails": {
                    "user_name": user_name,
                    "profile_picture": profile_picture,
                },
                "postId": post_id,
                "message": "Your post was liked",
            },
        )
