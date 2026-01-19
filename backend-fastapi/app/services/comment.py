"""Comment service - Business logic for comment operations."""
import uuid
from fastapi import HTTPException, status
from app.models.comment import Comment
from app.repositories.comment import CommentRepository
from app.repositories.post import PostRepository


class CommentService:
    """Service layer for comment business logic."""
    
    def __init__(self, comment_repo: CommentRepository, post_repo: PostRepository):
        self.comment_repo = comment_repo
        self.post_repo = post_repo
    
    async def add_comment(
        self,
        post_id: uuid.UUID,
        text: str,
        author_id: uuid.UUID,
    ) -> Comment:
        """
        Add a comment to a post.
        
        Raises:
            HTTPException: If post not found
        """
        # Verify post exists
        post = await self.post_repo.get_by_id(post_id)
        
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found",
            )
        
        comment = Comment(
            text=text,
            author_id=author_id,
            post_id=post_id,
        )
        
        return await self.comment_repo.create(comment)
    
    async def get_post_comments(self, post_id: uuid.UUID) -> list[Comment]:
        """Get all comments for a post."""
        return await self.comment_repo.get_by_post_id(post_id)
