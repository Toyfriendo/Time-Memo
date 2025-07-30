import os
import uuid
import aiofiles
from pathlib import Path
from typing import Optional
from fastapi import UploadFile, HTTPException

# Create uploads directory
UPLOAD_DIR = Path("/app/backend/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Allowed image types
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

class FileHandler:
    @staticmethod
    def get_file_extension(filename: str) -> str:
        """Get file extension from filename"""
        return Path(filename).suffix.lower()
    
    @staticmethod
    def generate_unique_filename(original_filename: str) -> str:
        """Generate unique filename while preserving extension"""
        extension = FileHandler.get_file_extension(original_filename)
        unique_id = str(uuid.uuid4())
        return f"{unique_id}{extension}"
    
    @staticmethod
    def validate_image_file(file: UploadFile) -> bool:
        """Validate if file is a valid image"""
        if not file.filename:
            return False
        
        extension = FileHandler.get_file_extension(file.filename)
        return extension in ALLOWED_EXTENSIONS
    
    @staticmethod
    async def save_uploaded_file(file: UploadFile) -> str:
        """Save uploaded file and return filename"""
        # Validate file
        if not FileHandler.validate_image_file(file):
            raise HTTPException(
                status_code=400, 
                detail="Invalid file type. Only images are allowed."
            )
        
        # Check file size
        file_content = await file.read()
        if len(file_content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail="File too large. Maximum size is 5MB."
            )
        
        # Generate unique filename
        filename = FileHandler.generate_unique_filename(file.filename)
        file_path = UPLOAD_DIR / filename
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(file_content)
        
        return filename
    
    @staticmethod
    async def save_base64_image(base64_data: str, original_filename: str = "image.jpg") -> str:
        """Save base64 image data and return filename"""
        import base64
        
        try:
            # Remove data URL prefix if present
            if base64_data.startswith('data:image/'):
                base64_data = base64_data.split(',')[1]
            
            # Decode base64
            image_data = base64.b64decode(base64_data)
            
            # Check file size
            if len(image_data) > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=400,
                    detail="Image too large. Maximum size is 5MB."
                )
            
            # Generate unique filename
            filename = FileHandler.generate_unique_filename(original_filename)
            file_path = UPLOAD_DIR / filename
            
            # Save file
            async with aiofiles.open(file_path, 'wb') as f:
                await f.write(image_data)
            
            return filename
            
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to process image: {str(e)}"
            )
    
    @staticmethod
    def delete_file(filename: str) -> bool:
        """Delete a file"""
        try:
            file_path = UPLOAD_DIR / filename
            if file_path.exists():
                file_path.unlink()
                return True
            return False
        except Exception:
            return False
    
    @staticmethod
    def get_file_path(filename: str) -> Optional[Path]:
        """Get file path if file exists"""
        file_path = UPLOAD_DIR / filename
        return file_path if file_path.exists() else None