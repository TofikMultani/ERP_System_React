# Frontend to Backend Integration Guide

## Quick Integration

### 1. Update React Environment Variables

Create a `.env` file in your React project root (if not exists):

```env
VITE_API_URL=http://localhost:5000/api
```

### 2. Create API Service/Client

Create `src/utils/apiClient.js`:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = {
  // Set authorization header
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    }
  },

  getToken: () => localStorage.getItem('token'),

  clearToken: () => localStorage.removeItem('token'),

  // Make authenticated requests
  async request(endpoint, options = {}) {
    const token = this.getToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API Error');
    }

    return data;
  },

  // Convenience methods
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },
};
```

### 3. Create Auth Service

Create `src/utils/authService.js`:

```javascript
import { apiClient } from './apiClient';

export const authService = {
  async register(email, password, firstName, lastName) {
    const response = await apiClient.post('/auth/register', {
      email,
      password,
      firstName,
      lastName,
    });
    return response;
  },

  async login(email, password) {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });

    if (response.token) {
      apiClient.setToken(response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  },

  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      if (error.message === 'No token provided') {
        return null;
      }
      throw error;
    }
  },

  logout() {
    apiClient.clearToken();
    localStorage.removeItem('user');
  },

  isAuthenticated() {
    return !!apiClient.getToken();
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};
```

### 4. Update Login Component

Update `src/pages/login/Login.jsx`:

```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../utils/authService';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(email, password);
      navigate('/'); // Redirect to dashboard
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Your login form JSX */}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

### 5. Update Protected Route

Update `src/components/ProtectedRoute.jsx`:

```javascript
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../utils/authService';

export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const user = await authService.getCurrentUser();
          setIsAuthenticated(!!user);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}
```

### 6. Test API Connection

Add this to verify connection works:

```javascript
// In your main component or App.jsx
import { useEffect } from 'react';

useEffect(() => {
  // Test API connection
  fetch('http://localhost:5000/api/health')
    .then(res => res.json())
    .then(data => console.log('✅ Backend connected:', data))
    .catch(err => console.error('❌ Cannot reach backend:', err));
}, []);
```

## Example API Calls

### Register User
```javascript
const { register } = require('./utils/authService');

const result = await register(
  'user@example.com',
  'password123',
  'John',
  'Doe'
);
```

### Login User
```javascript
const result = await authService.login(
  'user@example.com',
  'password123'
);

console.log('Token:', result.token);
console.log('User:', result.user);
```

### Get Current User
```javascript
const user = await authService.getCurrentUser();
console.log('Current user:', user);
```

### Custom API Request
```javascript
// GET request
const products = await apiClient.get('/products');

// POST request
const newProduct = await apiClient.post('/products', {
  name: 'Product Name',
  price: 100
});

// PUT request
const updated = await apiClient.put('/products/1', {
  name: 'Updated Name'
});

// DELETE request
await apiClient.delete('/products/1');
```

## Directory Structure After Integration

```
src/
├── components/
│   ├── ProtectedRoute.jsx    ← Updated with auth check
│   └── ...
├── pages/
│   ├── login/
│   │   └── Login.jsx         ← Updated with API call
│   └── ...
├── utils/
│   ├── apiClient.js          ← CREATE THIS
│   ├── authService.js        ← CREATE THIS
│   └── ...
├── App.jsx
├── index.css
└── main.jsx
```

## CORS Configuration

The backend is already configured with CORS. If you get CORS errors:

1. Check `.env` has correct `CORS_ORIGIN`:
```env
CORS_ORIGIN=http://localhost:5173
```

2. Restart backend: `npm run dev`

## Error Handling

Common errors and solutions:

### "Failed to fetch"
- Backend is not running
- Start: `npm run dev` in backend folder
- Check port 5000 is accessible

### "CORS error"
- Check CORS_ORIGIN in `.env`
- Should be your React dev server URL (usually http://localhost:5173)

### "401 Unauthorized"
- Token is missing or expired
- Ensure token is stored in localStorage
- Check Authorization header format: `Bearer TOKEN`

### "422 Invalid email"
- Email format is wrong
- Password is less than 6 characters
- Required fields are missing

## Testing

Use curl or Postman to test backend:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"password123",
    "firstName":"John",
    "lastName":"Doe"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"password123"
  }'

# Get current user (replace TOKEN)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Next Steps

1. Integration working? ✅
2. Create API services for other modules (products, employees, etc.)
3. Update forms to use API client
4. Implement error handling throughout app
5. Add loading states and spinners
6. Setup Redux or Context API for state management
7. Implement proper JWT refresh token flow

Your frontend and backend are now connected! 🎉
