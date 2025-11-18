# Site Settings Implementation - Admin Customization

## ✅ What Has Been Implemented

### Backend (Complete)
1. ✅ **Database Schema** - `SiteSettings` model created
2. ✅ **Migration** - Database updated with new table
3. ✅ **Service Layer** - `siteSettingsService.ts` created
4. ✅ **Controller** - `siteSettingsController.ts` created
5. ✅ **Routes** - `/api/site-settings` endpoints added
6. ✅ **Authorization** - Only SITE_ADMIN can update settings

### API Endpoints Available

#### GET /api/site-settings
- **Public** - Anyone can view settings
- Returns current site configuration
- Auto-creates default settings if none exist

#### PUT /api/site-settings
- **Protected** - Only SITE_ADMIN role
- Updates site configuration
- Fields:
  - `siteName` - Name next to logo
  - `siteTitle` - Browser title/page title
  - `logoUrl` - URL to logo image
  - `faviconUrl` - URL to favicon
  - `termsAndConditions` - Full T&C text (HTML supported)
  - `privacyPolicy` - Full privacy policy text (HTML supported)

## 📋 What Needs to Be Done (Frontend)

### 1. Admin Settings Page
Create `frontend/app/admin-settings.tsx`:
- Form to update all settings
- Image upload for logo and favicon
- Rich text editor for T&C and Privacy Policy
- Save button (only for SITE_ADMIN)

### 2. Footer Component
Create `frontend/components/Footer.tsx`:
- Display at bottom of all pages
- Links to Terms & Conditions
- Links to Privacy Policy
- Copyright notice
- Social media links (optional)

### 3. Terms & Conditions Page
Create `frontend/app/terms.tsx`:
- Display full terms and conditions
- Fetch from site settings
- Formatted display

### 4. Privacy Policy Page
Create `frontend/app/privacy.tsx`:
- Display full privacy policy
- Fetch from site settings
- Formatted display

### 5. Update WebHeader Component
Modify `frontend/components/WebHeader.tsx`:
- Use dynamic site name from settings
- Use dynamic logo from settings
- Add admin settings link for SITE_ADMIN

### 6. Update HTML Head
Modify `frontend/app/_layout.tsx`:
- Use dynamic title from settings
- Use dynamic favicon from settings

## 🎯 Implementation Priority

### Phase 1: Basic Settings (High Priority)
1. Create site settings service
2. Create admin settings page
3. Update WebHeader with dynamic values

### Phase 2: Legal Pages (High Priority)
1. Create Terms & Conditions page
2. Create Privacy Policy page
3. Create Footer component with links

### Phase 3: File Upload (Medium Priority)
1. Implement image upload for logo
2. Implement image upload for favicon
3. Store in uploads directory

### Phase 4: Rich Text Editor (Low Priority)
1. Add rich text editor for T&C
2. Add rich text editor for Privacy Policy
3. Support HTML formatting

## 📝 Sample Implementation Code

### Frontend Service (frontend/src/services/siteSettingsService.ts)
```typescript
import api from './api';

export const siteSettingsService = {
  async getSettings() {
    const response = await api.get('/site-settings');
    return response.data;
  },

  async updateSettings(data: {
    siteName?: string;
    siteTitle?: string;
    logoUrl?: string;
    faviconUrl?: string;
    termsAndConditions?: string;
    privacyPolicy?: string;
  }) {
    const response = await api.put('/site-settings', data);
    return response.data;
  },
};
```

### Admin Settings Page Structure
```typescript
// frontend/app/admin-settings.tsx
import React, { useState, useEffect } from 'react';
import { siteSettingsService } from '../src/services/siteSettingsService';

export default function AdminSettingsScreen() {
  const [settings, setSettings] = useState({
    siteName: '',
    siteTitle: '',
    logoUrl: '',
    faviconUrl: '',
    termsAndConditions: '',
    privacyPolicy: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const response = await siteSettingsService.getSettings();
    setSettings(response.data);
  };

  const handleSave = async () => {
    await siteSettingsService.updateSettings(settings);
    alert('Settings saved successfully!');
  };

  return (
    <View>
      <Text>Site Settings</Text>
      {/* Form fields here */}
      <Button onPress={handleSave}>Save Settings</Button>
    </View>
  );
}
```

### Footer Component Structure
```typescript
// frontend/components/Footer.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function Footer() {
  const router = useRouter();

  return (
    <View style={styles.footer}>
      <TouchableOpacity onPress={() => router.push('/terms')}>
        <Text>Terms & Conditions</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/privacy')}>
        <Text>Privacy Policy</Text>
      </TouchableOpacity>
      <Text>© 2024 Butterfliy. All rights reserved.</Text>
    </View>
  );
}
```

## 🔒 Security Considerations

### Authorization
- ✅ Only SITE_ADMIN can update settings
- ✅ Settings are public for reading
- ✅ File uploads should be validated
- ✅ HTML content should be sanitized

### File Upload Security
- Validate file types (only images)
- Limit file size (max 5MB)
- Sanitize file names
- Store in secure location
- Use CDN for production

### Content Security
- Sanitize HTML in T&C and Privacy Policy
- Prevent XSS attacks
- Validate URLs for logo and favicon
- Escape user input

## 📊 Database Schema

```prisma
model SiteSettings {
  id                  String   @id @default(uuid())
  siteName            String   @default("Butterfliy")
  siteTitle           String   @default("Travel Encyclopedia")
  logoUrl             String?
  faviconUrl          String?
  termsAndConditions  String?  @db.Text
  privacyPolicy       String?  @db.Text
  updatedAt           DateTime @updatedAt
  updatedBy           String?
  
  @@map("site_settings")
}
```

## 🎨 UI/UX Considerations

### Admin Settings Page
- Tab-based interface:
  - General (name, title, logo, favicon)
  - Legal (T&C, Privacy Policy)
- Image preview for logo and favicon
- Rich text editor for legal content
- Save button with confirmation
- Reset to defaults option

### Footer
- Sticky footer at bottom
- Responsive design
- Links styled consistently
- Copyright year auto-updates

### Legal Pages
- Clean, readable layout
- Print-friendly
- Last updated date
- Back to home link

## 🚀 Next Steps

1. **Create Frontend Service** - `siteSettingsService.ts`
2. **Create Admin Settings Page** - Full form with all fields
3. **Create Footer Component** - With T&C and Privacy links
4. **Create Legal Pages** - Terms and Privacy pages
5. **Update WebHeader** - Use dynamic settings
6. **Add File Upload** - For logo and favicon
7. **Test Everything** - Ensure all features work

## 📝 Testing Checklist

### Backend
- [ ] GET /api/site-settings returns default settings
- [ ] PUT /api/site-settings updates settings (as admin)
- [ ] PUT /api/site-settings rejects non-admin users
- [ ] Settings persist across server restarts

### Frontend
- [ ] Admin can access settings page
- [ ] Non-admin cannot access settings page
- [ ] Settings form loads current values
- [ ] Settings form saves successfully
- [ ] Logo updates in header
- [ ] Favicon updates in browser tab
- [ ] Site name updates in header
- [ ] Footer displays on all pages
- [ ] T&C page displays content
- [ ] Privacy page displays content

## 🎉 Benefits

### For Administrators
- ✅ Easy branding customization
- ✅ No code changes needed
- ✅ Update legal content anytime
- ✅ Professional appearance

### For Users
- ✅ Clear legal information
- ✅ Professional branding
- ✅ Trust and transparency
- ✅ Easy access to policies

## 📚 Additional Features (Future)

1. **Multiple Themes** - Light/dark mode settings
2. **Social Media Links** - Configurable social links
3. **Contact Information** - Email, phone, address
4. **SEO Settings** - Meta descriptions, keywords
5. **Analytics** - Google Analytics ID
6. **Email Templates** - Customizable email branding
7. **Maintenance Mode** - Enable/disable site
8. **Custom CSS** - Advanced styling options

This is a comprehensive site customization system that gives administrators full control over branding and legal content!
