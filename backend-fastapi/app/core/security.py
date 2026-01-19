import uuid
from datetime import datetime, timedelta, timezone
from typing import Annotated
import jwt
from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.config import get_settings

settings = get_settings()

# Password hasher using Argon2
password_hasher = PasswordHash((Argon2Hasher(),))

# OAuth2 scheme - FastAPI's built-in security
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/user/login")


def hash_password(password: str) -> str:
    """Hash a password using Argon2."""
    return password_hasher.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    return password_hasher.verify(plain_password, hashed_password)


def create_access_token(user_id: uuid.UUID) -> str:
    """Create a JWT access token."""
    expire = datetime.now(timezone.utc) + timedelta(days=settings.jwt_expiration_days)
    payload = {
        "sub": str(user_id),  # 'sub' is the standard JWT claim for subject
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict | None:
    """Decode and verify a JWT token."""
    try:
        payload = jwt.decode(
            token, 
            settings.jwt_secret, 
            algorithms=[settings.jwt_algorithm]
        )
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: AsyncSession,
) -> "User":
    """
    Dependency to get the current authenticated user from Bearer token.
    Uses OAuth2PasswordBearer - the FastAPI standard.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    if not payload:
        raise credentials_exception
    
    user_id = payload.get("sub")
    if not user_id:
        raise credentials_exception
    
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise credentials_exception
    
    from app.models.user import User
    result = await db.execute(select(User).where(User.id == user_uuid))
    user = result.scalar_one_or_none()
    
    if not user:
        raise credentials_exception
    
    return user


# Type alias for OAuth2 form data (FastAPI standard for login)
OAuth2Form = Annotated[OAuth2PasswordRequestForm, Depends()]
