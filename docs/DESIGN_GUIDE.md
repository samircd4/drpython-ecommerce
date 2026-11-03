# Design Guide: Admin Dashboard

This guide covers the shared **admin dashboard** (`admin-dashboard/`). Each client storefront has its own brand design inside its submodule. Follow that repo's conventions there.

The admin uses a **dark-only, "premium navy" theme** built with Tailwind CSS v4 utility classes (no component library). Consistency comes from reusing the same few classes. Copy patterns from existing pages before you invent new ones.

---

## 1. Colour tokens

Defined in `src/index.css` `:root` and used inline as Tailwind arbitrary values.

| Token or class | Value | Use |
|---|---|---|
| `--bg-start` / `--bg-mid` / `--bg-end` | `#05122a` / `#07142f` / `#08172f` | Page background gradient: `style={{ backgroundImage: 'linear-gradient(90deg,var(--bg-start),var(--bg-mid),var(--bg-end))' }}` |
| `bg-[#071229]` | app shell, modals | Base surface |
| `bg-[#0b1a2a]` (`--muted`) | cards, inputs, toasts | Raised surface |
| `bg-[#0b3a61]` (`--accent-strong-start`) | table headers | Strong accent surface |
| `--ring` `#184a6a` | focus rings, scrollbar thumb | |
| `border-slate-800` / `border-slate-700` (often `/50`, `/60`) | dividers, card borders | |
| `text-white` / `text-slate-100`, `text-slate-200` | headings, primary text | |
| `text-slate-300`, `text-slate-400` | body and secondary | |
| `text-slate-500` | labels, meta, placeholders | |
| `bg-blue-600 hover:bg-blue-500`, `text-blue-400` | **primary** actions, links, active nav | |
| `emerald-400` / `500` | success, paid, delivered, positive trend | |
| `red-400` / `500`, `bg-red-500/10` | danger, delete, failed, negative trend | |
| `amber` or `yellow` | pending, warning | |
| `purple-400` | secondary highlights (roles, special badges) | |

Status pill pattern: `bg-<color>-500/10 text-<color>-400 border border-<color>-500/20 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider`.

## 2. Typography
- System font stack (Tailwind default).
- Page title: rendered by `<Breadcrumb title paths>`.
- Section titles: `text-lg` or `text-xl font-bold text-white`.
- Body: `text-sm text-slate-300`. Meta: `text-xs text-slate-500`.
- Micro labels and badges: `text-[10px] font-bold uppercase tracking-widest`.
- Buttons in modals: `text-xs font-black uppercase tracking-widest`.

## 3. Shape, elevation and motion
- Radius: inputs and buttons `rounded-xl`; cards and modals `rounded-2xl`; hero cards up to `rounded-[2.5rem]`; avatars and pills `rounded-full`.
- Shadows: `shadow-lg` / `shadow-xl` / `shadow-2xl`. Coloured glow on primary buttons: `shadow-lg shadow-blue-600/20`.
- Modals: backdrop `bg-black/60 backdrop-blur-sm animate-modal-backdrop`, panel `animate-modal-content` (spring scale-in, defined in `index.css`).
- Transitions: `transition-all` on hover states. framer-motion is available for richer motion. Keep it subtle.
- Scrollbars: styled globally. Use `.no-scrollbar` for horizontal chip rows.

## 4. Layout
- Shell: `Header` (top) + `Sidebar` (left, `--sidebar-width` 18rem expanded or 5rem collapsed, off-canvas under 640px) + scrollable content.
- Page wrapper: `<div className="p-0 sm:px-6 sm:py-4 min-h-screen" style={gradient}>`.
- Header row: `flex flex-col sm:flex-row sm:items-center justify-between gap-4` with Breadcrumb on the left and the primary action on the right.
- Then `FilterBar` (`my-6`), then the table or grid, then a footer row ("Showing X of Y" + `Pagination`).
- Mobile: tables use `overflow-x-auto`. `MobileFAB` gives quick actions. Test at 360px.

## 5. Components (reuse these)

| Need | Use |
|---|---|
| Page title and trail | `components/Layout/Breadcrumb.jsx` |
| Search and filters | `components/FilterBar/FilterBar.jsx` |
| Pagination | `components/Layout/Pagination.jsx` (`page`, `setPage`, `total`) |
| Delete or destructive confirm | `components/Layout/ConfirmModal.jsx` |
| Loading | `components/Layout/Loader.jsx`, `Loader2` from lucide with `animate-spin` in buttons |
| Searchable dropdown | `components/AddOrder/SearchableSelect.jsx` |
| Global create and edit modals | `ModalContext` → `openModal('brand' | 'category' | 'coupon', data)`, `openAddressModal` |
| Order quick view | `GlobalOrderModal`, `OrderPanel` |
| Toasts | `react-hot-toast` (`toast.success`, `toast.error`), styled via `.toast-premium` |
| Icons | `lucide-react` (preferred), `h-4 w-4` inline, `h-5 w-5` in buttons. Heroicons exist in older code. |

### Primary button
```jsx
<button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-500 transition-all font-semibold shadow-lg shadow-blue-600/20 cursor-pointer">
  <Plus className="h-5 w-5" /> Add Brand
</button>
```

### Secondary or ghost button
```jsx
<button className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-200 rounded-xl transition-all cursor-pointer">Cancel</button>
```

### Card
```jsx
<div className="bg-[#0b1a2a] border border-slate-800 rounded-2xl p-6 shadow-xl">…</div>
```

### Table
```jsx
<div className="overflow-x-auto rounded-xl border border-slate-700 shadow-xl">
  <table className="min-w-full divide-y divide-slate-700">
    <thead className="text-white bg-[#0b3a61]">
      <tr><th className="px-6 py-3 text-left text-xs font-medium uppercase">Name</th></tr>
    </thead>
    <tbody className="divide-y divide-slate-800">…</tbody>
  </table>
</div>
```

### Input
```jsx
<input className="w-full bg-[#0b1a2a] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500" />
```

## 6. UX patterns
- **Permissions in the UI:** hide actions the user can't perform (`hasPermission('app.add_model')`). Don't only disable them.
- **Optimistic removal:** after a successful delete, filter the item out of state and show a toast. Don't refetch the whole list.
- **Refresh after a modal save:** dispatch the `refreshData` event.
- **Empty states:** a centred icon + `text-slate-400` message + a primary CTA when the user has permission.
- **Errors:** `console.error` for debugging plus a user-facing `toast.error`. Show the server message when the API returns one (`error.response?.data`).
- **Currency:** show `StoreConfiguration.currency_symbol` (default ৳) from `useStoreConfig`. Don't hardcode it.
- **Dates:** show them in the store timezone. Use relative time ("5 min ago") for activity feeds.
- **Real time:** new orders, chats and notifications appear without reload. Use a badge count on the sidebar or header.

## 7. Accessibility checklist
- Every icon-only button has `aria-label` or `title`.
- Focus styles are visible (`focus:ring-*`). Don't remove outlines without a replacement.
- Text contrast on navy is at least 4.5:1. Avoid `text-slate-600` and `text-slate-700` for meaningful text.
- Modals close on Escape and backdrop click, and return focus to the trigger.
