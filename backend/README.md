# ERP System Backend

Node.js/Express backend API for the ERP System with PostgreSQL database integration.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL (v12 or higher)

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your PostgreSQL credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=erp_system
DB_USER=postgres
DB_PASSWORD=your_password
PORT=5000
JWT_SECRET=your_secret_key
```

## Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE erp_system;
```

2. Start the backend once to auto-create the auth table and seed all module accounts.

	Seeded module credentials:
	- Root Admin (`root-admin`): `rootadmin@erp.local` / `RootAdmin@123`
	- Admin (`admin`): `admin@erp.local` / `Admin@123`
	- HR (`hr`): `hr@erp.local` / `Hr@12345`
	- Sales (`sales`): `sales@erp.local` / `Sales@123`
	- Inventory (`inventory`): `inventory@erp.local` / `Inventory@123`
	- Finance (`finance`): `finance@erp.local` / `Finance@123`
	- Support (`support`): `support@erp.local` / `Support@123`
	- IT (`it`): `it@erp.local` / `It@123456`

## Running the Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## Testing Endpoints

- Health Check: `GET http://localhost:5000/api/health`
- DB Connection Test: `GET http://localhost:5000/api/db-test`

## Project Structure

```
backends/
├── src/
│   ├── config/        # Configuration files (database, etc.)
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Custom middleware
│   ├── models/        # Database models/queries
│   ├── routes/        # API routes
│   └── server.js      # Main server file
├── .env.example       # Environment variables template
├── .gitignore         # Git ignore rules
└── package.json       # Dependencies
```

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

## API Modules (To be implemented)

- Authentication & Authorization
- User Management
- Employee Management
- Product Management
- Sales Management
- Inventory Management
- HR Management
- Finance Management
- IT Management
- Support Management

## Security Features

- Helmet.js for HTTP headers security
- CORS enabled with configurable origins
- JWT for authentication
- bcryptjs for password hashing
- Input validation with validator.js
- Rate limiting (configured but not yet applied)

## Next Steps

1. Set up database schema and migrations
2. Create authentication routes
3. Implement module-specific routes and controllers
4. Add input validation middleware
5. Set up error handling
6. Add comprehensive logging
7. Create database seeding scripts
