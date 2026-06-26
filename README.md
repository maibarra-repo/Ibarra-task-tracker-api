# Ibarra Task Tracker API

## Description

Ibarra Task Tracker API is a basic Express and MongoDB backend for user accounts and personal task management. Users can register, log in, receive a JWT, and use that token to access protected task routes.

## Main Features

- Express server with JSON request handling
- Health check route
- MongoDB connection with Mongoose
- User model for account data
- Task model connected to users
- User registration with hashed passwords
- User login with JWT token creation
- JWT authentication middleware
- Protected task routes for creating, reading, updating, and deleting tasks

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens
- bcryptjs
- dotenv
- cors

## Local Setup Instructions

1. Clone or open the project folder.

2. Install dependencies:


npm install


3. Create or confirm the `.env` file has these values:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/myapp
JWT_SECRET=
```

4. Make sure MongoDB is running locally.

In Git Bash, you can test the connection with:

```
mongosh "mongodb://localhost:27017/myapp"
```

If it connects, type:

```bash
exit
```

5. Start the server:

```bash
npm start
```

6. Test the health check route:
 http://localhost:3000/health
