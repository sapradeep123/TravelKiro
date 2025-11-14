# DocFlow Frontend

A modern, professional React frontend for the DocFlow Document Management System.

## Features

- 🎨 Beautiful, modern UI with Tailwind CSS
- 📱 Responsive design
- 🔐 Authentication (Login/Register)
- 📄 Document Management
  - Upload multiple files (bulk upload)
  - Download documents
  - View document details
  - Delete and restore documents
- 🏷️ Tags Management
- 💬 Comments System
- 📊 Custom Metadata Fields
- 🔍 Search and Filter
- 🗑️ Trash Management
- 📈 Dashboard with statistics

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Configuration

The frontend is configured to proxy API requests to `http://localhost:8000` (the backend API).

To change this, update the `vite.config.js` file:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8000', // Change this to your API URL
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

## Tech Stack

- React 18
- React Router v6
- Vite
- Tailwind CSS
- Axios
- React Hot Toast
- Lucide React Icons
- React Dropzone
- date-fns

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable components
│   ├── contexts/       # React contexts (Auth)
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```
