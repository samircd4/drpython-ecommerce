# Sarker.shop — Complete Features List

A comprehensive overview of all the features and capabilities of the **Sarker.shop** e-commerce platform.

---

## 1. Customer-Facing Features (Frontend)

### 🛍️ Product Discovery & Shopping
- **Home Page**: Dynamic hero banners, featured categories, best-selling products, and trending sections.
- **Product Grid/List View**: Responsive layout for browsing products with instant "Add to Cart" functionality.
- **Advanced Filtering & Sorting**: Filter products by price range, star ratings, and brands. Sort by newest, price, or rating.
- **Global Search**: Search for products by name or SKU from any page.
- **Category Navigation**: Intuitive multi-level category navigation (e.g., Electronics > Smartphones).
- **Product Details Page**:
  - High-quality image gallery with zoom and preview.
  - Sticky sub-navigation for quick access to Info, Description, and Reviews.
  - SKU and availability tracking (In Stock / Out of Stock).
  - Related products recommendation based on categories/brands.

### 🛒 Checkout & Cart Management
- **Persistent Shopping Cart**: Real-time cart updates, item counters, and subtotal calculations.
- **Multi-step Checkout**: Smooth checkout flow including shipping details and order summary.
- **Geolocation Integration**: Accurate address selection using preloaded **Division, District, and Sub-district** data (tailored for Bangladesh).
- **Guest Checkout**: Support for non-registered users via UUID tracking.

### 👤 Account & Dashboard
- **User Authentication**: Secure JWT-based login (Email/Password), registration, and social login support.
- **Password Management**: Integrated Forgot/Reset Password flow and Email Verification.
- **User Profile**: Update profile details (Name, Email, Phone) and upload personal avatars.
- **Order History**: View all past orders with detailed status logs and summaries.
- **Order Tracking**: Real-time order tracking using Order ID and Phone/Email.
- **Address Book**: Manage multiple shipping/billing addresses.

### 💬 Support & Communication
- **Real-time Live Chat**: WebSocket-powered customer support chat for instant assistance.
- **Contact Center**: Interactive contact form with map integration and store location details.
- **Product Q&A**: Ask questions directly on product pages and see admin answers.
- **Reviews & Ratings**: Rate products and leave text reviews with admin approval.

---

## 2. Administrative Features (Admin Dashboard)

### 📊 Oversight & Analytics
- **Dashboard Overview**: Key metrics (Total Sales, Orders, Customers) with visual charts (Line/Pie/Bar).
- **Recent Activities**: Real-time feed of system events, new orders, and user registrations.
- **Financial Reports**: Detailed sales analytics, best-selling product reports, and payment logs.

### 📦 Product & Inventory Management
- **Full CRUD Support**: Add, Edit, Delete, and Clone products with ease.
- **Media Management**: Upload and manage multiple product images with automated **WebP optimization** (background conversion).
- **Variant Handling**: Manage product attributes (Color, Size, Material, etc.).
- **Inventory Control**: Real-time stock tracking and inventory status management.
- **Brands & Categories**: Complete management of product organization taxonomies.

### 🚚 Order & Customer Management
- **Order Lifecycle Management**: Process orders from Pending to Delivered with detailed status tracking.
- **Order Timeline**: Visual log of every status change and internal note for each order.
- **Customer Database**: Comprehensive list of all registered users with their full shopping history.
- **Staff Roles**: Manage user permissions (Admin, Staff, Customer).

### 💬 Engagement & Support
- **Support Inbox**: Centralized real-time chat interface to handle multiple concurrent customer conversations.
- **Review Moderation**: Approve or reject customer reviews before they go public.
- **Q&A Moderation**: Answer customer questions on product pages directly from the dashboard.
- **Contact Messages**: Manage and reply to messages from the frontpage contact form.

---

## 3. Technical & Infrastructure Features

### ⚙️ Core Backend (API)
- **Django REST Framework**: A robust, scalable API core handling all logic.
- **JWT Authentication**: Secure, stateless session management.
- **Async Communication**: **Django Channels** and WebSockets for real-time chat and notifications.
- **Background Tasks**: **Celery & Redis** for long-running processes like email delivery and image processing.
- **Database**: **PostgreSQL** for reliable data storage with optimized indexing.

### 🎨 Modern Frontend
- **React.js**: High-performance, component-based user interfaces.
- **Framer Motion**: Smooth, premium micro-animations and transitions.
- **Tailwind CSS**: Utility-first styling for a sleek, responsive, and consistent design.
- **AuthContext**: Centralized state management for user sessions and profile sync.

### 🚀 DevOps & Deployment
- **Dockerized Architecture**: Standardized environments for Local, Dev (Staging), and Prod.
- **Nginx Reverse Proxy**: Secure traffic routing with SSL (Let's Encrypt) integration.
- **Standardized Deployment Flow**: Automated `loc > dev > prod` workflow using GitKraken and Docker Compose.
- **Automated Assets**: Automated WebP and WebM conversion for images and videos to ensure blazing-fast load times.
