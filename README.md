# Migrant Support Platform

The Migrant Support Platform is a web application designed to help migrants access essential services, including housing, employment, healthcare, and community resources. The platform aims to provide a centralised, easy-to-use resource that connects users with relevant support services.

## Architecture

The application follows a modern client-server architecture:

- **Frontend:** Next.js (React)
- **Backend:** Node.js with Express
- **Database:** PostgreSQL

The frontend communicates with the backend through a RESTful API, while the backend manages business logic, database access, authentication, and AI-powered services.

## Technology Stack

### Frontend
- Next.js
- React

### Backend
- Node.js
- Express.js

### Database
- PostgreSQL

### Development Tools
- Git & GitHub
- Jira

## Repository Structure

```
frontend/                  # Next.js frontend
MigrantSupportPlatform-Node/ # Node.js backend
```
## Set up

### Prerequisites
Make sure you have the following installed
- Git
- postgresql https://www.postgresql.org
- Nodejs

Set up your local postgres server with the following configuration:
- port: 5432
- user: postgres / (your_postgres_username)
- password: (your_postgres_password)
- database: migrant_support

### Backend 
```
cd MigrantSupportPlatform-Node
npm install
```
Copy and save the .env.example file as .env and set up as below. (replace anything within parenthesis () with your local info)
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=migrant_support
DB_USER=(your_postgres_username)
DB_PASSWORD=(your_postgres_password)
JWT_SECRET=your_jwt_secret
SMTP_HOST=in-v3.mailjet.com
SMTP_PORT=587
SMTP_USER=ea3e63d3ad171f49d21eb7f6c8e643fb
SMTP_PASS=f08be2cdaecd8bef9cd177f47c44ef30
EMAIL_FROM=migranthub.testing@gmail.com
```

### Run the migrations and seed data
```
npm run migrate
npm run seed
```

### Frontend
```
cd frontend
npm install
```

## Running Locally
Open two CLIs one for the backend and one for the frontend
### Backend
```
cd (your_path)/migrant-support-platform/MigrantSupportPlatform-Node
npm run dev
```
### Frontend 
```
cd (your_path)/migrant-support-platform/frontend
npm run dev
```
Once both are running go to localhost:3000
You should be up and running on the landing page of Migrant Hub.

## Testing
### Backend
```
npm test
npm run lint
```
### Frontend
```
npm run lint
npm run build
npm run test:e2e
```

## Team Members

- Kareem Harvey
- Liam Horgan
- Alaina Granger
