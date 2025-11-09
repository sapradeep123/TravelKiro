# Package Callback Feature Implementation Guide

## Status: ⚠️ IN PROGRESS

This document outlines the implementation of the callback/express interest feature for Packages, similar to the Events feature.

---

## ✅ Completed Steps:

### 1. Database Schema ✅
- Added `PackageCallbackRequest` table to schema
- Added relation to `Package` model
- Fields: id, packageId, name, phone, email, message, userId, isContacted, timestamps

### 2. Backend Routes ✅
- `POST /packages/:id/callback-request` - Submit callback request
- `GET /packages/:id/callback-requests` - Get requests for specific package
- `GET /packages/callback-requests/all` - Get all requests (admin/hosts)
- `PATCH /packages/callback-requests/:requestId/contacted` - Mark as contacted

### 3. Backend Controller ✅
- `createCallbackRequest()` - Handle callback submissions
- `getPackageCallbackRequests()` - Get requests for a package
- `getAllCallbackRequests()` - Get all requests (admin/hosts)
- `markAsContacted()` - Update contact status

---

## 🔄 Remaining Steps:

### 4. Backend Service (NEEDED)
File: `backend/src/services/packageService.ts`

Add these methods:
```typescript
async createCallbackRequest(data: {
  packageId: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  userId?: string;
}) {
  const pkg = await prisma.package.findUnique({
    where: { id: data.packageId },
  });

  if (!pkg) {
    throw new Error('Package not found');
  }

  if (pkg.approvalStatus !== 'APPROVED') {
    throw new Error('Cannot request callback for unapproved package');
  }

  const callbackRequest = await prisma.packageCallbackRequest.create({
    data: {
      packageId: data.packageId,
      name: data.name,
      phone: data.phone,
      email: data.email,
      message: data.message,
      userId: data.userId,
    },
  });

  // Create notification for package host
  await prisma.notification.create({
    data: {
      userId: pkg.hostId,
      title: 'New Callback Request',
      message: `${data.name} requested a callback for your package: ${pkg.title}`,
    },
  });

  return callbackRequest;
}

async getPackageCallbackRequests(packageId: string, userId: string, userRole: UserRole) {
  const pkg = await prisma.package.findUnique({
    where: { id: packageId },
  });

  if (!pkg) {
    throw new Error('Package not found');
  }

  // Only package host or admin can view callback requests
  if (pkg.hostId !== userId && userRole !== 'SITE_ADMIN') {
    throw new Error('Unauthorized to view callback requests');
  }

  const requests = await prisma.packageCallbackRequest.findMany({
    where: { packageId },
    orderBy: { createdAt: 'desc' },
  });

  return requests;
}

async getAllCallbackRequests(userId: string, userRole: UserRole) {
  if (userRole === 'SITE_ADMIN') {
    // Admin can see all callback requests
    const requests = await prisma.packageCallbackRequest.findMany({
      include: {
        package: {
          include: {
            host: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return requests;
  } else if (userRole === 'GOVT_DEPARTMENT' || userRole === 'TOURIST_GUIDE') {
    // Hosts can see callback requests for their packages
    const requests = await prisma.packageCallbackRequest.findMany({
      where: {
        package: {
          hostId: userId,
        },
      },
      include: {
        package: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return requests;
  } else {
    throw new Error('Unauthorized to view callback requests');
  }
}

async markAsContacted(requestId: string, userId: string, userRole: UserRole) {
  const request = await prisma.packageCallbackRequest.findUnique({
    where: { id: requestId },
    include: {
      package: true,
    },
  });

  if (!request) {
    throw new Error('Callback request not found');
  }

  // Only package host or admin can mark as contacted
  if (request.package.hostId !== userId && userRole !== 'SITE_ADMIN') {
    throw new Error('Unauthorized to update this callback request');
  }

  const updated = await prisma.packageCallbackRequest.update({
    where: { id: requestId },
    data: { isContacted: true },
  });

  return updated;
}
```

### 5. Frontend Service (NEEDED)
File: `frontend/src/services/packageService.ts`

Add these methods:
```typescript
async createCallbackRequest(packageId: string, data: {
  name: string;
  phone: string;
  email?: string;
  message?: string;
}): Promise<void> {
  await api.post(`/packages/${packageId}/callback-request`, data);
},

async getPackageCallbackRequests(packageId: string): Promise<any[]> {
  const response = await api.get(`/packages/${packageId}/callback-requests`);
  return response.data.data;
},

async getAllCallbackRequests(): Promise<any[]> {
  const response = await api.get('/packages/callback-requests/all');
  return response.data.data;
},

async markAsContacted(requestId: string): Promise<void> {
  await api.patch(`/packages/callback-requests/${requestId}/contacted`);
},
```

### 6. Frontend Packages Page (NEEDED)
File: `frontend/app/(tabs)/packages.tsx`

Add:
- "Request Callback" button on each package card
- Modal dialog with form (Name, Phone, Email, Message)
- Form submission handler
- Success/error alerts

### 7. Admin Callback Management Pages (NEEDED)

#### A. All Packages Callbacks Page
File: `frontend/app/(admin)/package-callbacks.tsx`
- View all package callback requests
- Stats dashboard
- Filter by status
- Contact users
- Mark as contacted

#### B. Package-Specific Callbacks Page
File: `frontend/app/(admin)/package-callback-requests.tsx`
- View requests for specific package
- Package details header
- Stats for that package
- Contact management

### 8. Admin Manage Packages Page (NEEDED)
File: `frontend/app/(admin)/manage-packages.tsx` (if exists)

Add:
- Green phone icon in Actions column
- Click to open package-specific callback requests page

---

## 🗄️ Database Migration

**IMPORTANT**: Run this migration before testing:

```bash
cd backend
npx prisma migrate dev --name add_package_callback_requests
npx prisma generate
```

If migration fails due to lock, restart PostgreSQL or wait for locks to clear.

---

## 📋 Testing Checklist

Once implementation is complete:

- [ ] Database migration successful
- [ ] Backend routes respond correctly
- [ ] Users can submit callback requests on packages page
- [ ] Admins can view all callback requests
- [ ] Package hosts can view their package requests
- [ ] Phone/email links work
- [ ] Mark as contacted updates status
- [ ] Notifications are created
- [ ] Back buttons navigate correctly

---

## 🎯 Quick Implementation Steps

1. **Add service methods** to `backend/src/services/packageService.ts`
2. **Run database migration**
3. **Update frontend service** `frontend/src/services/packageService.ts`
4. **Add callback button** to packages page
5. **Create admin pages** for callback management
6. **Test end-to-end**

---

## 📝 Notes

- This feature mirrors the Events callback feature
- Use Events implementation as reference
- Ensure proper authorization checks
- Test with different user roles
- Verify notifications are sent

---

## ✅ When Complete

The package callback feature will provide:
- User-friendly way to express interest in packages
- Contact management for package hosts
- Admin oversight of all requests
- Tracking of contacted vs pending requests

