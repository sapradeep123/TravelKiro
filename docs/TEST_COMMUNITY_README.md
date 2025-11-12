# Community Module Testing Guide

This document explains how to run the end-to-end integration tests for the Community Module.

## Overview

The Community Module includes comprehensive testing coverage:

1. **Automated E2E Tests** (`test-community-e2e.js`) - Backend API integration tests
2. **Manual UI Tests** (`../frontend/test-community-ui.md`) - Frontend UI testing checklist

## Prerequisites

### Backend Requirements
- Node.js installed
- PostgreSQL database running
- Backend server running on port 3000
- Database migrated with all community module tables
- `axios` package installed (should already be in dependencies)

### Database Setup
Ensure your database has all required tables:
```bash
cd backend
npm run prisma:migrate
```

Required tables:
- `users`
- `user_profiles`
- `community_posts`
- `post_likes`
- `comments`
- `saved_posts`
- `follow_requests`
- `follows`
- `blocked_users`
- `muted_users`
- `post_reports`
- `locations` (optional, for location-based posts)

## Running Automated E2E Tests

### Step 1: Start Backend Server
```bash
cd backend
npm run dev
```

The server should be running on `http://localhost:3000`

### Step 2: Run E2E Tests
In a new terminal:
```bash
cd backend
node test-community-e2e.js
```

### Step 3: Review Results
The test script will:
- Create 2 test users automatically
- Test all community module features
- Display detailed results for each test
- Clean up test data at the end

### Expected Output
```
╔════════════════════════════════════════════════════════════╗
║   Community Module End-to-End Integration Tests            ║
╚════════════════════════════════════════════════════════════╝

API URL: http://localhost:3000
Starting tests...

=== Test 1: Authentication Setup ===
Registering test user 1...
✅ User 1 registered: abc123...
Registering test user 2...
✅ User 2 registered: def456...

=== Test 2: Post Creation Flow ===
...

╔════════════════════════════════════════════════════════════╗
║                      TEST SUMMARY                          ║
╚════════════════════════════════════════════════════════════╝

✅ PASS - Authentication Setup
✅ PASS - Post Creation Flow
✅ PASS - Feed Browsing with Pagination
✅ PASS - Interaction Types
✅ PASS - User Relationship Flows
✅ PASS - Profile Viewing with Privacy Modes
✅ PASS - Blocking Enforcement
✅ PASS - Reporting and Moderation
✅ PASS - Cleanup

Total: 9 tests
Passed: 9
Failed: 0

🎉 All tests passed!
```

## Test Coverage

### 1. Authentication Setup
- User registration
- JWT token generation
- Multiple user accounts

### 2. Post Creation Flow
- Create post with location
- Create post with custom location
- Media upload validation
- Location requirement validation

### 3. Feed Browsing with Pagination
- Global feed loading
- Pagination (page 1, page 2, etc.)
- Single post retrieval
- Location-specific feed

### 4. Interaction Types
- Like/unlike posts
- Add comments
- Delete comments
- Save/unsave posts
- View saved posts

### 5. User Relationship Flows
- Follow public profile
- Follow private profile (request)
- Approve/reject follow requests
- Unfollow user
- Mute/unmute user
- Toggle private mode

### 6. Profile Viewing with Privacy Modes
- View own profile
- View other user profiles
- Update profile (name, bio)
- Get user posts
- Privacy restrictions

### 7. Blocking Enforcement
- Block user
- Verify mutual invisibility
- Prevent interactions
- Filter from feed
- Unblock user

### 8. Reporting and Moderation
- Report post
- Prevent duplicate reports
- Admin moderation (manual testing required)

### 9. Cleanup
- Delete comments
- Delete posts
- Clean up test data

## Troubleshooting

### Test Fails: "Connection error"
**Problem**: Cannot connect to backend server

**Solution**:
1. Ensure backend is running: `cd backend && npm run dev`
2. Check server is on port 3000
3. Verify no firewall blocking localhost:3000

### Test Fails: "Post not found" or "User not found"
**Problem**: Database tables missing or not migrated

**Solution**:
```bash
cd backend
npm run prisma:migrate
npm run prisma:generate
```

### Test Fails: "Cannot interact with this post"
**Problem**: Blocking logic preventing interaction

**Solution**: This is expected behavior. The test should handle this gracefully.

### Test Fails: "Location data is required"
**Problem**: Post creation without location

**Solution**: This is expected behavior. The test validates this error.

### Test Fails: "Already following this user"
**Problem**: Test data not cleaned up from previous run

**Solution**: 
1. Manually delete test users from database
2. Or use unique email addresses (test script uses timestamps)

## Custom Configuration

### Change API URL
Set environment variable:
```bash
# Windows
set API_URL=http://localhost:4000
node test-community-e2e.js

# Linux/Mac
API_URL=http://localhost:4000 node test-community-e2e.js
```

### Adjust Test Data
Edit `test-community-e2e.js` to customize:
- Test user credentials
- Post content
- Media URLs
- Pagination sizes

## Manual UI Testing

For comprehensive UI testing, see:
```
frontend/test-community-ui.md
```

This includes:
- Responsive design testing (mobile, tablet, desktop)
- Touch interaction testing
- Visual regression testing
- Accessibility testing
- Performance testing

## Admin Testing

Some features require admin privileges:
- View moderation queue
- Hide/unhide posts
- Dismiss reports

To test admin features:
1. Create an admin user in the database
2. Set `role = 'ADMIN'` in the users table
3. Login as admin user
4. Manually test admin endpoints:
   - `GET /api/community/admin/reports`
   - `POST /api/community/admin/posts/:id/hide`
   - `POST /api/community/admin/posts/:id/unhide`
   - `POST /api/community/admin/reports/:id/dismiss`

## Continuous Integration

To integrate with CI/CD:

```yaml
# Example GitHub Actions workflow
name: Community Module Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd backend
          npm install
      
      - name: Run migrations
        run: |
          cd backend
          npm run prisma:migrate
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      
      - name: Start backend
        run: |
          cd backend
          npm run dev &
          sleep 10
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      
      - name: Run E2E tests
        run: |
          cd backend
          node test-community-e2e.js
```

## Performance Benchmarks

Expected performance metrics:
- Post creation: < 500ms
- Feed loading (20 posts): < 1s
- Single post retrieval: < 200ms
- Like/unlike: < 300ms
- Comment creation: < 400ms
- Follow/unfollow: < 500ms

If tests are slower, check:
- Database indexes (see design.md)
- Network latency
- Database connection pool
- Server resources

## Test Data Cleanup

The test script automatically cleans up:
- Created posts
- Created comments
- Follow relationships
- Reports

However, test users remain in the database. To clean up manually:
```sql
-- Delete test users (be careful in production!)
DELETE FROM users WHERE email LIKE 'test_community%@example.com';
```

## Next Steps

After all tests pass:
1. ✅ Run manual UI tests (see `frontend/test-community-ui.md`)
2. ✅ Test on real devices (iOS, Android)
3. ✅ Test responsive design on various screen sizes
4. ✅ Perform accessibility testing
5. ✅ Load testing with many users/posts
6. ✅ Security testing (SQL injection, XSS, etc.)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review test output for specific error messages
3. Check backend logs for detailed errors
4. Verify database schema matches design.md
5. Ensure all dependencies are installed

## Test Maintenance

Update tests when:
- Adding new features
- Changing API endpoints
- Modifying data models
- Updating validation rules

Keep tests in sync with:
- `requirements.md` - Feature requirements
- `design.md` - System design
- `tasks.md` - Implementation tasks
