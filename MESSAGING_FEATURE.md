# Messaging Feature Implementation

## Overview
A complete real-time messaging system that allows users to chat with each other in the Butterfliy travel app.

## Features Implemented

### Backend (Node.js/Express + Prisma)

#### Database Schema
- **ChatConversation**: Stores conversations between two users
- **ChatMessage**: Stores individual messages
- **ChatRequest**: Manages chat requests (pending/approved/rejected)

#### API Endpoints

**Conversations**
- `GET /api/messaging/conversations` - Get all user conversations
- `GET /api/messaging/conversations/:userId` - Get or create conversation with a user
- `GET /api/messaging/conversations/:conversationId/messages` - Get messages (paginated)
- `POST /api/messaging/conversations/:conversationId/messages` - Send a message
- `DELETE /api/messaging/conversations/:conversationId` - Delete a conversation

**Chat Requests**
- `POST /api/messaging/requests` - Send a chat request
- `GET /api/messaging/requests` - Get pending chat requests
- `POST /api/messaging/requests/:requestId/approve` - Approve a chat request
- `POST /api/messaging/requests/:requestId/reject` - Reject a chat request

#### Services
- `messagingService.ts` - Business logic for messaging operations
- `messagingController.ts` - Request handlers
- `messaging.ts` - Route definitions

### Frontend (React Native/Expo)

#### Screens

**Messages Screen** (`/messages`)
- List of all conversations
- Search functionality
- Chat request notifications with badge
- Accept/reject chat requests
- Shows last message and timestamp
- Pull to refresh

**Chat Screen** (`/chat`)
- One-on-one conversation view
- Real-time message display
- Message input with send button
- Keyboard-aware scrolling
- Message timestamps
- Own messages vs received messages styling

#### Components
- Message bubbles with different styles for sent/received
- Avatar display for users
- Empty states for no conversations/messages
- Loading states

#### Integration
- Added "Message" button to user profiles (desktop & mobile)
- Clicking message button opens chat with that user
- Auto-creates conversation if it doesn't exist

## User Flow

1. **Starting a Chat**
   - User visits another user's profile
   - Clicks "Message" button
   - If no conversation exists, one is created automatically
   - Chat screen opens

2. **Sending Messages**
   - Type message in input field
   - Click send button
   - Message appears in conversation
   - Other user sees the message

3. **Viewing Conversations**
   - Navigate to Messages tab
   - See list of all conversations
   - Click on a conversation to open chat
   - See last message preview and time

4. **Chat Requests** (Optional - for privacy)
   - Send chat request to user
   - User receives notification
   - User can approve or reject
   - On approval, conversation is created

## Technical Details

### Security
- All endpoints require authentication
- Users can only access their own conversations
- Conversation IDs are validated before access
- Message length limited to 1000 characters

### Performance
- Messages are paginated (50 per page)
- Conversations sorted by last update
- Efficient database queries with proper indexes
- Optimistic UI updates for better UX

### Data Structure

**Conversation Object**
```typescript
{
  id: string;
  otherUser: {
    id: string;
    name: string;
    avatar: string | null;
  };
  lastMessage: {
    text: string;
    senderId: string;
    createdAt: string;
  } | null;
  updatedAt: string;
}
```

**Message Object**
```typescript
{
  id: string;
  conversationId: string;
  senderId: string;
  message: string;
  createdAt: string;
  sender: {
    id: string;
    profile: {
      name: string;
      avatar: string | null;
    };
  };
}
```

## Files Created/Modified

### Backend
- ✅ `backend/src/services/messagingService.ts` - New
- ✅ `backend/src/controllers/messagingController.ts` - New
- ✅ `backend/src/routes/messaging.ts` - New
- ✅ `backend/src/index.ts` - Modified (added messaging routes)

### Frontend
- ✅ `frontend/src/services/messagingService.ts` - New
- ✅ `frontend/app/(tabs)/messages.tsx` - New
- ✅ `frontend/app/chat.tsx` - New
- ✅ `frontend/app/user-profile.tsx` - Modified (added message button)

## Next Steps (Future Enhancements)

1. **Real-time Updates**
   - Implement WebSocket for live message delivery
   - Show typing indicators
   - Online/offline status

2. **Rich Media**
   - Send images/photos
   - Send location
   - Voice messages

3. **Group Chats**
   - Create group conversations
   - Add/remove members
   - Group admin features

4. **Message Features**
   - Message reactions (like, love, etc.)
   - Reply to specific messages
   - Delete/edit messages
   - Message read receipts

5. **Notifications**
   - Push notifications for new messages
   - In-app notification badges
   - Email notifications for missed messages

6. **Search & Filter**
   - Search within conversations
   - Filter by unread messages
   - Archive conversations

## Testing

To test the messaging feature:

1. Start the backend server: `cd backend && npm run dev`
2. Start the frontend: `cd frontend && npx expo start`
3. Login with two different user accounts (in different browsers/devices)
4. Navigate to a user profile and click "Message"
5. Send messages back and forth
6. Check the Messages tab to see all conversations

## Database Migration

The messaging tables already exist in the Prisma schema. No migration needed.

If you need to reset the database:
```bash
cd backend
npx prisma migrate reset
npx prisma migrate dev
```

## API Examples

**Send a message:**
```bash
POST /api/messaging/conversations/:conversationId/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Hello! How are you?"
}
```

**Get conversations:**
```bash
GET /api/messaging/conversations
Authorization: Bearer <token>
```

**Get messages:**
```bash
GET /api/messaging/conversations/:conversationId/messages?page=1
Authorization: Bearer <token>
```
