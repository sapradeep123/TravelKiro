# Contributing to DocFlow

Thank you for your interest in contributing to DocFlow! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/sapradeep123/DocMS.git
   cd DocMS
   ```

2. **Set up your development environment**
   - Follow the [SETUP.md](SETUP.md) guide
   - Make sure all tests pass

3. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

## 📝 Development Guidelines

### Code Style

- **Python:** Follow PEP 8 style guide
- **JavaScript/React:** Follow ESLint configuration
- **Commit Messages:** Use clear, descriptive messages

### Project Structure

```
DocMS/
├── app/              # Backend (FastAPI)
├── frontend/         # Frontend (React)
├── scripts/          # Utility scripts
└── tests/            # Test files
```

### Making Changes

1. **Backend Changes:**
   - Add tests for new features
   - Update API documentation
   - Run `pytest` before committing

2. **Frontend Changes:**
   - Follow React best practices
   - Ensure mobile responsiveness
   - Test in multiple browsers

3. **Database Changes:**
   - Create Alembic migrations
   - Test migrations up and down

## 🧪 Testing

### Backend Tests
```bash
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📤 Submitting Changes

1. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add: Description of your changes"
   ```

2. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request**
   - Go to the repository on GitHub
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template

## 📋 Pull Request Checklist

- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] No console errors
- [ ] Mobile responsive (for frontend changes)
- [ ] Migration files included (for database changes)

## 🐛 Reporting Bugs

1. Check if the bug has already been reported
2. Create a new issue with:
   - Clear title
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details

## 💡 Suggesting Features

1. Check if the feature has been suggested
2. Create a new issue with:
   - Feature description
   - Use case
   - Proposed implementation (if any)

## 📚 Documentation

- Update README.md if needed
- Add comments to complex code
- Update API documentation for backend changes

## 🤝 Code Review Process

1. All PRs require at least one approval
2. Address review comments promptly
3. Keep PRs focused and small when possible

## 📞 Questions?

- Open an issue for questions
- Check existing documentation
- Review closed issues/PRs

Thank you for contributing to DocFlow! 🎉

