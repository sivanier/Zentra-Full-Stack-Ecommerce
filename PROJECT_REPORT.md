# Zentra — Project Report

## Overview

Zentra is a full-stack e-commerce application designed around a bold, mobile-friendly Gen Z shopping experience. The product is deliberately lightweight in its visual system—high contrast, expressive type, colour blocks, and a frictionless browse-to-order path.

## Architecture

The React/Vite client consumes an Express REST API. Express connects to MongoDB Atlas through Mongoose and keeps four core collections: `users`, `products`, `carts`, and `orders`. JWTs authenticate protected cart and order operations. A role on the User model controls admin-only product mutations.

## Implemented functionality

- Registration, login, persistent browser session, and logout
- Searchable/category-filtered product catalogue and product details
- Server-backed cart: add, remove, adjust quantity, and calculated totals
- Checkout creating immutable order item snapshots; order history view
- Admin dashboard for create, update, and delete operations
- Dark mode and responsive breakpoints
- Seed JSON datasets and an idempotent MongoDB seed script

## Data model

`User` stores identity, password hash, and role. `Product` stores listing attributes, stock and merchandising data. `Cart` holds one document per user with product references and quantities. `Order` stores the user plus title/image/price snapshots to preserve the historical purchase record should a product later change.

## Security notes

Passwords are hashed with bcrypt. JWT secrets and MongoDB credentials are supplied only via environment variables. Protected endpoints validate a bearer token, and product write endpoints also validate the `admin` role. A production deployment should restrict `CLIENT_URL` to the Pages domain and rotate demo credentials.

## Deployment plan

Render hosts the Express API from `server/` using the provided Blueprint. GitHub Pages hosts the built Vite static output. The client accepts `VITE_API_URL`, making its production API origin configurable without code changes.
