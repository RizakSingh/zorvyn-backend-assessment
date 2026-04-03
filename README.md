# Finance Dashboard Backend

A clean, production-ready backend system for managing financial records with role-based access control and dashboard analytics.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) |
| Validation | Zod |
| Password hashing | bcryptjs |
| Rate limiting | express-rate-limit |

---

## Architecture

```
src/
├── app.js                  # Entry point — Express setup, middleware chain
├── config/
│   ├── db.js               # MongoDB connection
│   └── constants.js        # Roles, transaction types, role hierarchy
├── models/
│   ├── User.js             # User schema + password hashing hook
│   └── Transaction.js      # Transaction schema + indexes
├── validators/
│   ├── auth.validators.js
│   ├── transaction.validators.js
│   └── user.validators.js
├── middleware/
│   ├── authenticate.js     # JWT verification → attaches req.user
│   ├── authorize.js        # Role-based guard factory
│   ├── validate.js         # Zod validation middleware factory
│   ├── rateLimiter.js      # Global + auth-specific rate limits
│   └── errorHandler.js     # Centralized error handler
├── services/
│   ├── auth.service.js     # Register, login, token generation
│   ├── transaction.service.js  # CRUD + ownership policy checks
│   ├── analytics.service.js    # Aggregation pipelines
│   └── user.service.js     # Admin user management
├── controllers/
│   ├── auth.controller.js
│   ├── transaction.controller.js
│   ├── analytics.controller.js
│   └── user.controller.js
├── routes/
│   ├── index.js            # Central route registry
│   ├── auth.routes.js
│   ├── transaction.routes.js
│   ├── analytics.routes.js
│   └── user.routes.js
└── utils/
    ├── AppError.js         # Custom error class with statusCode
    ├── response.js         # Consistent sendSuccess / sendError helpers
    ├── logger.js           # Leveled console logger
    └── seed.js             # Dev seed script
```

**Data flow:** `Request → Rate Limiter → Router → Validate → Authenticate → Authorize → Controller → Service → DB`

---

## Role Definitions

| Role | Transactions | Analytics | User Management |
|---|---|---|---|
| **viewer** | Read own | ❌ | ❌ |
| **analyst** | Read own | Read own | ❌ |
| **admin** | Full CRUD (all data) | Full (all data) | Full CRUD |

**Policy checks** are enforced in two places:
1. **Middleware** (`authorize.js`) — rejects requests by role before they reach the controller
2. **Service layer** — ownership checks (e.g., "can this user touch this specific transaction?")

---

## API Endpoints

### Auth
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create account |
| POST | `/api/auth/login` | Public | Login → JWT |
| GET | `/api/auth/me` | All roles | Get current user |

### Transactions
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/transactions` | viewer+ | List with filters + pagination |
| GET | `/api/transactions/:id` | viewer+ | Get single transaction |
| POST | `/api/transactions` | admin | Create transaction |
| PATCH | `/api/transactions/:id` | admin | Update transaction |
| DELETE | `/api/transactions/:id` | admin | Soft delete |

**Query params:** `page`, `limit`, `type`, `category`, `startDate`, `endDate`, `search`

### Analytics
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/analytics/summary` | analyst+ | Income / expenses / net balance |
| GET | `/api/analytics/categories` | analyst+ | Totals grouped by category |
| GET | `/api/analytics/trends/monthly` | analyst+ | Last 12 months |
| GET | `/api/analytics/trends/weekly` | analyst+ | Last 8 weeks |
| GET | `/api/analytics/recent` | analyst+ | Recent activity |

### Users (Admin only)
| Method | Path | Description |
|---|---|---|
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get user by ID |
| PATCH | `/api/users/:id` | Update role / isActive / name |
| DELETE | `/api/users/:id` | Delete user |

### Health
| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Liveness check |

---

## Response Format

All responses follow a consistent envelope:

```json
// Success
{ "success": true, "message": "...", "data": { ... } }

// Error
{ "success": false, "message": "..." }
```

HTTP status codes used: `200`, `201`, `400`, `401`, `403`, `404`, `409`, `429`, `500`

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and a strong JWT_SECRET
```

### 3. (Optional) Seed development data
```bash
npm run seed
# Creates 3 users (admin / analyst / viewer) and 50 sample transactions
```

### 4. Start the server
```bash
npm run dev    # development (nodemon)
npm start      # production
```

---

## Authentication

All protected routes require a Bearer token:

```
Authorization: Bearer <token>
```

Tokens are returned on `/api/auth/register` and `/api/auth/login`.

---

## Assumptions & Simplifications

1. **Transaction ownership** — transactions are tied to the `userId` who created them. Admins can manage all records; other roles only see their own.
2. **Analyst analytics scope** — analysts see analytics computed from their own data only, not system-wide. Only admins see aggregated totals across all users.
3. **Viewer + analytics** — viewers cannot access analytics endpoints (analyst role minimum). They can only read their own transaction list.
4. **Write access** — only admins can create/update/delete transactions. This reflects a system where financial records are centrally managed.
5. **Soft delete** — transactions are flagged with `isDeleted: true`; they are excluded from all queries but remain in the database for audit purposes.
6. **No refresh tokens** — JWT tokens expire in 7 days. Refresh token rotation is a recommended production enhancement.
7. **No email verification** — user registration is immediate. In production, add email confirmation flow.
