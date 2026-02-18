
## 🔗 Project Links

- 🌐 Live Demo: https://hits-aiml-department-website.vercel.app
- 💻 GitHub Repository: https://github.com/Osm134/hits-aiml-department-website.git

# AIML Department Management System

A full-stack web application developed to manage and showcase the activities of the Artificial Intelligence & Machine Learning (AIML) department.  
The system provides structured management of student clubs, internships, student representatives (CRs), and departmental updates through a modern, responsive interface.

---

## Project Overview

The AIML Department Management System is designed to help departments digitally manage student-centric information in an organized and scalable way.  
It allows administrators to create and manage clubs, internships, and student representative data, while students can view information and participate in activities.

This project follows a modular full-stack architecture with a clear separation of frontend and backend responsibilities.

---

## Features

### Student & Club Management
- Create, view, and delete student clubs
- Join clubs and view club members
- Maintain student representative (CR) records

### Internship Management
- Display available internships
- Manage internship details from the backend

### User Interface
- Clean and responsive UI built with React
- Tab-based navigation for better usability
- Modal-based forms for data entry

### Backend & Database
- RESTful API built with Node.js and Express
- PostgreSQL database for structured data storage
- Secure environment variable management using `.env`

---

## Tech Stack

### Frontend
- React.js
- Axios
- HTML5, CSS3, JavaScript

### Backend
- Node.js
- Express.js
- PostgreSQL

### Tools & Platforms
- Git & GitHub (Version Control)
- Railway / Render (Deployment)
- Vercel (Frontend Hosting)

---

## Project Structure

AIML-Department-Management/
│
├── backend/
│ ├── routes/
│ ├── controllers/
│ ├── models/
│ ├── server.js
│ └── .env
│
├── frontend/
│ ├── src/
│ │ ├── pages/
│ │ ├── components/
│ │ └── services/
│ ├── public/
│ └── .env
│
└── README.md


---

## Environment Variables

### Frontend (`.env`)
REACT_APP_API_URL=http://localhost:5000
DISABLE_ESLINT_PLUGIN=true


### Backend (`.env`)
PG_USER=your_postgres_user
PG_PASSWORD=your_postgres_password
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=your_database_name
JWT_SECRET=your_secret_key


---

## Running the Project Locally

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/aiml-department-management.git
cd aiml-department-management
2. Start Backend
cd backend
npm install
npm start
Backend runs on:

http://localhost:5000
3. Start Frontend
cd frontend
npm install
npm start
Frontend runs on:

http://localhost:3000
API Endpoints (Sample)
Method	Endpoint	Description
GET	/clubs	Fetch all clubs
POST	/clubs	Create a new club
DELETE	/clubs/:id	Delete a club
GET	/internships	Fetch internships
GET	/students-rep	Fetch student representatives
Future Enhancements
Role-based authentication (Admin / Student)

Dashboard analytics for department insights

File uploads using cloud storage

Notification system for updates and events

Author
Jangeti Srikanth
B.Tech CSE (AIML)
Holy Mary Institute of Technology & Science

License
This project is developed for educational and departmental use.


