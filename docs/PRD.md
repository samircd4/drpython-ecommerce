# Product Requirements Document (PRD)

**Product:** Dr Python Ecommerce Platform (drpython-ecommerce)
**Owner:** Dr Python
**Status:** Live with at least two clients (Sarker Shop, Gurudeb Enterprise)
**Last updated:** 2026-11-03

---

## 1. Problem

Small and mid-sized retailers in Bangladesh want their own branded online shop. Marketplaces take a commission and own the customer relationship. Generic SaaS builders handle local needs poorly: Bangladeshi address hierarchies, cash on delivery, SSLCommerz, bKash, Nagad and Rocket, and Bangla-speaking customers who expect live chat.

## 2. Vision

Use one maintained core to launch a fully branded, production-ready shop for a new client in under a day. The client gets:

- a custom storefront designed for their brand
- a shared, feature-rich admin dashboard
- a shared backend that gets improvements across all clients

## 3. Users and personas

| Persona | Description | Main goals |
|---|---|---|
| **Shopper (guest)** | Visits the storefront, often on mobile | Browse, search, add to cart, check out without an account, pay COD or online |
| **Shopper (registered)** | Has an account (email or Google/Facebook) | Saved addresses, order history and tracking, reviews, Q&A, chat |
| **Wholesale customer** | Customer with `customer_type = wholesale` | Sees wholesale prices |
| **Shop owner (superuser)** | Owns the business | Full control: catalog, orders, payments, staff, store settings, analytics |
| **Staff** | Employee with a Django group | Limited to granted permissions: process orders, answer chats, manage stock |
| **Dr Python (operator)** | Deploys and maintains the platform | Onboard clients fast, deploy safely, collect feedback (Dev Feedback) |

## 4. Goals and success metrics

| Goal | Metric |
|---|---|
| Fast client onboarding | New client live in 1 day or less (clone, submodule, `.env`, `docker compose up`) |
| Reliable checkout | 99% or more of checkout attempts create an order. Zero mismatches between payment and order. |
| Operational efficiency | Staff can process an order (view, change status, print invoice) in under 1 minute |
| Customer engagement | Chat response, order status emails and in-app notifications cover every status change |
| Mobile-first | Storefront and admin are usable at 360px width |

## 5. Scope

### 5.1 In scope (current product)

**Storefront (per client, uses the API)**
- Catalog: categories (nested), brands, products with variants (RAM, storage, colour), specifications, gallery
- Search with autocomplete, filters, sort (newest, rating, best selling)
- Featured, bestseller, new arrival and related product feeds
- Cart for guests (session based) and logged-in users
- Checkout with the Division → District → Sub-district address picker
- Coupons (fixed or percentage, minimum purchase, validity window, usage limit)
- Payment: cash on delivery, SSLCommerz online payment, manual mobile wallet numbers (bKash, Nagad, Rocket)
- Order tracking with live status over WebSocket
- Reviews with images, product Q&A
- Live chat with the shop (guest or customer)
- Contact form and newsletter
- Auth: email and password, Google and Facebook, email verification, password reset

**Admin dashboard (shared)**
- Dashboard KPIs and charts, best sellers, popular clients
- Products, brands, categories, inventory, bulk import and export (CSV/XLSX)
- Orders: list, filter, create manual orders, status changes, invoice PDF
- Customers and addresses; users, roles and permissions (Django groups)
- Payments, coupons, reviews, product Q&A, contact messages
- Real-time: new order notifications, chat inbox, live visitor insights with blocking
- Store configuration: name, logos, favicon, currency, socials, payment toggles, timezone
- Dev Feedback: internal bug and suggestion tracker

**Platform**
- One deployment per client (separate database, containers and domain). Several clients can share a VPS.
- Transactional emails through Brevo

### 5.2 Out of scope (for now)
- Multi-tenant single database (each client stays isolated)
- Multi-vendor marketplace
- Multi-currency and multi-language checkout (BDT and English UI only; Bangla names exist in location data)
- Native mobile apps
- Courier API integration (Pathao, Steadfast, RedX) is not built yet. See [ROADMAP.md](ROADMAP.md).
- Non-commerce features. A Live TV module was removed on 2026-11-03.

## 6. Key user journeys

1. **Guest checkout (COD):** browse → add to cart → checkout → enter address (location pickers) → delivery charge computed → apply coupon → place order → order email → track page shows live status.
2. **Online payment:** place order → `POST /orders/<id>/initiate-payment/` → redirect to SSLCommerz → callback (success, fail or cancel) and IPN → server-side validation → `PaymentInfo.is_paid = True` → redirect to the storefront result page.
3. **Order fulfilment (staff):** real-time "New Order" notification → open order → change status (confirmed → shipped → delivered) → customer gets an email and an in-app notification.
4. **Catalog setup (owner):** create categories and brands → add products (or bulk import from CSV/XLSX or a remote shop) → images are converted to WebP automatically.
5. **Customer support:** customer opens chat → staff sees it in `/chats` with presence and typing → replies with text, images, video or reactions.

## 7. Requirements summary

Detailed functional coverage is in [FEATURES.md](FEATURES.md). Technical and non-functional requirements are in [TRD.md](TRD.md).

## 8. Assumptions and constraints
- Primary market: Bangladesh (BDT, Asia/Dhaka, SSLCommerz, Bangladeshi location hierarchy).
- Each client has its own storefront repo. The core repo must not contain client-specific UI.
- Small team: favour simple, conventional Django and React patterns over abstractions.

## 9. Open questions
- Should delivery-charge rules move from code to `StoreConfiguration` or a `DeliveryZone` model? Kishoreganj rules are hardcoded today.
- Should branding strings ("Sarker Shop") in settings, emails and images be driven by `StoreConfiguration` for every client?
- Does each client need its own CI pipeline? The current workflow targets Sarker only.
