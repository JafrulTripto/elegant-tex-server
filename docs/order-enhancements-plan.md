# Order Enhancements — Implementation Plan

Covers three enhancements agreed in the design session. Domain terms are defined in
[CONTEXT.md](../CONTEXT.md); the load-bearing decisions are in
[docs/adr/0001](adr/0001-team-as-order-visibility-axis.md),
[0002](adr/0002-ready-stock-is-company-wide.md),
[0003](adr/0003-fully-stocked-orders-skip-production-and-qa.md).

Sequenced in dependency order: **Phase 1 (Fabric)** establishes Product Kind, which
**Phase 3 (Ready Stock)** needs. **Phase 2 (Teams)** is independent and can land in
parallel. Phase 0 is preparatory cleanup.

## Status

Branch `feature/order-enhancements`:
- ✅ **Phase 0** — dead `product_colors`/`product_fabrics` dropped; models, controllers,
  routes, and the stale `useProductColors` hook removed.
- ✅ **Phase 1 (Fabric Type, additive)** — `fabric_types` table + "Unspecified" seed,
  `products.fabric_type_id`, model/resource/controller, `settings/fabricTypes` routes,
  validation, `ProductService`, and frontend (Product Settings tab, order-form dropdown,
  edit-order prefill, order-detail tag).
- ⬜ **Phase 1 (Fabric rename)** — `fabrics → fabric_colors` still pending (its own commit).
- ⬜ **Phase 2 (Teams)**, **Phase 3 (Ready Stock)** — pending.

Migrations to run in the Docker/MySQL env: `php artisan migrate` (adds the three
`2026_08_04_*` migrations).

## Data-model changes at a glance

| Table | Change |
|---|---|
| `product_colors`, `product_fabrics` | **drop** (dead, unused — the naming collision) |
| `fabrics` → `fabric_colors` | rename table + model `Fabrics`→`FabricColor`; migrate `images.imageable_type` |
| `fabric_types` | **new** — `id, name` (curated in Product Settings) |
| `products.fabrics_id` → `fabric_color_id` | rename FK |
| `products.fabric_type_id` | **new** FK → `fabric_types` (backfill "Unspecified", then NOT NULL) |
| `product_kinds` | **new** — `product_type_id, fabric_type_id, fabric_color_id` (unique), `on_hand` cache |
| `products.product_kind_id` | **new** FK (resolved at line save; backfill from triple) |
| `products.is_returned / return_condition / returned_at` | **new** — per-line return + condition |
| `products.fulfilled_from_stock / fulfilled_from_stock_at` | **new** — pull-from-stock flag |
| `stock_movements` | **new** — `product_kind_id, quantity(signed), type, reason, user_id, order_id?, product_id?` |
| `teams` | **new** — `id, name` |
| `users.team_id` | **new** FK (backfill "Unassigned", then NOT NULL) |
| `orders.team_id` | **new** FK, snapshot at creation (backfill from creator, then NOT NULL) |

New permissions: `TEAM_SETTINGS`, `VIEW_STOCK`, `MANAGE_STOCK`, `RETURN_ORDER`,
`PULL_FROM_STOCK`. "See all teams" reuses the existing `VIEW_ALL_ORDERS`.

---

## Phase 0 — Cleanup (small, low-risk)

- [ ] Migration: `drop product_colors`, `drop product_fabrics`.
- [ ] Delete `app/Models/ProductColor.php`, `ProductFabric.php`,
      `app/Http/Controllers/Api/ProductColorController.php`, `ProductFabricController.php`.
- [ ] Remove their routes in `routes/api.php` (the live `ProductColorController`
      block and the commented `ProductFabricController` block).

## Phase 1 — Fabric Color + Fabric Type (Feature 1)

**Backend**
- [ ] Rename table `fabrics`→`fabric_colors`; model `Fabrics`→`FabricColor`;
      `FabricsService`/`FabricsController`→`FabricColor*`. Data migration:
      `UPDATE images SET imageable_type='App\Models\FabricColor' WHERE imageable_type='App\Models\Fabrics'`.
      (Alternatively register a `Relation::morphMap` alias — but a one-off data
      migration is cleaner since we're renaming anyway.)
- [ ] Rename `products.fabrics_id`→`fabric_color_id`. Fix the `Product::fabircs()`
      typo relation → `fabricColor()`; rename the `fabricsId` accessor →
      `fabricColorId`.
- [ ] New `fabric_types` table + `FabricType` model + `FabricTypeController`
      (index/store/update/delete, mirroring `ProductTypeController`) under a
      `settings/fabricTypes` route group gated by `PRODUCT_SETTINGS`.
- [ ] Seed a default **"Unspecified"** fabric type.
- [ ] `products.fabric_type_id`: add nullable FK → backfill all rows to
      "Unspecified" → alter NOT NULL.
- [ ] Add `fabricTypeId` accessor to `Product`; include fabric color + type in
      `OrderResource`/product serialization.
- [ ] `StoreOrderRequest`/`UpdateOrderRequest`: rename `products.*.fabrics` →
      `products.*.fabricColor` (`exists:fabric_colors,id`); add
      `products.*.fabricType` required `exists:fabric_types,id`. `ProductService::store`
      writes `fabric_color_id` + `fabric_type_id`.

**Frontend**
- [ ] `components/Order/OrderProductForm.jsx`: relabel "Fabric" → **Fabric Color**
      (field `products[].fabricColor`); add a required **Fabric Type** dropdown
      (`products[].fabricType`) fed by a new `useFabricTypes` hook.
- [ ] `hooks/useFabricTypes.jsx` (copy of `useProductTypes`, `/settings/fabricTypes/index`).
- [ ] `views/ProductSettings.jsx`: add a **Fabric Types** tab via `ProductSettingsItem`
      (`settingsType.key: 'fabricTypes'`); relabel "Fabric Library" → **Fabric Colors**.
- [ ] Mirror the field changes in `views/EditOrderFrom.jsx` and the order-detail view.

## Phase 2 — Teams (Feature 2) — ADR 0001

**Backend**
- [ ] `teams` table + `Team` model (`hasMany` users, `hasMany` orders). Seed
      **"Unassigned"**.
- [ ] `users.team_id`: nullable FK → backfill all users to "Unassigned" → NOT NULL.
      `User belongsTo Team`; `UserController` store/update accept `team_id`.
- [ ] `orders.team_id`: FK → backfill from each order's creator's team → NOT NULL.
      `Order belongsTo Team`. `OrderService::store` sets `team_id` = creator's team
      (snapshot). Optional admin `PUT /orders/{id}/team` reassign endpoint.
- [ ] **Rewrite order visibility** — `OrderController::getMarketplaceOrders` &
      `getMerchantOrders`: replace the `marketplace_user` `whereHasMorph` scoping with
      `VIEW_ALL_ORDERS ? all : where('team_id', auth team)`. Same rule for both order
      types (merchant orders become scoped for the first time).
- [ ] **Dashboards** — `UserDashboardService`: change `where('created_by',$userId)`
      (and the `OrderStatusChange` `whereHas`) to scope by the user's `team_id`, so a
      member sees their whole team. Admin services unchanged.
- [ ] Permissions: add `TEAM_SETTINGS`; grant `TEAM_SETTINGS` + `VIEW_ALL_ORDERS` to
      Admin/SUDO (update `RolesAndPermissionsSeeder` **and** a data migration for
      existing DBs). `TeamController` CRUD + user assignment under `settings/teams`.

**Frontend**
- [ ] Team Settings view (list/create/edit teams, assign users), modeled on
      `RoleSettings`; nav entry gated by `TEAM_SETTINGS`.
- [ ] `views/UserForm.jsx`: add required **Team** select.
- [ ] Order list: optional Team column for `VIEW_ALL_ORDERS` users; confirm no
      frontend still assumes marketplace-based filtering.

## Phase 3 — Ready Stock & returns matching (Feature 3) — ADR 0002/0003

**Backend**
- [ ] `product_kinds` table (`product_type_id, fabric_type_id, fabric_color_id`
      unique, `on_hand` int default 0). `ProductKind` model + `firstOrCreate` helper.
- [ ] `products.product_kind_id`: add FK → backfill each row via find-or-create from
      its triple → NOT NULL. `ProductService::store` resolves + attaches it.
- [ ] `products`: `is_returned` bool, `return_condition` enum(SELLABLE,DAMAGED) null,
      `returned_at` null; `fulfilled_from_stock` bool, `fulfilled_from_stock_at` null.
- [ ] `stock_movements` table + `StockMovement` model (types RETURN_IN, MANUAL_IN,
      ADJUSTMENT, PULL_OUT). `on_hand` is a cache = sum(movements); add an
      artisan recalc command.
- [ ] `StockService` (all methods in `DB::transaction`, `lockForUpdate` on the kind):
  - `recordReturn(order, lines[condition])` → set line return fields; SELLABLE lines
    emit `RETURN_IN (+count)` and bump `on_hand`.
  - `manualIn` / `adjust(kind, qty, reason)` → `MANUAL_IN` / `ADJUSTMENT`.
  - `pull(line)` → guard status ∈ {DRAFT,BOOKING,APPROVED} and `on_hand ≥ count`;
    emit `PULL_OUT (−count)`, set `fulfilled_from_stock`, decrement `on_hand`; **if
    every line of the order is now fulfilled_from_stock → set order READY + write an
    `OrderStatusChange`** ("Fulfilled from ready stock", actor).
- [ ] `getOrder`/`OrderResource`: for eligible orders, each line exposes
      `available_in_stock` (its kind's `on_hand`) and `fulfilled_from_stock`.
- [ ] Routes + permissions: `POST /orders/{o}/returns` (`RETURN_ORDER`),
      `POST /orders/{o}/products/{p}/pull` (`PULL_FROM_STOCK`), `GET /stock` +
      `GET /stock/{kind}/movements` (`VIEW_STOCK`), `POST /stock/movements`
      (`MANAGE_STOCK`). Seed the new permissions.

**Frontend**
- [ ] Order detail: per eligible line show a **"N in ready stock"** badge + gated
      **Pull from stock** action; render the fulfilled-from-stock state.
- [ ] Returns UI: on a delivered order, **Mark returned** → pick lines + condition
      (sellable/damaged) → submit.
- [ ] **Ready Stock** view: Product-Kind table with `on_hand`, search/filter; **Add
      stock** (manual-in) and **Adjust** forms; per-kind movement-history drawer. Nav
      entry gated by `VIEW_STOCK`.

---

## Cross-cutting

- **Transactions:** `OrderService::store` currently has none — wrap it (and every
  stock write) in `DB::transaction`.
- **Concurrency:** `lockForUpdate` on the `product_kinds` row during `pull` enforces
  "first to consume wins" and prevents overselling the last unit.
- **Tests (none exist today):** add feature tests for — order store resolves fabric
  type + product kind; team-scoped list/dashboard visibility; return emits RETURN_IN;
  pull deducts and only a fully-pulled order auto-advances to READY.

## Suggested commit / PR order

1. Phase 0 cleanup (drop dead tables/models/routes).
2. Fabric Color rename (table/model/FK/morph) — isolated, highest-churn.
3. Fabric Type (table, settings CRUD, order-form dropdown, validation).
4. Product Kind (table + backfill + line resolution) — bridges Phase 1→3.
5. Teams data model (teams, users.team_id, orders.team_id + backfill).
6. Team-scoped visibility + dashboards + Team Settings UI.
7. Stock ledger + returns (per-line return, RETURN_IN, condition).
8. Matching badge + pull-from-stock + auto-advance.
9. Ready Stock management UI (manual entry/adjust, history).

## Watch-outs

- The **Fabric Color rename** touches `images.imageable_type` (morph), the
  `products` FK, and the `useFabrics` frontend hook — keep it its own PR.
- The **visibility rewrite** changes who-sees-what for everyone; the "Unassigned"
  backfill must run first so no user is left teamless and orders stay visible.
- Retiring `marketplace_user` *visibility* must not break marketplace **assignment**
  (`MarketplaceController::getUserMarketplaces`) — that pivot stays, only its use as a
  visibility gate goes.
