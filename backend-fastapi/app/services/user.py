"""User service - Business logic for user operations."""
import uuid
from fastapi import HTTPException, status, BackgroundTasks
from app.models.user import User
from app.repositories.user import UserRepository
from app.core.security import hash_password, verify_password, create_access_token


class UserService:
    """Service layer for user business logic."""
    
    def __init__(self, repo: UserRepository):
        self.repo = repo
    
    async def create_user(self, username: str, email: str, password: str) -> User:
        """
        Create a new user with validation.
        
        Raises:
            HTTPException: If email or username already exists
        """
        # Check existing email
        if await self.repo.get_by_email(email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        
        # Check existing username
        if await self.repo.get_by_username(username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken",
            )
        
        # Create user
        user = User(
            user_name=username,
            email=email,
            password=hash_password(password),
        )
        
        return await self.repo.create(user)
    
    async def authenticate_user(self, email: str, password: str) -> str:
        """
        Authenticate user and return access token.
        
        Returns:
            str: JWT access token
            
        Raises:
            HTTPException: If credentials are invalid
        """
        user = await self.repo.get_by_email(email)
        
        if not user or not verify_password(password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return create_access_token(user.id)
    
    async def get_profile(self, user_id: uuid.UUID) -> User:
        """
        Get user profile with all relations.
        
        Raises:
            HTTPException: If user not found
        """
        user = await self.repo.get_by_id(user_id, with_relations=True)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        
        return user
    
    async def update_profile(
        self,
        user: User,
        bio: str | None = None,
        gender: str | None = None,
        profile_picture: str | None = None,
    ) -> User:
        """Update user profile (partial update - PATCH)."""
        if bio is not None:
            user.bio = bio
        if gender:
            user.gender = gender
        if profile_picture:
            user.profile_picture = profile_picture
        
        return await self.repo.update(user)
    
    async def get_suggested_users(self, current_user_id: uuid.UUID) -> list[User]:
        """Get suggested users (all except current user)."""
        return await self.repo.get_all_except(current_user_id)
    
    async def follow_user(self, target_user_id: uuid.UUID, current_user: User) -> str:
        """
        Follow or unfollow a user.
        
        Returns:
            str: Status message
            
        Raises:
            HTTPException: If user tries to follow themselves or user not found
        """
        if target_user_id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot follow/unfollow yourself",
            )
        
        target_user = await self.repo.get_by_id(target_user_id)
        
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        
        # Check if already following
        target_with_followers = await self.repo.get_by_id(
            target_user_id, with_relations=False
        )
        
        # Reload to check followers
        from sqlalchemy import select
        from sqlalchemy.orm import selectinload
        from app.models.user import User as UserModel
        
        result = await self.repo.db.execute(
            select(UserModel)
            .where(UserModel.id == target_user_id)
            .options(selectinload(UserModel.followers))
        )
        target_with_followers = result.scalar_one()
        
        if current_user in target_with_followers.followers:
            await self.repo.remove_follower(target_user, current_user)
            return "Unfollowed successfully"
        else:
            await self.repo.add_follower(target_user, current_user)
            return "Followed successfully"
