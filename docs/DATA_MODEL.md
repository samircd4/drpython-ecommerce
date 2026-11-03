# Data Model

The source of truth is each app's `models.py`. This page is a map of the models, not a full field list.

## 1. Entity relationship overview

```
auth.User 1──1 accounts.Customer 1──* accounts.Address *──1 Division ◀─ District ◀─ SubDistrict
     │                 │
     │                 ├──* orders.Order *──1 OrderStatus
     │                 │        ├──1 PaymentInfo (OneToOne)
     │                 │        ├──* Coupon (FK, nullable)
     │                 │        └──* OrderItem *──1 Product, *──1 ProductVariant (nullable)
     │                 ├──* reviews.Review ──* ReviewImage
     │                 ├──* reviews.Question
     │                 └──* chat.Conversation ──* chat.Message (sender → User | guest_id)
     │
     ├──1 orders.Cart (or session_key for guests) ──* CartItem ──▶ Product / Variant
     │         └──1 Checkout ──▶ shipping/billing Address
     └──* web.Notification

products.Category (self-FK parent) ◀── Product ──▶ Brand
                                        ├──* ProductVariant
                                        ├──* ProductSpecification
                                        ├──* ProductImage (gallery_images)
                                        └──* related_products (M2M self)

web.StoreConfiguration (singleton via .load())   web.ContactMessage   web.NewsletterSubscription
dev_feedback.DevFeedback ──▶ User (created_by, assigned_to)```

## 2. Models by app

### accounts
| Model | Key fields | Notes |
|---|---|---|
| `Division` / `District` / `SubDistrict` | `name`, `bn_name`, `lat`, `long` | Bangladesh hierarchy, loaded from `backend/data/*.json` (`load_locations.py`, `utils/import_geo.py`) |
| `Customer` | `user` (1:1), `name`, `email` (unique), `phone_number`, `customer_type` (`retail` or `wholesale`), `avatar`, `social_avatar_url`, `is_email_verified` | Created during registration and social login (`accounts/views.py` `RegisterView`, `accounts/adapters.py`). Email is synced both ways with allauth `EmailAddress` (`accounts/signals.py`). Staff created via `createsuperuser` may have no Customer, so guard `hasattr(user, 'customer')`. `request.user.customer` is the ownership anchor. |
| `Address` | `customer`, `full_name`, `phone`, `division` (PROTECT), `district`, `sub_district`, `address`, `address_type` (Home, Office…), `is_default` | Chained selects via `smart_selects` |

### products
| Model | Key fields | Notes |
|---|---|---|
| `Category` | `name`, `slug` (unique, auto), `logo`, `parent` (self) | `get_breadcrumbs()` |
| `Brand` | `name`, `slug`, `logo` | |
| `Product` | `name`, `slug`, `product_id`, `sku`, `price`, `wholesale_price`, `discount_price`, `stock_quantity`, `product_type` (`simple` or `variant`), `category`, `brand`, `image`, `short_description`, `description`, `is_active`, `is_featured`, `is_bestseller`, `rating`, `reviews_count`, `questions_count` | `display_*_price` helpers. `sold_count` is annotated in the ViewSet. Only active products are returned to non-staff users. |
| `ProductVariant` | `product`, `ram`, `storage`, `color`, `sku`, prices, `stock_quantity`, `is_active` | |
| `ProductSpecification` | `product`, `key`, `value` | |
| `ProductImage` | `product` (`gallery_images`), `image`, `is_primary`, `alt_text`, `order` | WebP on save |

### orders
| Model | Key fields | Notes |
|---|---|---|
| `OrderStatus` | `status_code`, `display_name`, `description`, `sort_order` | Canonical list in `OrderStatus.CANONICAL`: `pending → confirmed → processing → shipped → delivered`, plus `cancelled` and `returned`. Seeded by `orders/migrations/0012`. Use `OrderStatus.get_by_code(...)`. Mirrored in `admin-dashboard/src/constants/orderStatus.js` and the storefront's `src/utils/orderStatus.js`. |
| `Coupon` | `code` (unique), `discount_type` (`fixed` or `percentage`), `discount_value`, `min_purchase`, `valid_from`, `valid_to`, `active`, `usage_limit`, `times_used` | |
| `PaymentInfo` | `transaction_id`, `is_paid`, `payment_method`, `payment_date`, `paid_from`, `amount` | 1:1 with Order |
| `Cart` / `CartItem` | `user` (1:1) or `session_key`; `product`, `variant`, `quantity` | |
| `Checkout` | `cart` (1:1), `shipping_address`, `billing_address`, `email` | |
| `Order` | `customer` (nullable for guest), contact snapshot (`email`, `full_name`, `phone`, `shipping_address`, `division`, `district`, `sub_district`, `address_type`), `address` FK, `total_amount`, `delivery_charge`, `tax`, `discount`, `order_status`, `payment_info`, `coupon` | Address is **snapshotted as text** so later edits don't change history. Properties: `subtotal`, `grand_total`, `paid_amount`, `due_amount`. `update_total_amount()`. `get_delivery_charge()`. |
| `OrderItem` | `order`, `product` (PROTECT), `variant`, `quantity`, `price` | `price` is snapshotted at order time |

### reviews
`Review` (product, customer, rating 1–5, comment, image) → `ReviewImage`. `Question` (product, customer, question, answer).

### web
`StoreConfiguration` (singleton: branding, currency and symbol, contact, socials, timezone, `is_cod_enabled`, `is_online_payment_enabled`, wallet numbers, `low_stock_threshold`). `ContactMessage`. `NewsletterSubscription` (unique email). `Notification` (user, type `order_update`, `new_order`, `payment`, `stock`, `review`, `message`, `promotion` or `system`, title, message, link (relative path or URL), `data` JSON, is_read). Create them only through `notifications/services.py` (`notify`, `notify_staff`).

### chat
`Conversation` (customer or `guest_id`). `Message` (conversation, sender or `guest_id`, text, image, video, `message_type`, `parent_message` for replies, `reactions` JSON, `timestamp`, `is_read`).

### dev_feedback
`DevFeedback` (title, type, priority, message, page_url, screenshot, status, assigned_to, created_by, ip, user agent, soft delete through `deleted_at`).

## 3. Invariants and rules
- Money: `DecimalField(max_digits=12 or 10, decimal_places=2)`. Use `Decimal` arithmetic.
- After changing order items, delivery, tax or discount, call `order.update_total_amount()`.
- Do not hard-delete products that have orders (`PROTECT`). Set `is_active=False` instead.
- Slugs are auto-generated in `save()`. Do not set them manually unless you are importing.
- Statuses are rows, but the set is fixed by `OrderStatus.CANONICAL`. To add one, update `CANONICAL`, add a data migration (see `orders/migrations/0012_*`), and update both frontend mirrors and the status email template.
- Frontends must key on `status_code`, never on the display name.
