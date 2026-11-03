# Coding Standards and Recipes

## 1. General
- Match the surrounding code. Consistency beats personal preference.
- Keep changes small and focused. One concern per commit.
- Commit messages: Conventional Commits style (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`), as in the existing history.
- Branches: `master` is the main branch. The CI workflow deploys on pushes to `dev` and `prod`.
- No secrets, `.env` files, cookies or dumps in commits.

## 2. Python and Django

### Style
- PEP 8, 4-space indent, `snake_case` functions, `PascalCase` classes.
- Import Django settings with `from django.conf import settings`. Never import `ecommerce_api.settings`.
- Read configuration with `os.getenv(...)` in `settings.py` only. Elsewhere, use `settings.X`.
- Use `logging.getLogger(__name__)` for diagnostics. Don't add `print()` (some exists in consumers; don't copy it).
- Money: `Decimal`, never `float`.
- Use `get_object_or_404` in views and `select_related` and `prefetch_related` in querysets.

### API layer
- Use ViewSets (`ModelViewSet` or mixins + `GenericViewSet`) registered on a `DefaultRouter`.
- Scope data in `get_queryset()`: staff see everything, customers see their own (`customer=request.user.customer`), anonymous users see none or public data. Add `if getattr(self, 'swagger_fake_view', False): return Model.objects.none()` when `get_queryset` touches `request.user`.
- Choose permissions per action in `get_permissions()`. Reuse `api.permissions.StaffHasActionPermission`.
- Validation belongs in serializers (`validate_<field>`, `validate`). Keep views thin.
- Document custom actions with `@extend_schema(summary=..., responses=...)`.
- Return DRF `Response` with explicit status codes for custom actions.

### Models
- Add `created_at = DateTimeField(auto_now_add=True)` and `updated_at = DateTimeField(auto_now=True)` on new business models.
- Add `__str__` and `Meta.ordering`.
- Use `on_delete=PROTECT` for anything referenced by historical orders.
- Business calculations live on the model (properties or methods), as in `Order.grand_total`.

### Side effects
- Signals live in `<app>/signals.py` and are imported in `apps.py` `ready()`. Use `dispatch_uid`.
- Wrap channel-layer sends in `try/except` so a Redis outage never breaks a save.
- Long or slow work (emails, PDFs, remote downloads) should go to a Celery task in `<app>/tasks.py` with `@shared_task`.

### Tests
- Put tests in `<app>/tests.py` (or a `tests/` package) using `rest_framework.test.APITestCase`.
- Cover permissions (anonymous, customer, staff without permission, staff with permission, superuser) and money calculations.
- Run: `docker compose exec backend_api uv run python manage.py test <app>`.

## 3. React (admin dashboard)

### Style
- Function components and hooks only. One page component per file in `pages/`. Reusable pieces go in `components/<Domain>/`.
- `PascalCase.jsx` for components, `useCamelCase.js` for hooks.
- State: local `useState` first. Use Context (`Context/`) only for cross-cutting state (auth, modals, chat, notifications, stats). No Redux.
- HTTP: `import api from '../api/axiosConfig'`. Use relative paths with trailing slash: `api.get('/brands/', { params })`.
- Env access goes through `config/appConfig.js`, not `import.meta.env` scattered across files.
- Styling: Tailwind utilities following [DESIGN_GUIDE.md](DESIGN_GUIDE.md). No new CSS files. Global additions go in `index.css`.
- Lint: `npm run lint` must pass (ESLint 9 flat config, react-hooks rules).

### Data-fetching pattern (copy from `pages/Brands.jsx`)
```jsx
const [items, setItems] = useState([]);
const [loading, setLoading] = useState(true);
const [page, setPage] = useState(1);
const [totalCount, setTotalCount] = useState(0);

const fetchItems = async () => {
  setLoading(true);
  try {
    const { data } = await api.get('/things/', { params: { page, search } });
    setItems(data.results || []);
    setTotalCount(data.count || 0);
  } catch (e) {
    console.error(e);
    toast.error('Failed to load things');
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchItems();
  const onRefresh = () => fetchItems();
  window.addEventListener('refreshData', onRefresh);
  return () => window.removeEventListener('refreshData', onRefresh);
}, [page, search]);
```

## 4. Recipes

### A. Add a new backend resource end to end
1. `docker compose exec backend_api uv run python manage.py startapp <app>`. Add it to `INSTALLED_APPS`.
2. Write the model, then `makemigrations <app>` and `migrate`.
3. Register it in `admin.py`.
4. Write the serializer, the ViewSet (queryset scoping and permissions) and `urls.py` with `DefaultRouter`.
5. Mount it in `backend/api/urls.py`: `path('', include('<app>.urls'))`.
6. Write tests. Check it in `/docs/`.
7. Update [API_REFERENCE.md](API_REFERENCE.md), [DATA_MODEL.md](DATA_MODEL.md) and [FEATURES.md](FEATURES.md).

### B. Add an admin page
1. Create `src/pages/<Name>.jsx` using the page layout from the design guide.
2. Add the route in `App.jsx` inside `<ProtectedRoute requiredPermission="<app>.view_<model>">`.
3. Add the sidebar entry in `components/Layout/Sidebar.jsx` (the `menuItems` config: `id` = route path, `label`, lucide `icon`, `permission`).
4. Gate write buttons with `hasPermission(...)`.

### C. Add a real-time event
1. Producer: `async_to_sync(get_channel_layer().group_send)('<group>', {'type': 'my_event', ...})` in a signal or view.
2. Consumer: add an `async def my_event(self, event)` handler that calls `self.send(text_data=json.dumps(...))`.
3. New socket path: add `routing.py` and register it in `ecommerce_api/asgi.py`.
4. Admin: write a hook in `src/hooks/` that builds the URL from `appConfig.wsUrl` and appends `?token=`.

### D. Add an order status
1. Add it to `OrderStatus.CANONICAL` in `backend/orders/models.py`.
2. Add a data migration that upserts it (copy `orders/migrations/0012_orderstatus_canonical.py`).
3. Add a message branch in `templates/emails/order_status_update_email.html`.
4. Mirror it in `admin-dashboard/src/constants/orderStatus.js` and each storefront's `src/utils/orderStatus.js` (and `TRACKING_FLOW` if it is a delivery step).
5. Update `OrderStatusTest` in `orders/tests.py`.

### E. Add an environment variable
Add it to `.env.example` (with a comment and local and server values) and read it in `settings.py` with a safe default. If the frontend needs it, add it to `docker-compose.yml` (environment and build args) and to `config/appConfig.js`.
