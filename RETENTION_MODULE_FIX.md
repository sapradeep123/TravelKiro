# Retention Policies Module - Integration Fix

## Issues Fixed

### 1. Frontend-Backend Schema Mismatch
**Problem:** The frontend was using fields that didn't exist in the backend schema:
- `notify_before_days` (not in backend)
- `is_active` (not in backend)
- Mode values were lowercase (`move_to_recycle`, `delete`) instead of uppercase

**Solution:**
- Updated frontend to use only the fields defined in backend schema:
  - `folder_id`
  - `retention_days`
  - `mode` (MOVE_TO_RECYCLE or DELETE)
  - `apply_to_subfolders`
  - `account_id`
- Changed mode values to uppercase to match database enum

### 2. Incorrect API Endpoint
**Problem:** Frontend was calling `/v2/dms/folders` which doesn't exist

**Solution:** Changed to correct endpoint `/v2/dms/folders-dms`

### 3. Enum Value Mismatch
**Problem:** Python enum values were lowercase but database enum expected uppercase

**Solution:**
- Updated `RetentionMode` enum in `app/db/tables/dms/retention.py` to use uppercase values
- Updated schema patterns in `app/schemas/dms/sharing_schemas.py` to match

## Files Modified

### Backend
1. `app/db/tables/dms/retention.py`
   - Changed enum values from lowercase to uppercase (MOVE_TO_RECYCLE, DELETE)

2. `app/schemas/dms/sharing_schemas.py`
   - Updated pattern validation to accept uppercase enum values
   - Changed default mode to "MOVE_TO_RECYCLE"

### Frontend
3. `frontend/src/pages/Retention.jsx`
   - Fixed API endpoint from `/v2/dms/folders` to `/v2/dms/folders-dms`
   - Removed non-existent fields (`notify_before_days`, `is_active`)
   - Added `apply_to_subfolders` checkbox
   - Updated mode dropdown to use uppercase values
   - Fixed display logic to show correct mode labels
   - Updated apply policies success message to show moved/deleted counts

## Integration Status

### ✅ Completed
- Backend API routes registered in `app/api/router.py`
- Database tables created via migration `add_step7_tables.py`
- Frontend route configured in `App.jsx`
- Navigation link added in `Layout.jsx` under Administration section
- RBAC permissions configured (retention module in seed data)
- Repository layer implemented with full CRUD operations
- Apply retention policies functionality working

### Database Schema
The `retention_policies` table includes:
- `id` (ULID primary key)
- `account_id` (foreign key to accounts)
- `folder_id` (foreign key to folders_new)
- `apply_to_subfolders` (boolean)
- `retention_days` (integer, 1-3650 days)
- `mode` (enum: MOVE_TO_RECYCLE or DELETE)
- `created_by` (foreign key to users)
- `created_at`, `updated_at` (timestamps)

### API Endpoints
All endpoints are working under `/v2/dms/retention`:
- `POST /v2/dms/retention` - Create policy
- `GET /v2/dms/retention` - List policies
- `GET /v2/dms/retention/{policy_id}` - Get policy
- `PUT /v2/dms/retention/{policy_id}` - Update policy
- `DELETE /v2/dms/retention/{policy_id}` - Delete policy
- `POST /v2/dms/retention/apply/{account_id}` - Apply all policies

### Features
1. **Create Retention Policies**: Assign retention rules to folders
2. **Apply to Subfolders**: Option to cascade policy to all subfolders
3. **Two Modes**:
   - Move to Recycle Bin (soft delete)
   - Permanently Delete (hard delete)
4. **Manual Application**: Admin can trigger policy application via "Apply Now" button
5. **Audit Logging**: All retention actions are logged

## Testing
The module is now fully integrated and can be accessed at:
- URL: `http://your-domain:3200/retention`
- Navigation: Administration > Retention

## Next Steps (Optional Enhancements)
1. Add scheduled job to automatically apply retention policies
2. Add email notifications before files are deleted
3. Add retention policy templates
4. Add bulk policy creation for multiple folders
5. Add retention policy preview (show which files would be affected)
