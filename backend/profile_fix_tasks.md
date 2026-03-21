# Task: Backend Profile Support

- [ ] Add `bio` field to `Customer` model in `accounts/models.py`
- [ ] Add `patch` method to `me` action in `accounts/views.py`
- [ ] Update `CustomerSerializer` to handle `first_name`, `last_name`, and `bio`
- [ ] Run migrations: `python manage.py makemigrations accounts` and `python manage.py migrate`
- [ ] Verify `PATCH /api/customers/me/` works
