# Package Callback - Quick Implementation Steps

## ✅ COMPLETED:
1. ✅ Database schema
2. ✅ Backend routes
3. ✅ Backend controller
4. ✅ Backend service
5. ✅ Frontend service

## 🔄 REMAINING (Copy from Events Implementation):

### 1. Update Packages Page
**File**: `frontend/app/(tabs)/packages.tsx`

**Add these imports:**
```typescript
import { Portal, Dialog, TextInput } from 'react-native-paper';
declare const window: any;
```

**Add state variables** (after existing useState):
```typescript
const [callbackModalVisible, setCallbackModalVisible] = useState(false);
const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
const [callbackForm, setCallbackForm] = useState({
  name: '',
  phone: '',
  email: '',
  message: '',
});
const [submitting, setSubmitting] = useState(false);
```

**Add handlers:**
```typescript
const handleExpressInterest = (pkg: Package) => {
  setSelectedPackage(pkg);
  setCallbackForm({
    name: user?.profile?.name || '',
    phone: user?.profile?.phone || '',
    email: user?.email || '',
    message: '',
  });
  setCallbackModalVisible(true);
};

const handleSubmitCallback = async () => {
  if (!selectedPackage) return;
  if (!callbackForm.name.trim() || !callbackForm.phone.trim()) {
    Alert.alert('Error', 'Please provide your name and phone number');
    return;
  }
  try {
    setSubmitting(true);
    await packageService.createCallbackRequest(selectedPackage.id, {
      name: callbackForm.name,
      phone: callbackForm.phone,
      email: callbackForm.email,
      message: callbackForm.message,
    });
    Alert.alert('Success!', `Your callback request for "${selectedPackage.title}" has been submitted!`);
    setCallbackModalVisible(false);
    setCallbackForm({ name: '', phone: '', email: '', message: '' });
  } catch (error: any) {
    Alert.alert('Error', error.response?.data?.error || 'Could not submit callback request');
  } finally {
    setSubmitting(false);
  }
};
```

**Add button in Card.Content** (before closing tag):
```typescript
{item.approvalStatus === 'APPROVED' && (
  <Button
    mode="contained"
    icon="phone"
    onPress={(e) => {
      e.stopPropagation();
      handleExpressInterest(item);
    }}
    style={styles.interestButton}
  >
    Request Callback
  </Button>
)}
```

**Add modal** (before closing View, copy from events.tsx):
```typescript
<Portal>
  <Dialog visible={callbackModalVisible} onDismiss={() => setCallbackModalVisible(false)}>
    <Dialog.Title>Request Callback</Dialog.Title>
    <Dialog.Content>
      {/* Form fields - copy from events.tsx */}
    </Dialog.Content>
    <Dialog.Actions>
      <Button onPress={() => setCallbackModalVisible(false)}>Cancel</Button>
      <Button onPress={handleSubmitCallback} mode="contained" loading={submitting}>
        Submit Request
      </Button>
    </Dialog.Actions>
  </Dialog>
</Portal>
```

### 2. Create Admin Pages

#### A. All Package Callbacks
**File**: `frontend/app/(admin)/package-callbacks.tsx`
- Copy from `event-callbacks.tsx`
- Replace "event" with "package"
- Update service calls to `packageService`

#### B. Package-Specific Callbacks  
**File**: `frontend/app/(admin)/package-callback-requests.tsx`
- Copy from `event-callback-requests.tsx`
- Replace "event" with "package"
- Update service calls to `packageService`

### 3. Add Icon to Manage Packages (if exists)
**File**: `frontend/app/(admin)/manage-packages.tsx`

Add phone icon in actions:
```typescript
<TouchableOpacity
  style={[styles.iconButton, styles.callbackButton]}
  onPress={() => {
    if (Platform.OS === 'web') {
      (window as any).open(`/package-callback-requests?packageId=${pkg.id}`, '_blank');
    }
  }}
>
  <Ionicons name="call" size={18} color="#10b981" />
</TouchableOpacity>
```

## 🗄️ Database Migration

**CRITICAL - Run this first:**
```bash
cd backend
# Stop backend if running
npx prisma migrate dev --name add_package_callback_requests
npx prisma generate
# Restart backend
```

## 🎯 Testing Steps

1. Run database migration
2. Restart backend server
3. Go to `/packages` page
4. Click "Request Callback" on any package
5. Fill form and submit
6. Login as admin
7. Go to `/package-callbacks` to see requests
8. Test phone/email links
9. Mark as contacted

## 📝 Quick Copy Commands

```bash
# Copy event files to package files
cp frontend/app/\(admin\)/event-callbacks.tsx frontend/app/\(admin\)/package-callbacks.tsx
cp frontend/app/\(admin\)/event-callback-requests.tsx frontend/app/\(admin\)/package-callback-requests.tsx

# Then do find-replace:
# event -> package
# Event -> Package
# eventService -> packageService
```

## ✅ When Complete

You'll have:
- ✅ Request callback button on packages
- ✅ Callback form modal
- ✅ Admin page to view all requests
- ✅ Package-specific requests page
- ✅ Contact management
- ✅ Status tracking

The implementation is 80% complete - just need to copy/adapt the frontend pages from events!
