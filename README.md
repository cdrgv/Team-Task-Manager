````md
# Team Task Manager

Full-stack web application for team task management.

## Tech Stack
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB

## Setup Instructions

1. Backend Setup

```bash
cd backend
npm install
node server.js
````

2. Frontend Setup

```bash
cd frontend
```

Open index.html in browser or run using Live Server.

3. MongoDB Setup

* Install MongoDB locally or use MongoDB Atlas
* Add MongoDB connection string in backend .env file

Example:

```env
MONGO_URI=mongodb+srv://manoj:manoj123@cluster0.68xavhs.mongodb.net/?appName=Cluster0
PORT=5000
```

## Features

* User authentication (Signup/Login)
* JWT Authentication
* Role-based access (Admin/Member)
* Project management
* Team member management
* Task creation and assignment
* Task status tracking
* Dashboard statistics
* Overdue task tracking
* Responsive design

## API Endpoints

### Authentication

* POST /api/auth/signup
* POST /api/auth/login

### Projects

* GET /api/projects
* POST /api/projects
* PUT /api/projects/:id
* DELETE /api/projects/:id

### Tasks

* GET /api/tasks
* POST /api/tasks
* PUT /api/tasks/:id
* DELETE /api/tasks/:id

## Dashboard

* Total Tasks
* Pending Tasks
* In Progress Tasks
* Completed Tasks
* Overdue Tasks

## Overdue Tasks

Tasks automatically move to overdue when:

* Due date is passed
* Task status is not completed

## Deployment

### Frontend Deployment (Netlify)

Build command:

```bash
No build command required
```

Publish directory:

```bash
frontend
```

Functions directory:

```bash
Leave empty
```

### Backend Deployment

Deploy backend using:

* Render


## Author
Vemuri Venkatasai Sukesh
