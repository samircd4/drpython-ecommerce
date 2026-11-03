# Feature Catalogue

Status key: ✅ live · 🙈 built but hidden in the admin UI (route or sidebar commented out) · 🧪 partial or experimental · 📝 planned

Code pointers are relative to the repo root.

---

## 1. Catalog

| Feature | Status | Backend | Admin UI |
|---|---|---|---|
| Nested categories (parent/child, slug, logo, breadcrumbs, `roots` endpoint) | ✅ | `backend/products/models.py` `Category`, `CategoryViewSet.roots` | `pages/Categories.jsx`, `components/Product/Category*` |
| Brands | ✅ | `Brand`, `BrandViewSet` | `pages/Brands.jsx` |
| Products: simple and variant types, SKU, product_id, retail, wholesale and discount prices, stock, active, featured and bestseller flags | ✅ | `Product` | `pages/Products.jsx`, `pages/AddProduct.jsx` (create, edit and view by route) |
| Variants (RAM, storage, colour, own price and stock) | ✅ | `ProductVariant` | AddProduct |
| Specifications (key/value) | ✅ | `ProductSpecification` | AddProduct |
| Gallery images, primary flag, ordering, alt text, auto WebP | ✅ | `ProductImage`, `utils/images.py` | AddProduct |
| Related products (M2M) | ✅ | `Product.related_products`, `/products/<slug>/related/` | AddProduct |
| Search, autocomplete, filters (category, brand, price, rating), ordering (newest, rating, sold) | ✅ | `ProductFilter`, `suggest`, `search`, `price_range` actions | `components/FilterBar` |
| Featured and bestseller feeds | ✅ | `featured`, `bestsellers` actions | — |
| Inventory view and stock edits | ✅ | Product and Variant update | `pages/Inventory.jsx` |
| Live product status and stock over WebSocket | ✅ | `products/signals.py`, `ws/product/<id>/` | storefront |
| Bulk import and export (CSV/XLSX) | 🙈 | `api/import_views.py`, `api/export_views.py`, `services/` | `pages/DataManagement.jsx` (route commented out) |
| Remote shop product import (CLI) | ✅ | `tools/import_remote_products.py`, `tools/product_Import.py` | — |

## 2. Cart, checkout and orders

| Feature | Status | Backend | Admin UI |
|---|---|---|---|
| Cart for guests (session) and users, add, update and clear | ✅ | `CartViewSet`, `CartItemViewSet` | — |
| Checkout record (shipping and billing address, guest email) | ✅ | `CheckoutViewSet` | — |
| Order placement (guest or customer) | ✅ | `OrderViewSet.create`, `OrderSerializer` | — |
| Delivery charge by location | 🧪 hardcoded (Kishoreganj Sadar 0, Kishoreganj 60, others 120) | `Order.get_delivery_charge` | — |
| Coupons: fixed or %, min purchase, validity window, usage limit, validate endpoint | ✅ | `Coupon`, `/orders/validate-coupon/` | `pages/Coupons.jsx`, `CouponModal` |
| Order statuses (DB-driven `OrderStatus`: pending, confirmed, …) | ✅ | `OrderStatus`, `PATCH /orders/<id>/status/` | `pages/Orders.jsx`, `GlobalOrderModal`, `OrderPanel` |
| Manual order creation by staff | ✅ | `POST /orders/` | `pages/AddOrder.jsx`, `SearchableSelect` |
| Invoice PDF | ✅ | `/orders/<id>/invoice/`, `utils/pdf.py`, `templates/invoice.html` | Orders |
| Live order tracking | ✅ | `ws/order/<id>/` | storefront |
| Order emails (placed, status update, feedback request) | ✅ | `utils/emails.py`, `templates/emails/` | — |

## 3. Payments

| Feature | Status | Backend | Admin UI |
|---|---|---|---|
| Cash on delivery toggle | ✅ | `StoreConfiguration.is_cod_enabled` | WebConfiguration |
| SSLCommerz online payment (sandbox and live, success, fail, cancel, IPN, server validation) | ✅ | `orders/sslcommerz.py`, `orders/views.py` callbacks | — |
| Manual wallet numbers (bKash, Nagad, Rocket) shown to shoppers | ✅ | `StoreConfiguration.*_number` | WebConfiguration |
| Payment records (paid flag, method, amount, payer, date), paid and due computations | ✅ | `PaymentInfo`, `Order.paid_amount`, `due_amount` | `pages/Payments.jsx`, `pages/PaymentAdd.jsx` |

## 4. Customers and accounts

| Feature | Status | Backend | Admin UI |
|---|---|---|---|
| Email and password registration, login (JWT), refresh, logout | ✅ | `accounts/views.py` | `pages/Auth/*` |
| Google and Facebook login | ✅ | `GoogleLogin`, `FacebookLogin`, `accounts/adapters.py` | Login (Google) |
| Email verification, resend, forgot and reset password | ✅ | `VerifyEmailView` and related | `ForgotPassword.jsx` |
| Customer profile (`/customers/me/`), retail and wholesale type, avatar | ✅ | `Customer` | `pages/Customers.jsx`, `CustomerView`, `CustomerEdit`, `CustomerAdd` |
| Address book with BD hierarchy (Division → District → Sub-district), default address | ✅ | `Address`, location ViewSets, `smart_selects` | `pages/CustomerAddresses.jsx`, `AddressModal` |
| Staff users, groups (roles) and permission assignment | ✅ | `UserViewSet`, `GroupViewSet`, `PermissionViewSet` | `pages/Users.jsx`, `Roles.jsx`, `UserAdd`, `UserEdit`, `UserView` |
| User activity page | 🧪 | — | `pages/Activity.jsx` |

## 5. Engagement

| Feature | Status | Backend | Admin UI |
|---|---|---|---|
| Product reviews with rating and images | ✅ | `reviews` app | `pages/Reviews.jsx` |
| Product Q&A | ✅ | `Question` | `pages/ProductQnA.jsx` |
| Live chat (guest or customer and staff), text, image, video, replies, reactions, presence, typing, read receipts | ✅ | `chat` app, `ws/chat/` | `pages/Messages.jsx` (`/chats`), `ChatContext`, `useChatSocket` |
| Contact form | ✅ | `ContactMessage` | `pages/ContactMessages.jsx` |
| Newsletter subscription | ✅ | `NewsletterSubscription` | — |
| In-app notifications (DB and real-time), mark read, read all, clear | ✅ | `web.Notification`, `ws/notifications/<user_id>/` | `NotificationPanel`, `pages/Notifications.jsx` |

## 6. Analytics and operations

| Feature | Status | Backend | Admin UI |
|---|---|---|---|
| Dashboard KPIs with period-over-period change, orders overview, best sellers, popular clients | ✅ | `api/analytics.py` `DashboardStatsView` | `pages/Dashboard.jsx`, `components/Dashboard/*`, `StatsContext` |
| Detailed analytics | 🙈 | `AnalyticsDetailView` | `Analytics.jsx`, `Overview.jsx`, `Reports.jsx` (Reports route is live) |
| Live visitor insights and block user | 🙈 | `tracking` app | `pages/Insights.jsx`, `useVisitorTrackingData` |
| Store configuration (name, logos, favicon, currency, socials, timezone, payment toggles) | ✅ | `web.StoreConfiguration`, `/configuration/` | `pages/WebConfiguration.jsx`, `useStoreConfig` |
| Admin personal settings | ✅ | `/auth/change-password/`, `/customers/me/` | `pages/Settings.jsx` |
| Dev Feedback (bug and suggestion tracker with screenshot, priority, status, assignee) | 🙈 | `dev_feedback` app | `pages/DevFeedback.jsx` |
| Seed data and production sync commands | ✅ | `api/management/commands/seed_data.py`, `sync_prod.py` | — |

## 7. Planned
See [ROADMAP.md](ROADMAP.md).
