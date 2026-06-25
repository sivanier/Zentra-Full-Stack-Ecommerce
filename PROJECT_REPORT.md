# Zentra — Project Report

## Overview

Zentra is a full-stack e-commerce application designed around a bold, mobile-friendly Gen Z shopping experience. The product is deliberately lightweight in its visual system—high contrast, expressive type, colour blocks, promotional sale sections, and a guided browse-to-payment-to-order path.

## Architecture

The React/Vite client consumes an Express REST API. Express connects to MongoDB Atlas through Mongoose and keeps four core collections: `users`, `products`, `carts`, and `orders`. JWTs authenticate protected cart and order operations. A role on the User model controls admin-only product mutations.

## Tech Stack

- **Frontend:** React.js, Vite, CSS  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB Atlas + JSON fallback  
- **Authentication:** JWT, bcrypt  
- **Deployment:** GitHub Pages, Render

## Implemented functionality

- Registration, login, persistent browser session, and logout
- Searchable/category-filtered product catalogue and product details
- Promotional homepage UI with a mega sale banner, offer cards, category highlights, discount badges, and old/new sale pricing
- Server-backed cart: add, remove, adjust quantity, and calculated totals
- Simulated checkout with UPI, Card, and Cash on Delivery method selection
- Dummy UPI QR payment preview using a `upi://pay` URL for project demonstration
- Confirm-order flow creating immutable order item snapshots; order history view
- Admin dashboard for create, update, and delete operations
- Dark mode and responsive breakpoints
- Seed JSON datasets and an idempotent MongoDB seed script

## Data model

`User` stores identity, password hash, and role. `Product` stores listing attributes, stock and merchandising data. `Cart` holds one document per user with product references and quantities. `Order` stores the user plus title/image/price snapshots to preserve the historical purchase record should a product later change.

## Security notes

Passwords are hashed with bcrypt. JWT secrets and MongoDB credentials are supplied only via environment variables. Protected endpoints validate a bearer token, and product write endpoints also validate the `admin` role. A production deployment should restrict `CLIENT_URL` to the Pages domain and rotate demo credentials.

## Checkout and payment simulation

The checkout page is intentionally simulated and does not connect to a real payment gateway. Users can select UPI, Card, or Cash on Delivery. The UPI section displays a UPI ID input and a dummy QR preview generated from `upi://pay?pa=zentra@upi&pn=ZentraStore&am=<amount>&cu=INR`. Confirming the simulated payment posts to the existing orders API, clears the cart, and redirects the user to order history.

## Challenges Faced

During development and deployment, several technical challenges were encountered:

MongoDB Atlas authentication issues during setup
CORS issues between frontend and backend deployment
GitHub Pages routing configuration with React Router
Render cold-start delays on the free tier
API response format compatibility fixes

These challenges were resolved through iterative debugging, environment variable management, API fallback mechanisms, and frontend deployment adjustments.

## Deployment plan

Render hosts the Express API from `server/` using the provided Blueprint. GitHub Pages hosts the built Vite static output. The client accepts `VITE_API_URL`, making its production API origin configurable without code changes.

## Live Demo & Repository

Live Demo:
https://sivanier.github.io/Zentra-Full-Stack-Ecommerce/

GitHub Repository:
https://github.com/sivanier/Zentra-Full-Stack-Ecommerce.git
