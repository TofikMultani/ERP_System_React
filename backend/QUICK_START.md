# ERP System Backend Setup Guide

## Quick Start

### 1. Prerequisites
- **Node.js** v14+ and npm
- **PostgreSQL** v12+
- Git

### 2. Installation Steps

#### Step 1: Navigate to Backend
```bash
cd backend
```

#### Step 2: Install Dependencies
Dependencies are already installed! The following packages are included:

**Core Dependencies:**
- `express` - Web framework
- `pg` - PostgreSQL client
- `cors` - Cross-origin resource sharing
- `helmet` - Security headers
- `dotenv` - Environment variables

**Authentication:**
- `jsonwebtoken` - JWT tokens
- `bcryptjs` - Password hashing

**Validation & Security:**
- `validator` - Input validation
- `express-rate-limit` - Rate limiting

**Development:**
- `nodemon` - Auto-reload server

#### Step 3: Configure Database

**Option A: Using PostgreSQL Command Line**

1. Open PostgreSQL CLI:
   ```bash
   psql -U postgres
   ```

2. Create database:
   ```sql
   CREATE DATABASE erp_system;
   ```

3. Connect to database:
   ```sql
   \c erp_system
   ```

4. Create tables (see [DATABASE_SETUP.md](./DATABASE_SETUP.md) for full schema)

**Option B: Using pgAdmin**
- Open pgAdmin
- Create new database: `erp_system`
- Run the SQL from DATABASE_SETUP.md

#### Step 4: Update Environment Variables

Edit `.env` file with your PostgreSQL credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=erp_system
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key_here
ROOT_ADMIN_EMAIL=rootadmin@erp.local
ROOT_ADMIN_PASSWORD=RootAdmin@123
ADMIN_EMAIL=admin@erp.local
ADMIN_PASSWORD=Admin@123
HR_EMAIL=hr@erp.local
HR_PASSWORD=Hr@12345
SALES_EMAIL=sales@erp.local
SALES_PASSWORD=Sales@123
INVENTORY_EMAIL=inventory@erp.local
INVENTORY_PASSWORD=Inventory@123
FINANCE_EMAIL=finance@erp.local
FINANCE_PASSWORD=Finance@123
SUPPORT_EMAIL=support@erp.local
SUPPORT_PASSWORD=Support@123
IT_EMAIL=it@erp.local
IT_PASSWORD=It@123456
```

The backend will create the auth table and seed all module accounts on startup.

Default login credentials by module:

- Root Admin (`root-admin`): `rootadmin@erp.local` / `RootAdmin@123`
- Admin (`admin`): `admin@erp.local` / `Admin@123`
- HR (`hr`): `hr@erp.local` / `Hr@12345`
- Sales (`sales`): `sales@erp.local` / `Sales@123`
- Inventory (`inventory`): `inventory@erp.local` / `Inventory@123`
- Finance (`finance`): `finance@erp.local` / `Finance@123`
- Support (`support`): `support@erp.local` / `Support@123`
- IT (`it`): `it@erp.local` / `It@123456`

#### Step 5: Start the Server

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

Server will start on: `http://localhost:5000`

### 3. Test the Backend

#### Health Check
```bash
curl http://localhost:5000/api/health
```

Expected Response:
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2026-04-01T10:30:00.000Z"
}
```

#### Database Connection Test
```bash
curl http://localhost:5000/api/db-test
```

Expected Response:
```json
{
  "status": "OK",
  "message": "Database connection successful",
  "timestamp": "2026-04-01T10:30:00.123456+00:00"
}
```

### 4. Authentication API

#### Register User
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login User
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "rootadmin@erp.local",
  "password": "RootAdmin@123"
}
```

Response includes JWT token:
```json
{
  "status": "OK",
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "rootadmin@erp.local",
    "firstName": "Root",
    "lastName": "Admin",
    "role": "root-admin"
  }
}
```

#### Get Current User (Protected Route)
```bash
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_JWT_TOKEN
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # PostgreSQL connection pool
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   └── [other modules]
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT verification & role checking
│   │   ├── errorHandler.js      # Error handling
│   │   └── validation.js        # Input validation
│   ├── models/
│   │   └── [database models]
│   ├── routes/
│   │   ├── authRoutes.js        # Authentication endpoints
│   │   └── [other modules]
│   └── server.js                # Main server file
├── .env                         # Environment variables (create from .env.example)
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
├── DATABASE_SETUP.md            # Database schema & setup
├── QUICK_START.md               # This file
├── package.json                 # Dependencies
└── package-lock.json            # Dependency versions
```

## Connecting Frontend to Backend

In your React frontend (`.env` or Vite config):

```env
VITE_API_URL=http://localhost:5000/api
```

Example API call:
```javascript
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const data = await response.json();
localStorage.setItem('token', data.token); // Store JWT
```

## Common Issues

### "Cannot GET /api/..." or 404 Errors
- Ensure server is running: `npm run dev`
- Check DB connection: `curl http://localhost:5000/api/db-test`
- Verify route path is correct

### "connect ECONNREFUSED 127.0.0.1:5432"
- PostgreSQL is not running
- Check DB_HOST, DB_PORT in .env
- Start PostgreSQL service

### "password authentication failed"
- Check DB_USER, DB_PASSWORD in .env
- Verify PostgreSQL user exists and password is correct

### "database erp_system does not exist"
- Create database: `CREATE DATABASE erp_system;` in psql
- Verify DB_NAME in .env

### "listen EADDRINUSE :::5000"
- Port 5000 is already in use
- Change PORT in .env
- Or kill process: `lsof -i :5000` (macOS/Linux)

## Next Steps

1. **Create Database Tables** - See [DATABASE_SETUP.md](./DATABASE_SETUP.md)

2. **Create Additional Routes** - Add routes for:
   - Users Management
   - Employees
   - Products
   - Orders
   - Invoices
   - Inventory

3. **Implement Controllers** - Create business logic for each module

4. **Add Validation** - Enhance input validation for all endpoints

5. **Setup Migrations** - Consider using `db-migrate` for versioning

6. **Add Testing** - Implement unit and integration tests

7. **Deploy** - Deploy to production (Heroku, AWS, etc.)

## Useful Commands

```bash
# Start development server
npm run dev

# Start production server
npm start

# Check PostgreSQL version
psql --version

# Connect to PostgreSQL
psql -U postgres -h localhost

# List databases in psql
\l

# Connect to specific database
\c erp_system

# List tables
\dt

# Show table schema
\d table_name

# Run custom SQL
psql -U postgres -h localhost -d erp_system -f init.sql
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Health & Status
- `GET /api/health` - Server health check
- `GET /api/db-test` - Database connection test

## Support

For issues or questions:
1. Check the [DATABASE_SETUP.md](./DATABASE_SETUP.md) file
2. Verify `.env` configuration
3. Check server logs in terminal
4. Ensure PostgreSQL is running and accessible

## Security Notes

⚠️ **Important for Production:**
- Change `JWT_SECRET` to a strong random string
- Use environment-specific `.env` files
- Enable HTTPS
- Implement rate limiting on all endpoints
- Use helmet defaults (already enabled)
- Implement CORS properly for specific domains
- Add input sanitization
- Use prepared statements (already used with pg)
- Implement logging and monitoring
