# Zentra

Zentra is a premium, Gen Z-styled full-stack e-commerce platform. It supports product discovery, filtering and search, promotional sale sections, authenticated shopping carts, simulated checkout, order history, admin product controls, dark mode, and responsive layouts.

## Stack

- React + Vite + vanilla CSS frontend
- Node.js + Express REST API
- MongoDB Atlas with Mongoose, plus local JSON fallback data when MongoDB is unavailable
- JWT authentication and role-based admin controls

## Local setup

1. Install Node.js 20+. A MongoDB Atlas cluster is recommended, but the API can run without it using `data/*.json`.
2. Copy `server/.env.example` to `server/.env`, then add `MONGODB_URI` and a strong `JWT_SECRET` when Atlas is available.
3. Copy `client/.env.example` to `client/.env` (the default local API URL is already correct).
4. Run `npm install`, then `npm run install:all` from the repository root.
5. Run `npm run seed` to insert the sample catalogue and demo accounts.
6. Run `npm run dev`, then open http://localhost:5173.

If MongoDB Atlas is unavailable or `MONGODB_URI` is missing, the Express server still starts normally and uses:

- `data/products.json`
- `data/users.json`
- `data/carts.json`
- `data/orders.json`

Check `GET /api/health`; it returns `database: "mongodb"` or `database: "json-fallback"`.

Demo admin: `admin@zentra.store` / `admin123`  
Demo shopper: `shopper@zentra.store` / `shopper123`

## API routes

| Area | Routes |
| --- | --- |
| Authentication | `POST /api/auth/register`, `POST /api/auth/login` |
| Products | `GET /api/products`, `GET /api/products/categories`, `GET /api/products/:id` |
| Cart | `GET/POST /api/cart`, `PUT/DELETE /api/cart/:productId` |
| Orders | `GET/POST /api/orders` |
| Admin | `POST /api/products`, `PUT/DELETE /api/products/:id` |

Protected calls use `Authorization: Bearer <token>`. Product write routes require an admin account.

## Shopping and checkout experience

- Homepage includes a “MEGA DROP SALE” promotional banner, offer cards, category highlights, discount badges, and old-price/current-price sale styling.
- Product cards show visual deal labels such as `HOT DROP`, `HOT DEAL`, `20% OFF`, and `30% OFF`.
- Checkout is simulated for project demo use only; no real payment gateway is connected.
- Payment page supports UPI, Card, and Cash on Delivery method selection.
- UPI checkout includes a dummy QR payment preview generated from:
  `upi://pay?pa=zentra@upi&pn=ZentraStore&am=<amount>&cu=INR`
- Confirming payment creates the order and redirects to Order History.

## Deployment

### Backend: Render

Push the repository, create a Render Blueprint from `render.yaml`, and set `MONGODB_URI` and `CLIENT_URL` in the service environment. The API uses `PORT` supplied by Render.

### Frontend: GitHub Pages

Set `VITE_API_URL` in the GitHub Actions build environment to `https://YOUR-RENDER-URL/api`. Build the client with `npm run build --prefix client`, then deploy `client/dist`. Update `client/vite.config.js` if the GitHub repository name is different from `Zentra`.
