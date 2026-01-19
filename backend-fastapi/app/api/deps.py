from typing import Annotated
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User
from app.core.security import get_current_user, oauth2_scheme


# Database session dependency
DbSession = Annotated[AsyncSession, Depends(get_db)]


async def get_authenticated_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: DbSession,
) -> User:
    """Get current authenticated user using OAuth2 Bearer token."""
    return await get_current_user(token, db)


# Type alias for authenticated user dependency
CurrentUser = Annotated[User, Depends(get_authenticated_user)]
