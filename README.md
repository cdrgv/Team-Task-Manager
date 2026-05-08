# Team Task Manager

Full-stack web application for team task management.

## Tech Stack
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB

## Setup Instructions

1. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Update MONGO_URI and JWT_SECRET in .env
npm run dev
```

2. **Frontend Setup**
```bash
cd frontend
# Open index.html in browser or use live server
```

3. **MongoDB**
- Install MongoDB locally or use MongoDB Atlas
- Update MONGO_URI in backend/.env

## Features
- User authentication (signup/login)
- Role-based access (Admin/Member)
- Project & team management
- Task creation, assignment & status tracking
- Dashboard with stats & overdue tasks
- Responsive design

## API Endpoints
- POST /api/auth/signup
- POST /api/auth/login  
- GET /api/projects
- POST /api/projects
- PUT /api/projects/:id
- GET /api/tasks
- POST /api/tasks
- PUT /api/tasks/:id