# DocFlow Frontend - Quick Start Guide

## 🚀 Quick Setup

### 1. Start Backend (if not already running)
```bash
docker compose up -d
```

### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 3. Start Frontend
```bash
npm run dev
```

### 4. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## ✨ Features Available

### Authentication
- ✅ User Registration
- ✅ User Login
- ✅ Secure JWT Authentication

### Document Management
- ✅ Upload multiple files (bulk upload)
- ✅ Download documents
- ✅ View document details
- ✅ Delete documents (moves to trash)
- ✅ Restore from trash
- ✅ Permanent delete

### Document Features
- ✅ **Tags**: Add/remove tags to organize documents
- ✅ **Comments**: Add, edit, delete comments on documents
- ✅ **Custom Metadata**: Add custom key-value pairs
- ✅ **Search**: Search documents by name
- ✅ **Filter**: Filter by tags

### UI/UX Features
- ✅ Modern, responsive design
- ✅ Drag & drop file upload
- ✅ Real-time notifications
- ✅ Loading states
- ✅ Error handling
- ✅ Beautiful dashboard with statistics

## 📝 Usage Examples

### Upload Documents with Tags and Metadata
1. Click "Upload Files"
2. Drag and drop files or select multiple files
3. Add tags: `project, important, 2024`
4. Add custom metadata:
   - Key: `Department`, Value: `Engineering`
   - Key: `Project`, Value: `DocFlow`
5. Click "Upload"

### Add Comments
1. Open a document
2. Scroll to Comments section
3. Type your comment
4. Click the + button

### Add Tags
1. Open a document
2. In Tags section, type tag name
3. Press Enter or click +

### Add Custom Metadata
1. Open a document
2. In Custom Metadata section
3. Enter Key and Value
4. Press Enter or click +

## 🎨 UI Highlights

- **Color Scheme**: Professional blue primary color
- **Icons**: Lucide React icons
- **Typography**: Clean, readable fonts
- **Spacing**: Generous whitespace
- **Cards**: Rounded corners with subtle shadows
- **Buttons**: Clear hover states and transitions

## 🔧 Configuration

### Change API URL
Edit `frontend/vite.config.js`:
```javascript
proxy: {
  '/api': {
    target: 'http://your-api-url:8000',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

## 📦 Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **React Dropzone** - File uploads

## 🐛 Troubleshooting

### Frontend won't start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### API connection errors
- Ensure backend is running: `docker compose ps`
- Check API is accessible: http://localhost:8000/health
- Verify proxy settings in `vite.config.js`

### Build errors
```bash
# Update dependencies
npm update
```

## 📚 Next Steps

1. Customize colors in `tailwind.config.js`
2. Add more features as needed
3. Deploy to production (see SETUP_FRONTEND.md)

Enjoy your Document Management System! 🎉

