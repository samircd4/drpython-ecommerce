# Backend-Frontend Integration Guide

## Overview

This document outlines the integration points between the Django REST Framework backend and the React frontend for the Sarker Shop 2026 e-commerce application.

## API Endpoints

### Products API

- **GET /api/products/**
  - Returns a list of all products
  - Supports filtering by category, price range, and featured status
  - Used by: Product listing page, Featured products section, Best sellers section

- **GET /api/products/{id}/**
  - Returns details for a specific product
  - Used by: Product detail page

- **GET /api/categories/**
  - Returns a list of all product categories
  - Used by: Category sidebar, Product filters

### User Authentication API

- **POST /api/auth/register/**
  - Registers a new user
  - Used by: Registration page (complementary to Clerk authentication)

- **POST /api/auth/login/**
  - Authenticates a user and returns JWT tokens
  - Used by: Login page (complementary to Clerk authentication)

- **POST /api/auth/refresh/**
  - Refreshes JWT access token
  - Used by: Authentication middleware

### Cart and Orders API

- **GET /api/cart/**
  - Returns the current user's cart
  - Used by: Cart page, Cart sidebar

- **POST /api/cart/items/**
  - Adds an item to the cart
  - Used by: Add to cart button on product pages

- **PUT /api/cart/items/{id}/**
  - Updates quantity of a cart item
  - Used by: Cart quantity controls

- **DELETE /api/cart/items/{id}/**
  - Removes an item from the cart
  - Used by: Remove button in cart

- **POST /api/orders/**
  - Creates a new order from the cart
  - Used by: Checkout process

- **GET /api/orders/**
  - Returns a list of the user's orders
  - Used by: Order history page

- **GET /api/orders/{id}/**
  - Returns details for a specific order
  - Used by: Order detail page

## Authentication Flow

1. Frontend uses Clerk for user authentication UI and session management
2. Upon successful Clerk authentication, frontend requests JWT token from Django backend
3. Backend validates Clerk token and issues JWT token for API access
4. Frontend includes JWT token in Authorization header for all API requests
5. Backend validates JWT token for protected endpoints

## Data Flow

### Product Browsing

1. Frontend requests product data from Django REST Framework API
2. Backend returns product data in JSON format
3. Frontend renders products using React components

### Cart Management

1. Frontend sends cart operations to backend API
2. Backend processes cart changes and returns updated cart data
3. Frontend updates cart UI based on response
4. Cart state is synchronized between local storage and backend database

### Checkout Process

1. Frontend collects shipping and payment information
2. Frontend sends order creation request to backend
3. Backend validates order and processes payment
4. Backend returns order confirmation
5. Frontend displays order confirmation to user

## Error Handling

- Backend returns appropriate HTTP status codes and error messages
- Frontend handles error responses and displays user-friendly messages
- Common error scenarios:
  - 400: Invalid input data
  - 401: Unauthorized access
  - 404: Resource not found
  - 500: Server error

## Development Guidelines

### API Development

- Follow RESTful principles
- Use Django REST Framework serializers for data validation
- Implement proper pagination for list endpoints
- Document all endpoints with OpenAPI/Swagger

### Frontend Integration

- Use Axios for API requests
- Implement request/response interceptors for authentication
- Create dedicated API service modules for each resource
- Handle loading states and errors consistently

## Testing Integration

- Backend: Unit tests for API endpoints using Django REST Framework test tools
- Frontend: Mock API responses for component testing
- End-to-end tests for critical user flows

## Deployment Considerations

- Configure CORS settings in Django for frontend access
- Set up proper environment variables for API URLs
- Implement rate limiting for API endpoints
- Configure proper caching strategies