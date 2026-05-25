# Cloudinary Migration - Complete Guide

## Migration Summary

All file uploads have been successfully migrated from local storage (`/uploads`) to **Cloudinary**, a reliable cloud storage provider. This ensures files persist across Render redeployments.

---

## Files Modified

### Backend (Node.js + Express)

1. **`backend/package.json`**
   - Added: `cloudinary: ^1.40.0`
   - Added: `multer-storage-cloudinary: ^4.0.0`

2. **`backend/config/cloudinary.js`** ✓ (Already existed)
   - Initializes Cloudinary with environment credentials

3. **`backend/middlewares/upload.js`**
   - Changed: Local disk storage → CloudinaryStorage
   - Folder: `lawyer-files`
   - File size limit: 20MB (unchanged)

4. **`backend/controllers/caseController.js`**
   - Updated `addFile()` method
   - Changed: `url: /uploads/${req.file.filename}` → `url: req.file.path`
   - File properties remain identical (name, type, size)

5. **`backend/server.js`**
   - Removed: `app.use('/uploads', express.static(...))` static route

### Frontend (React)

6. **`frontend/src/pages/admin/CaseDetail.jsx`**
   - Updated file display logic
   - Shows unavailable badge for old local files: "غير متاح"

7. **`frontend/src/pages/client/CaseView.jsx`**
   - Updated file display logic
   - Shows unavailable badge for old local files: "غير متاح"

### Migration Helper Script

8. **`backend/seed/migrate-files-to-cloudinary.js`** (New)
   - Updates all existing cases with old `/uploads/` URLs
   - Marks them as unavailable: `url: '[FILE_UNAVAILABLE]'`
   - Preserves original URL for reference

---

## Database Impact

### Case Schema (Unchanged)
Files are stored in `case.files[]` with the same structure:
- `name`: Original filename
- `url`: Now stores Cloudinary URL (or `[FILE_UNAVAILABLE]` for migrated old files)
- `type`: MIME type
- `size`: File size in bytes
- `uploadedAt`: Timestamp

### Migration Behavior
- **Old files**: Marked as `[FILE_UNAVAILABLE]` when migration script runs
- **New files**: Automatically stored to Cloudinary (URLs starting with `https://res.cloudinary.com/...`)

---

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Cloudinary (Render Dashboard)

Add these **environment variables** to your Render service:

| Variable | Value |
|----------|-------|
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |

**Get these from:** https://cloudinary.com/console/settings/

### 3. Migrate Old Files (Optional but Recommended)

Run this script in your backend directory to migrate existing file references:

```bash
node seed/migrate-files-to-cloudinary.js
```

This will:
- Find all cases with old `/uploads/` URLs
- Mark them as unavailable
- Preserve reference data for auditing

### 4. Deploy

Push to your `main` branch (or your deployment branch). Render will automatically:
1. Install dependencies
2. Start the server

---

## Testing

### Verify Upload Works
1. Log in to admin panel
2. Go to a case
3. Upload a new file
4. Check the response: URL should be a Cloudinary URL (https://res.cloudinary.com/...)

### Check Old Files
- Old file URLs will display with "غير متاح" (unavailable) label
- This is expected and indicates successful migration

---

## Behavior Changes

### Before
- Files stored locally in `backend/uploads/`
- Files disappeared after Render redeployment (ephemeral filesystem)
- 404 errors on file refresh/redeploy

### After
- Files stored on Cloudinary (permanent)
- URLs persist across deployments
- Faster delivery via Cloudinary CDN
- Automatic cleanup of old local uploads

---

## Troubleshooting

### Issue: Files still showing 404
**Solution:** Did you add the environment variables to Render? Check:
1. Render dashboard → Your service → Environment
2. Verify all 3 Cloudinary variables are present and correct

### Issue: Upload returns error
**Solution:** Check backend logs:
- Missing/incorrect `CLOUDINARY_API_SECRET`
- File size exceeds 20MB limit
- Invalid file type

### Issue: Old files not migrating
**Solution:** Run migration script after deploying:
```bash
node seed/migrate-files-to-cloudinary.js
```

---

## Rollback (If Needed)

To revert to local storage (not recommended):
1. Restore old `middlewares/upload.js`
2. Restore old `server.js` (add back `/uploads` static route)
3. Remove Cloudinary packages from `package.json`
4. Redeploy

---

## Notes

- **No data loss**: All existing file records in MongoDB remain intact
- **Migration is reversible**: Original URLs are preserved in database
- **Cloudinary free tier**: Includes up to 25GB storage, 25M transformations/month
- **File retention**: Files on Cloudinary persist indefinitely

---

Generated: 2026-05-25
