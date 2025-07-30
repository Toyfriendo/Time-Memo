from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
import uuid

class AlarmModel(BaseModel):
    enabled: bool = False
    time: Optional[datetime] = None

class MemoBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., max_length=5000)
    image: Optional[str] = None  # filename
    alarm: AlarmModel = Field(default_factory=AlarmModel)
    type: Literal["text", "image"] = "text"

class MemoCreate(MemoBase):
    pass

class MemoUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = Field(None, max_length=5000)
    image: Optional[str] = None
    alarm: Optional[AlarmModel] = None
    type: Optional[Literal["text", "image"]] = None

class MemoResponse(MemoBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        from_attributes = True

class ImageUploadResponse(BaseModel):
    filename: str
    url: str