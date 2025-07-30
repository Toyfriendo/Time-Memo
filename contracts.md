# Time Notes App - Backend Integration Contracts

## API Endpoints

### Memos Management
- `GET /api/memos` - Get all memos for a user
- `POST /api/memos` - Create a new memo
- `PUT /api/memos/{id}` - Update a memo
- `DELETE /api/memos/{id}` - Delete a memo
- `POST /api/memos/{id}/toggle-alarm` - Toggle alarm for a memo

### Image Management
- `POST /api/upload-image` - Upload image to local storage
- `GET /api/images/{filename}` - Serve uploaded images

## Data Models

### Memo Model
```json
{
  "id": "string",
  "title": "string",
  "content": "string", 
  "image": "string|null", // filename or null
  "alarm": {
    "enabled": "boolean",
    "time": "ISO datetime|null"
  },
  "type": "text|image",
  "created_at": "ISO datetime",
  "updated_at": "ISO datetime"
}
```

### Image Upload Response
```json
{
  "filename": "string",
  "url": "string"
}
```

## Mock Data to Replace

### Frontend Mock Services (/app/frontend/src/mock/mockData.js)
- `getMemos()` → API call to `GET /api/memos`
- `createMemo()` → API call to `POST /api/memos`
- `updateMemo()` → API call to `PUT /api/memos/{id}`
- `deleteMemo()` → API call to `DELETE /api/memos/{id}`

### Image Handling
- Replace base64 image storage with file upload
- Store images in `/app/backend/uploads/` directory
- Serve images via static file endpoint

## Frontend Integration Changes

### API Service Layer
1. Create `/app/frontend/src/services/api.js` for HTTP calls
2. Replace mock functions with real API calls
3. Handle image uploads with FormData
4. Update image display to use served image URLs

### Components Updates
1. **MemoModal.js**: Update image upload to use API endpoint
2. **MemoCard.js**: Update image src to use served URLs
3. **App.js**: Replace mock service imports with API service

## Backend Implementation Plan

### MongoDB Collections
- `memos` collection with memo documents
- No separate image collection (store filename in memo)

### File Storage
- Local file system at `/app/backend/uploads/`
- Generate unique filenames to prevent conflicts
- Serve via FastAPI static files

### Error Handling
- Validation errors for required fields
- File upload errors (size, type)
- Database connection errors
- Not found errors for invalid memo IDs

## Camera Integration
- Frontend camera capture remains client-side
- Convert captured image to blob and upload via API
- Same upload endpoint handles both file uploads and camera captures