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
### Backend 
```
cd MigrantSupportPlatform-Node
npm install
```

### Database
TODO
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
### Backend
```
just run
```
### Frontend 
```
just run
```

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
