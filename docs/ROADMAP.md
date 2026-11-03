# Roadmap

These are suggestions derived from the codebase state on 2026-11-03. Reorder them as business priorities change. IDs in brackets refer to [KNOWN_ISSUES.md](KNOWN_ISSUES.md).

## Now: hardening (security and correctness)
- [ ] Remove tracked secrets and cookies from git and rotate them [S1]
- [ ] Production-safe settings defaults: `SECRET_KEY`, `DEBUG`, CORS, `ALLOWED_HOSTS` [S2–S4]
- [ ] Protect `initiate-payment` with an ownership check [S6]
- [ ] Fix or replace the CI workflow to match the unified `docker-compose.yml` and per-client deployment [I1]
- [ ] Document `BREVO_API_KEY` [I2]
- [ ] Add tests for payment callbacks (idempotency, validation failure) and order totals

## Next: make the core truly white-label
- [ ] Drive branding (email sender, API title, cookie names, EXIF) from env or `StoreConfiguration` [B1, B3, B4]
- [ ] `DeliveryZone` model or configuration for delivery charges, editable in the admin [B2]
- [ ] Move emails, invoice PDFs and imports to Celery tasks [C4]
- [ ] Re-enable and finish Analytics, Insights, Data Management and Dev Feedback in the admin [C5]

## Later: growth features
- [ ] Courier integrations (Steadfast, Pathao, RedX): create shipments and sync tracking
- [ ] bKash and Nagad direct API payments (beyond manual numbers)
- [ ] SMS notifications (OTP, order status) through a local SMS gateway
- [ ] Wishlist, abandoned-cart reminders, product recommendations
- [ ] Bangla UI option for the storefront template
- [ ] Audit log for staff actions (feeds the Activity page)
- [ ] Automated database backups with retention, plus uptime monitoring and error tracking (e.g. Sentry)
