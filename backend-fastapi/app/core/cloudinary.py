import cloudinary
import cloudinary.uploader
from app.config import get_settings

settings = get_settings()

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.cloud_name,
    api_key=settings.api_key,
    api_secret=settings.api_secret,
)


async def upload_image(file_content: bytes, folder: str = "bitmitra") -> str:
    """
    Upload image to Cloudinary.
    
    Args:
        file_content: Image bytes
        folder: Cloudinary folder name
        
    Returns:
        Secure URL of uploaded image
    """
    result = cloudinary.uploader.upload(
        file_content,
        folder=folder,
        resource_type="image",
    )
    return result.get("secure_url", "")


async def upload_image_from_base64(base64_data: str, folder: str = "bitmitra") -> str:
    """
    Upload base64 image to Cloudinary.
    
    Args:
        base64_data: Base64 encoded image data
        folder: Cloudinary folder name
        
    Returns:
        Secure URL of uploaded image
    """
    result = cloudinary.uploader.upload(
        base64_data,
        folder=folder,
        resource_type="image",
    )
    return result.get("secure_url", "")
