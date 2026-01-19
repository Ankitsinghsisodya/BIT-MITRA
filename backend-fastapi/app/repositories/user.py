"""User repository - Database operations for users."""
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.user import User


class UserRepository:
    """Repository for User database operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_by_id(self, user_id: uuid.UUID, with_relations: bool = False) -> User | None:
        """Get user by ID."""
        query = select(User).where(User.id == user_id)
        
        if with_relations:
            query = query.options(
                selectinload(User.posts),
                selectinload(User.bookmarks),
                selectinload(User.followers),
                selectinload(User.following),
            )
        
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_by_email(self, email: str) -> User | None:
        """Get user by email."""
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()
    
    async def get_by_username(self, username: str) -> User | None:
        """Get user by username."""
        result = await self.db.execute(select(User).where(User.user_name == username))
        return result.scalar_one_or_none()
    
    async def get_all_except(self, user_id: uuid.UUID) -> list[User]:
        """Get all users except specified user."""
        result = await self.db.execute(select(User).where(User.id != user_id))
        return list(result.scalars().all())
    
    async def create(self, user: User) -> User:
        """Create a new user."""
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        return user
    
    async def update(self, user: User) -> User:
        """Update user."""
        await self.db.flush()
        await self.db.refresh(user)
        return user
    
    async def add_follower(self, user: User, follower: User) -> None:
        """Add a follower to user."""
        result = await self.db.execute(
            select(User).where(User.id == user.id).options(selectinload(User.followers))
        )
        user_with_followers = result.scalar_one()
        
        if follower not in user_with_followers.followers:
            user_with_followers.followers.append(follower)
            await self.db.flush()
    
    async def remove_follower(self, user: User, follower: User) -> None:
        """Remove a follower from user."""
        result = await self.db.execute(
            select(User).where(User.id == user.id).options(selectinload(User.followers))
        )
        user_with_followers = result.scalar_one()
        
        if follower in user_with_followers.followers:
            user_with_followers.followers.remove(follower)
            await self.db.flush()
