# Community Module Seed Data

This script populates your database with sample users and community posts for testing the Community Module.

## What Gets Created

### 👥 Users (5 total)
1. **John Doe** - Regular user with public profile
   - Email: `john.doe@example.com`
   - Role: USER
   - Bio: Travel enthusiast exploring the world
   - Posts: 2

2. **Jane Smith** - Regular user with private profile
   - Email: `jane.smith@example.com`
   - Role: USER
   - Bio: Adventure seeker, mountain lover
   - Posts: 1
   - Profile: PRIVATE (requires follow approval)

3. **Raj Kumar** - Tourist Guide
   - Email: `raj.kumar@example.com`
   - Role: TOURIST_GUIDE
   - Bio: Professional tour guide with 10+ years experience
   - Posts: 1

4. **Priya Sharma** - Influencer
   - Email: `priya.sharma@example.com`
   - Role: USER
   - Bio: Travel Blogger & Content Creator
   - Posts: 1
   - Special: Marked as Influencer

5. **Amit Verma** - Celebrity
   - Email: `amit.verma@example.com`
   - Role: USER
   - Bio: Actor & Traveler
   - Posts: 1
   - Special: Marked as Celebrity

**All users have the same password:** `Test123!@#`

### 📝 Posts (6 total)
- Posts with real location references (Jaipur, Munnar)
- Posts with custom locations (Manali, Mumbai, Goa)
- Mix of single and multiple images
- One video post
- Realistic captions with hashtags

### 💬 Interactions
- **Likes**: 3 likes on John's first post
- **Comments**: 3 comments across different posts
- **Saved Posts**: 2 posts saved by different users

### 👥 Relationships
- **Follow Relationships**: 4 active follows
  - John → Raj (guide)
  - John → Priya (influencer)
  - Raj → Priya
  - Amit → Priya
- **Follow Requests**: 1 pending request
  - Raj → Jane (private profile)

### 📍 Locations
- Uses existing approved locations from database
- Creates 2 sample locations if none exist (Jaipur, Munnar)

## How to Run

### Prerequisites
1. Database is running and connected
2. Prisma migrations are up to date
3. Backend dependencies are installed

### Run the Seed Script

```bash
cd backend
npm run seed:community
```

### Expected Output

```
🌱 Starting Community Module Seeding...

👥 Creating sample users...
✅ Created user: John Doe (john.doe@example.com)
✅ Created user: Jane Smith (jane.smith@example.com)
✅ Created user: Raj Kumar (raj.kumar@example.com)
✅ Created user: Priya Sharma (priya.sharma@example.com)
✅ Created user: Amit Verma (amit.verma@example.com)

✅ Created 5 users

📍 Fetching locations...
✅ Found 2 existing locations

📝 Creating community posts...
✅ Created post by John Doe
✅ Created post by Jane Smith
✅ Created post by Raj Kumar
✅ Created post by Priya Sharma
✅ Created post by Amit Verma
✅ Created post by John Doe

✅ Created 6 posts

💬 Creating interactions...
✅ Created likes
✅ Created comments
✅ Created saved posts

👥 Creating follow relationships...
✅ Created follow relationships

📨 Creating follow request...
✅ Created follow request (User 3 → User 2)

📊 Updating post counts...
✅ Updated post counts

╔════════════════════════════════════════════════════════════╗
║                    SEEDING COMPLETE                        ║
╚════════════════════════════════════════════════════════════╝

📊 Summary:
   Users created: 5
   Posts created: 6
   Locations used: 2
   Likes created: 3
   Comments created: 3
   Saved posts: 2
   Follow relationships: 4
   Follow requests: 1

👤 Test Users (Password: Test123!@#):
   1. john.doe@example.com - Regular user (public)
   2. jane.smith@example.com - Regular user (private)
   3. raj.kumar@example.com - Tourist Guide
   4. priya.sharma@example.com - Influencer
   5. amit.verma@example.com - Celebrity

✅ You can now test the community module with these users!
   Login with any of the above credentials to explore the features.
```

## Testing Scenarios

### 1. Basic Feed Browsing
- Login as John Doe
- View global feed → Should see all 6 posts
- View Following tab → Should see posts from Raj and Priya only

### 2. Post Interactions
- Login as any user
- Like a post → Count should increment
- Comment on a post → Comment should appear
- Save a post → Should appear in Saved tab

### 3. User Profiles
- Login as John Doe
- View Raj's profile → Should see public profile with posts
- View Jane's profile → Should see "Private Profile" message
- View own profile → Should see all own posts

### 4. Follow Workflows

#### Public Profile Follow
- Login as any user
- Visit Raj's profile
- Click Follow → Should immediately follow

#### Private Profile Follow
- Login as John Doe
- Visit Jane's profile
- Click Follow → Should send follow request
- Login as Jane
- View follow requests → Should see John's request
- Approve/Reject request

### 5. Post Creation
- Login as any user
- Create new post with location
- Create new post with custom location
- Upload images
- Add caption with hashtags

### 6. Search and Filter
- Search for posts by location
- Filter by following
- View location-specific feed

### 7. Privacy Features
- Login as Jane (private profile)
- Toggle privacy mode
- Verify follow requests are required

### 8. Blocking and Muting
- Login as any user
- Block another user → Their posts should disappear
- Mute another user → Their posts should disappear
- Unblock/Unmute → Posts should reappear

## Cleanup

To remove all seeded data:

```sql
-- Delete in this order to respect foreign key constraints
DELETE FROM comments WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@example.com'
);

DELETE FROM post_likes WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@example.com'
);

DELETE FROM saved_posts WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@example.com'
);

DELETE FROM follow_requests WHERE follower_id IN (
  SELECT id FROM users WHERE email LIKE '%@example.com'
);

DELETE FROM follows WHERE follower_id IN (
  SELECT id FROM users WHERE email LIKE '%@example.com'
);

DELETE FROM community_posts WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@example.com'
);

DELETE FROM user_profiles WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@example.com'
);

DELETE FROM users WHERE email LIKE '%@example.com';
```

Or use Prisma Studio to manually delete the test users.

## Re-running the Script

If you run the script multiple times, it will create duplicate users with the same email addresses, which will fail due to unique constraints.

To re-run:
1. Clean up existing test data (see Cleanup section above)
2. Run the seed script again

## Troubleshooting

### Error: "Unique constraint failed on email"
**Solution**: Test users already exist. Clean up first or use different email addresses.

### Error: "Foreign key constraint failed"
**Solution**: Ensure database migrations are up to date:
```bash
npm run prisma:migrate
```

### Error: "Cannot find module"
**Solution**: Ensure dependencies are installed:
```bash
npm install
```

### No locations found
**Solution**: The script will automatically create 2 sample locations if none exist.

## Data Validation

All seeded data:
- ✅ Uses real database relationships (no hardcoded IDs)
- ✅ Follows Prisma schema constraints
- ✅ Includes proper foreign key references
- ✅ Has realistic content and captions
- ✅ Uses proper enum values (UserRole, MediaType, etc.)
- ✅ Maintains referential integrity

## Next Steps

After seeding:
1. Start the backend server: `npm run dev`
2. Start the frontend app
3. Login with any test user
4. Explore the community features
5. Test all interactions
6. Verify data persistence
7. Check API responses

## API Endpoints to Test

With seeded data, you can test:

- `GET /api/community/posts` - Global feed
- `GET /api/community/posts/:id` - Single post
- `POST /api/community/posts` - Create post
- `POST /api/community/posts/:id/like` - Like/unlike
- `POST /api/community/posts/:id/comment` - Add comment
- `POST /api/community/posts/:id/save` - Save/unsave
- `GET /api/community/posts/saved` - Saved posts
- `GET /api/community/users/:id/profile` - User profile
- `POST /api/community/users/:id/follow` - Follow user
- `GET /api/community/follow-requests` - Follow requests

## Support

If you encounter any issues:
1. Check the console output for specific errors
2. Verify database connection
3. Ensure all migrations are applied
4. Check Prisma schema matches database
5. Review the seed script logs

---

**Created**: 2025-11-12
**Version**: 1.0.0
