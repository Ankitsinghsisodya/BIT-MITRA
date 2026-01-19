from fastapi import APIRouter
from app.api.v1 import user, post, message

api_router = APIRouter()

api_router.include_router(user.router, prefix="/user", tags=["User"])
api_router.include_router(post.router, prefix="/post", tags=["Post"])
api_router.include_router(message.router, prefix="/message", tags=["Message"])
