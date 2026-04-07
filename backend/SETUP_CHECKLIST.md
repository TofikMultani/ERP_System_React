# ✅ ERP Backend Setup Checklist

Complete these steps to get your backend running with PostgreSQL.

## Phase 1: Install Prerequisites

- [ ] **Node.js installed** - Check: `node --version` (should be v14+)
- [ ] **npm installed** - Check: `npm --version` (should be v6+)
- [ ] **PostgreSQL installed & running**
  - Windows: Download from https://www.postgresql.org/download/windows/
  - macOS: `brew install postgresql` then `brew services start postgresql`
  - Linux: `sudo apt-get install postgresql` then `sudo systemctl start postgresql`
  - Check: `psql --version`

## Phase 2: Backend Setup (Already Completed ✅)

- [x] Backend folder created
- [x] Node.js project initialized
- [x] Dependencies installed (130 packages)
- [x] Express server configured
- [x] PostgreSQL connection setup
- [x] Authentication system created
- [x] Middleware configured
- [x] Routes defined
- [x] Environment files created
- [x] Documentation written

## Phase 3: Database Configuration

- [ ] **Create PostgreSQL database:**
  ```bash
  psql -U postgres
  CREATE DATABASE erp_system;
  ```

- [ ] **Update `.env` file** with PostgreSQL credentials:
  ```env
  DB_HOST=localhost
  DB_PORT=5432
  DB_NAME=erp_system
  DB_USER=postgres
  DB_PASSWORD=your_actual_password    ← UPDATE THIS
  JWT_SECRET=change_me_production     ← UPDATE THIS
  ```

- [ ] **Create database tables:**
  - Read: `DATABASE_SETUP.md`
  - Copy SQL from the file
  - Paste into PostgreSQL CLI
  - Or: `psql -U postgres -d erp_system -f init_db.sql`

## Phase 4: Start Backend Server

- [ ] **Navigate to backend folder:**
  ```bash
  cd "e:\ERP System main\ERP_System_React\backend"
  ```

- [ ] **Start development server:**
  ```bash
  npm run dev
  ```

- [ ] **Verify server started:**
  - You should see: `🚀 ERP System Backend Server running on http://localhost:5000`
  - Check for database connection message

## Phase 5: Test Backend

- [ ] **Test health endpoint:**
  ```bash
  curl http://localhost:5000/api/health
  ```
  Expected: `{"status":"OK","message":"Server is running",...}`

- [ ] **Test database connection:**
  ```bash
  curl http://localhost:5000/api/db-test
  ```
  Expected: `{"status":"OK","message":"Database connection successful",...}`

- [ ] **Test register endpoint:**
  ```bash
  curl -X POST http://localhost:5000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{
      "email":"test@example.com",
      "password":"password123",
      "firstName":"John",
      "lastName":"Doe"
    }'
  ```

- [ ] **Test login endpoint:**
  ```bash
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email":"test@example.com",
      "password":"password123"
    }'
  ```
  Expected: Response with `token` field

## Phase 6: Connect Frontend

- [ ] **Read FRONTEND_INTEGRATION.md**

- [ ] **Create API client** in React:
  - Location: `src/utils/apiClient.js`
  - Copy code from FRONTEND_INTEGRATION.md

- [ ] **Create auth service** in React:
  - Location: `src/utils/authService.js`
  - Copy code from FRONTEND_INTEGRATION.md

- [ ] **Update login component:**
  - Use `authService.login()` instead of hardcoded test data
  - Store JWT token from response
  - Redirect to dashboard on success

- [ ] **Update ProtectedRoute component:**
  - Check JWT token before rendering protected pages
  - Redirect to login if not authenticated

- [ ] **Update Profile component:**
  - Fetch user data from `GET /api/auth/me`
  - Display actual user information

- [ ] **Test React to Backend connection:**
  - Open browser DevTools (F12)
  - Try logging in with test account
  - Check Network tab to see API calls
  - Check Console for errors

## Phase 7: Verify Full Integration

- [ ] **Backend running** - `npm run dev` in backend folder ✅
- [ ] **PostgreSQL running** - Check with `psql -U postgres` ✅
- [ ] **Database exists** - `erp_system` ✅
- [ ] **Database tables created** - From DATABASE_SETUP.md ✅
- [ ] **React can call backend** - Test login flow ✅
- [ ] **JWT tokens working** - Login returns token ✅
- [ ] **Protected routes working** - Can only access when logged in ✅

## Phase 8: Next Features (Optional)

- [ ] Create additional API routes for:
  - [ ] Employees
  - [ ] Products
  - [ ] Orders
  - [ ] Invoices
  - [ ] Inventory
  - [ ] Support Tickets

- [ ] Add CRUD operations for each module

- [ ] Implement input validation rules

- [ ] Add error handling & user feedback

- [ ] Setup Redux/Context API for state management

- [ ] Add loading spinners & animations

## Troubleshooting Checklist

If something isn't working, check these:

### Backend Won't Start
- [ ] Is Node.js installed? `node --version`
- [ ] Are dependencies installed? Do you see `node_modules/` folder?
- [ ] Is the port free? Try changing PORT in `.env`
- [ ] Check console for error messages

### Can't Connect to Database
- [ ] Is PostgreSQL running?
  - Windows: Check Services panel
  - macOS: `brew services list`
  - Linux: `sudo systemctl status postgresql`
- [ ] Does database `erp_system` exist? `psql -l`
- [ ] Are credentials correct in `.env`?
- [ ] Is `DB_HOST=localhost`? Not 127.0.0.1 or other values?

### CORS Errors in React
- [ ] Is backend running? Check `http://localhost:5000/api/health`
- [ ] Is React dev server on `localhost:5173`?
- [ ] Check `CORS_ORIGIN` in `.env` matches React URL
- [ ] Did you restart backend after changing `.env`?

### Login Not Working
- [ ] Did you create a test user? Run register first
- [ ] Is password exactly what you entered?
- [ ] Check browser console for error messages
- [ ] Check backend console for database errors

### Still Having Issues?
1. Check the documentation files:
   - `00_START_HERE.md` - Overview
   - `QUICK_START.md` - Detailed guide
   - `DATABASE_SETUP.md` - Database schema
   - `FRONTEND_INTEGRATION.md` - React integration

2. Use curl to test endpoints directly:
   ```bash
   curl http://localhost:5000/api/health
   curl http://localhost:5000/api/db-test
   ```

3. Check logs:
   - Backend console for errors
   - Browser DevTools → Network tab for API issues
   - PostgreSQL logs for database issues

## Quick Commands Reference

```bash
# Backend commands
cd backend
npm run dev              # Start development server
npm start                # Start production server
npm install              # Install dependencies again

# PostgreSQL commands
psql -U postgres         # Connect to PostgreSQL
\l                       # List all databases
\c erp_system            # Connect to database
\dt                      # List all tables
\q                       # Quit psql

# Testing endpoints
curl http://localhost:5000/api/health
curl http://localhost:5000/api/db-test

# Check ports
# Windows: netstat -an | find ":5000"
# macOS/Linux: lsof -i :5000
```

## Success Indicators

✅ You're done when you see:

- [ ] Backend server running on `http://localhost:5000`
- [ ] Database: `erp_system` created in PostgreSQL
- [ ] Health endpoints returning `{"status":"OK"}`
- [ ] Login/Register endpoints working
- [ ] React app can call backend APIs
- [ ] No errors in browser console
- [ ] No errors in terminal

## Final Steps

1. **Create the database tables** from `DATABASE_SETUP.md`
2. **Connect React frontend** following `FRONTEND_INTEGRATION.md`
3. **Test the full flow**: Register → Login → View Profile

---

## File Locations

```
ERP_System_React/
├── backend/               ← You are here
│   ├── src/
│   ├── .env               ← UPDATE with DB credentials
│   ├── 00_START_HERE.md   ← Read this first
│   ├── QUICK_START.md     ← Detailed setup guide
│   ├── DATABASE_SETUP.md  ← SQL schema
│   └── FRONTEND_INTEGRATION.md ← Connect React
└── ERP_System_React/      ← Your React app
    ├── src/
    └── ...
```

**Good luck! 🚀**
