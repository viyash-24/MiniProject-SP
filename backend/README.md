# Smart Parking Backend (Node/Express/Mongo)

## start backend 
1.nodemon
## start frontend
1.npm start
## Setup
1. cd server
2. cp .env.example .env and edit if needed
3. npm install
4. npm run dev

API runs at http://localhost:5000

On first start, seeds admin user: admin@gmail.com / admin

## Auth
- POST /api/auth/register { name, email, phone, password }
- POST /api/auth/login { email, password }
- GET /api/auth/me (JWT)
- POST /api/auth/logout (JWT)

Auth uses httpOnly cookie `token`. You may also send `Authorization: Bearer <token>`.

## Admin endpoints (require role: admin)
- GET /api/users
- POST /api/users
- GET /api/vehicles
- POST /api/vehicles
- PATCH /api/vehicles/:id/pay
- PATCH /api/vehicles/:id/exit
- GET /api/slots
- POST /api/slots
- PATCH /api/slots/:id
- GET /api/payments

## Notes
- Models: User, Vehicle, Slot, Payment
- Security: Helmet, CORS, rate-limit, bcrypt, JWT
- Update frontend to call these endpoints for a full migration from Firebase.
