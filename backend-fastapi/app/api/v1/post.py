import uuid
from io import BytesIO
from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form, BackgroundTasks, Response
from PIL import Image
from app.api.deps import CurrentUser, DbSession
from app.schemas.post import PostResponse, PostCreateResponse, PostListResponse
from app.schemas.comment import CommentRequest, CommentResponse, CommentsListResponse
from app.schemas.user import MessageResponse
from app.core.cloudinary import upload_image
from app.repositories.post import PostRepository
from app.repositories.comment import CommentRepository
from app.services.post import PostService
from app.services.comment import CommentService

router = APIRouter()


@router.post("", response_model=PostCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    current_user: CurrentUser,
    db: DbSession,
    image: UploadFile = File(...),
    caption: str = Form(""),
) -> PostCreateResponse:
    """Create a new post with image upload."""
    # Process image
    content = await image.read()
    img = Image.open(BytesIO(content))
    img.thumbnail((800, 800))
    buffer = BytesIO()
    img.save(buffer, format="JPEG", quality=80)
    buffer.seek(0)
    
    image_url = await upload_image(buffer.getvalue())
    
    # Create post via service
    repo = PostRepository(db)
    service = PostService(repo)
    
    post = await service.create_post(caption, image_url, current_user.id)
    
    return PostCreateResponse(
        message="Post created successfully",
        post=PostResponse.model_validate(post),
    )


@router.get("", response_model=PostListResponse)
async def get_all_posts(db: DbSession, current_user: CurrentUser) -> PostListResponse:
    """Get all posts."""
    repo = PostRepository(db)
    service = PostService(repo)
    
    posts = await service.get_all_posts()
    
    return PostListResponse(
        posts=[PostResponse.model_validate(p) for p in posts],
    )


@router.get("/me", response_model=PostListResponse)
async def get_my_posts(current_user: CurrentUser, db: DbSession) -> PostListResponse:
    """Get current user's posts."""
    repo = PostRepository(db)
    service = PostService(repo)
    
    posts = await service.get_user_posts(current_user.id)
    
    return PostListResponse(
        posts=[PostResponse.model_validate(p) for p in posts],
    )


@router.post("/{post_id}/like", response_model=MessageResponse)
async def like_post(
    post_id: uuid.UUID,
    current_user: CurrentUser,
    db: DbSession,
    background_tasks: BackgroundTasks,  # FastAPI BackgroundTasks for async notifications
) -> MessageResponse:
    """Like a post. Notification sent in background."""
    repo = PostRepository(db)
    service = PostService(repo)
    
    await service.like_post(post_id, current_user, background_tasks)
    
    return MessageResponse(message="Post liked")


@router.delete("/{post_id}/like", response_model=MessageResponse)
async def unlike_post(
    post_id: uuid.UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> MessageResponse:
    """Unlike a post. Proper REST - DELETE to remove like."""
    repo = PostRepository(db)
    service = PostService(repo)
    
    await service.unlike_post(post_id, current_user)
    
    return MessageResponse(message="Post unliked")


@router.post("/{post_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def add_comment(
    post_id: uuid.UUID,
    request: CommentRequest,
    current_user: CurrentUser,
    db: DbSession,
) -> CommentResponse:
    """Add a comment to a post."""
    comment_repo = CommentRepository(db)
    post_repo = PostRepository(db)
    service = CommentService(comment_repo, post_repo)
    
    comment = await service.add_comment(post_id, request.text, current_user.id)
    
    return CommentResponse.model_validate(comment)


@router.get("/{post_id}/comments", response_model=CommentsListResponse)
async def get_comments(post_id: uuid.UUID, current_user: CurrentUser, db: DbSession) -> CommentsListResponse:
    """Get all comments for a post."""
    comment_repo = CommentRepository(db)
    post_repo = PostRepository(db)
    service = CommentService(comment_repo, post_repo)
    
    comments = await service.get_post_comments(post_id)
    
    return CommentsListResponse(
        comments=[CommentResponse.model_validate(c) for c in comments],
    )


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: uuid.UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> Response:
    """
    Delete a post.
    
    Returns HTTP 204 No Content - FastAPI standard for successful DELETE.
    """
    repo = PostRepository(db)
    service = PostService(repo)
    
    await service.delete_post(post_id, current_user.id)
    
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{post_id}/bookmark", response_model=MessageResponse)
async def bookmark_post(
    post_id: uuid.UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> MessageResponse:
    """Bookmark or unbookmark a post."""
    repo = PostRepository(db)
    service = PostService(repo)
    
    is_bookmarked = await service.bookmark_post(post_id, current_user)
    
    message = "Post bookmarked" if is_bookmarked else "Bookmark removed"
    return MessageResponse(message=message)
