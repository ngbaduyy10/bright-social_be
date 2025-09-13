# Bright Social - Backend

A backend social media platform built with Nest.js

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with protected routes
- **User Management**: Complete CRUD operations for user profiles
- **Database Integration**: PostgreSQL with TypeORM
- **Caching**: Redis-based caching for improved performance
- **API Documentation**: Swagger/OpenAPI documentation
- **Validation**: Request validation with class-validator
- **Security**: Password hashing with bcrypt, CORS enabled

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version 16 or higher)
- [npm](https://www.npmjs.com/)
- [PostgreSQL](https://www.postgresql.org/) (version 12 or higher)
- [Redis](https://redis.io/) (version 6 or higher)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ngbaduyy10/bright-social_fe.git
   cd bright-social_be
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Create PostgreSQL database**

4. **Set up environment variables**
   
   Copy the example environment file and configure your variables:
   
   ```bash
   cp .env.example .env
   ```
   
   Then edit the `.env` file with the following variables:
   
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=your_db_username
   DB_PASSWORD=your_db_password
   DB_NAME=your_database_name
   DB_SYNC=true

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key
   ```

5. **Run the application**
   
   For development:
   ```bash
   npm run dev
   ```

## 📚 API Documentation

Once the application is running, you can access the Swagger API documentation at:
```
http://localhost:3000/api-docs
```

## 🧪 Testing

Run the test suite:

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## 🏗️ Project Structure

### `/src` Directory Overview

```
src/
├── config/           # Configuration files
├── decorators/       # Custom decorators
├── entities/         # Database entities
├── guards/           # Authentication guards
├── interceptors/     # Response interceptors
├── modules/          # Feature modules
├── repositories/     # Data access layer (empty)
├── utils/            # Utility functions
├── app.controller.ts # Root application controller
├── app.module.ts     # Root application module
├── app.service.ts    # Root application service
└── main.ts          # Application entry point
```

### 🔧 Key Technologies

- **Framework**: NestJS (Node.js framework)
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport
- **Caching**: Redis with cache-manager
- **Validation**: class-validator and class-transformer
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Language**: TypeScript

### 🌐 API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

#### Users
- `GET /api/user` - Get all users (protected)
- `GET /api/user/:id` - Get user by ID (protected)
- `POST /api/user` - Create user (protected)

*Note: API endpoints may vary based on your specific implementation*

### 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS enabled for cross-origin requests
- Request validation and sanitization
- Protected routes by default (use `@Public()` decorator to make public)
