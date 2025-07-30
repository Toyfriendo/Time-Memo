from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from typing import List, Optional
import os
from pathlib import Path

# Database connection (reusing existing connection from server.py)
from server import db

class MemoDatabase:
    def __init__(self):
        self.collection = db.memos
    
    async def get_all_memos(self) -> List[dict]:
        """Get all memos sorted by creation date (newest first)"""
        cursor = self.collection.find({}).sort("created_at", -1)
        memos = await cursor.to_list(length=1000)
        
        # Convert ObjectId to string and ensure proper format
        for memo in memos:
            memo["id"] = str(memo.pop("_id", memo.get("id", "")))
        
        return memos
    
    async def create_memo(self, memo_data: dict) -> dict:
        """Create a new memo"""
        memo_data["created_at"] = datetime.utcnow()
        memo_data["updated_at"] = datetime.utcnow()
        
        result = await self.collection.insert_one(memo_data)
        memo_data["id"] = str(result.inserted_id)
        memo_data.pop("_id", None)
        
        return memo_data
    
    async def get_memo_by_id(self, memo_id: str) -> Optional[dict]:
        """Get a memo by ID"""
        from bson import ObjectId
        try:
            if len(memo_id) == 24:  # MongoDB ObjectId
                query = {"_id": ObjectId(memo_id)}
            else:
                query = {"id": memo_id}
            
            memo = await self.collection.find_one(query)
            if memo:
                memo["id"] = str(memo.pop("_id", memo.get("id", "")))
            return memo
        except Exception:
            return None
    
    async def update_memo(self, memo_id: str, update_data: dict) -> Optional[dict]:
        """Update a memo"""
        from bson import ObjectId
        
        update_data["updated_at"] = datetime.utcnow()
        
        try:
            if len(memo_id) == 24:  # MongoDB ObjectId
                query = {"_id": ObjectId(memo_id)}
            else:
                query = {"id": memo_id}
            
            result = await self.collection.update_one(
                query, 
                {"$set": update_data}
            )
            
            if result.modified_count > 0:
                return await self.get_memo_by_id(memo_id)
            return None
        except Exception:
            return None
    
    async def delete_memo(self, memo_id: str) -> bool:
        """Delete a memo"""
        from bson import ObjectId
        
        try:
            if len(memo_id) == 24:  # MongoDB ObjectId
                query = {"_id": ObjectId(memo_id)}
            else:
                query = {"id": memo_id}
            
            result = await self.collection.delete_one(query)
            return result.deleted_count > 0
        except Exception:
            return False

# Global database instance
memo_db = MemoDatabase()