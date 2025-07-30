from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from typing import List, Optional
import json

from models import MemoCreate, MemoUpdate, MemoResponse, ImageUploadResponse, AlarmModel
from database import memo_db
from file_handler import FileHandler

router = APIRouter(prefix="/api", tags=["memos"])

@router.get("/memos", response_model=List[MemoResponse])
async def get_memos():
    """Get all memos"""
    try:
        memos = await memo_db.get_all_memos()
        return memos
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch memos: {str(e)}")

@router.post("/memos", response_model=MemoResponse)
async def create_memo(memo: MemoCreate):
    """Create a new memo"""
    try:
        memo_data = memo.dict()
        created_memo = await memo_db.create_memo(memo_data)
        return created_memo
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create memo: {str(e)}")

@router.get("/memos/{memo_id}", response_model=MemoResponse)
async def get_memo(memo_id: str):
    """Get a specific memo"""
    memo = await memo_db.get_memo_by_id(memo_id)
    if not memo:
        raise HTTPException(status_code=404, detail="Memo not found")
    return memo

@router.put("/memos/{memo_id}", response_model=MemoResponse)
async def update_memo(memo_id: str, memo_update: MemoUpdate):
    """Update a memo"""
    # Remove None values from update
    update_data = {k: v for k, v in memo_update.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data provided for update")
    
    updated_memo = await memo_db.update_memo(memo_id, update_data)
    if not updated_memo:
        raise HTTPException(status_code=404, detail="Memo not found")
    
    return updated_memo

@router.delete("/memos/{memo_id}")
async def delete_memo(memo_id: str):
    """Delete a memo"""
    # Get memo to delete associated image
    memo = await memo_db.get_memo_by_id(memo_id)
    
    # Delete the memo
    success = await memo_db.delete_memo(memo_id)
    if not success:
        raise HTTPException(status_code=404, detail="Memo not found")
    
    # Delete associated image if exists
    if memo and memo.get("image"):
        FileHandler.delete_file(memo["image"])
    
    return {"message": "Memo deleted successfully"}

@router.post("/memos/{memo_id}/toggle-alarm", response_model=MemoResponse)
async def toggle_memo_alarm(memo_id: str):
    """Toggle alarm for a memo"""
    memo = await memo_db.get_memo_by_id(memo_id)
    if not memo:
        raise HTTPException(status_code=404, detail="Memo not found")
    
    # Toggle alarm
    current_alarm = memo.get("alarm", {"enabled": False, "time": None})
    new_alarm = {
        "enabled": not current_alarm.get("enabled", False),
        "time": current_alarm.get("time")
    }
    
    updated_memo = await memo_db.update_memo(memo_id, {"alarm": new_alarm})
    return updated_memo

@router.post("/upload-image", response_model=ImageUploadResponse)
async def upload_image(file: UploadFile = File(...)):
    """Upload an image file"""
    try:
        filename = await FileHandler.save_uploaded_file(file)
        url = f"/api/images/{filename}"
        return ImageUploadResponse(filename=filename, url=url)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")

@router.post("/upload-base64-image", response_model=ImageUploadResponse)
async def upload_base64_image(
    image_data: str = Form(...),
    filename: str = Form(default="image.jpg")
):
    """Upload a base64 encoded image (for camera captures)"""
    try:
        saved_filename = await FileHandler.save_base64_image(image_data, filename)
        url = f"/api/images/{saved_filename}"
        return ImageUploadResponse(filename=saved_filename, url=url)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")

@router.get("/images/{filename}")
async def get_image(filename: str):
    """Serve an uploaded image"""
    file_path = FileHandler.get_file_path(filename)
    if not file_path:
        raise HTTPException(status_code=404, detail="Image not found")
    
    return FileResponse(file_path)