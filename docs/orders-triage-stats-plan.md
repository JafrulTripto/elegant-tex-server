# Plan — Replace Orders KPI stats with an actionable triage panel

## Problem

The four KPI cards on the web Orders page (`Total Orders`, `Pending`,
`Processing`, `Delivered`) are **all-time cumulative counts**. They barely move
day to day, tell nobody what needs doing, and aren't clickable — so they
duplicate the status column of the table below without driving any action.

## Goal

Replace them with four **triage** cards that each answer *"what needs attention
now?"* and, when clicked, **filter the table to exactly those rows**. No new
list-filter plumbing — every card is expressible with filters the list endpoint
already supports.

## Glossary (ubiquitous language)

- **Terminal status** — an order that has left the active pipeline:
  `DELIVERED (6)`, `RETURNED (7)`, `CANCELLED (8)`.
- **Open status** — an order still in play, i.e. everything except DRAFT and
  the terminal statuses: `BOOKING (9)`, `APPROVED (2)`, `PRODUCTION (3)`,
  `QA (4)`, `READY (5)`. DRAFT is excluded because a draft is not yet a
  committed order. **(Decision to confirm — see Open questions.)**
- **Overdue** — an *open* order whose `delivery_date` is strictly before today.
- **Due today** — an *open* order whose `delivery_date` is today.
- **In production** — an order in `APPROVED`, `PRODUCTION`, or `QA` (active WIP).
- **Ready to deliver** — an order in `READY`.

"Today" is evaluated in the app timezone (`config('app.timezone')`), matching
`whereDate` semantics used elsewhere.

## The four cards

| Card | Definition | Tint | Click → table filter |
|------|-----------|------|----------------------|
| **Overdue** | open ∧ `delivery_date < today` | red `#ef4444` | `status=9,2,3,4,5` + delivery range `[null, yesterday]` |
| **Due today** | open ∧ `delivery_date = today` | amber `#f59e0b` | `status=9,2,3,4,5` + delivery range `[today, today]` |
| **In production** | `status ∈ {2,3,4}` | indigo `#6366f1` | `status=2,3,4`, clear date range |
| **Ready to deliver** | `status = 5` | green `#10b981` | `status=5`, clear date range |

Order left→right = urgency: two date alerts first, then the two WIP loads.

The card count and its click-through use the **same predicate**, so the number
on the card always equals the row count you land on (see Consistency).

## Backend changes

### 1. `app/Enums/OrderStatus.php` — status-set helpers (single source of truth)

```php
/** Statuses that have left the active pipeline. */
public static function terminal(): array
{
    return [self::DELIVERED->value, self::RETURNED->value, self::CANCELLED->value];
}

/** Open/active statuses: committed but not yet terminal (DRAFT excluded). */
public static function open(): array
{
    return [
        self::BOOKING->value, self::APPROVED->value,
        self::PRODUCTION->value, self::QA->value, self::READY->value,
    ];
}
```

### 2. `OrderController::getStats` — rewrite buckets + channel scope

- Keep `applyTeamScope` (ADR 0001).
- **Scope to the active channel** so the numbers match the table the user is
  looking at: accept `?orderType=` (`MARKETPLACE` | `MERCHANT`) and apply the
  same `whereHasMorph('orderable', [Marketplace|Merchant::class])` the list
  endpoints use. If omitted, count across both channels (back-compat).
- New response shape:

```php
$today = now()->toDateString();
$open  = OrderStatus::open();

$stats = [
    'overdue'        => (clone $query)->whereIn('status', $open)->whereDate('delivery_date', '<', $today)->count(),
    'dueToday'       => (clone $query)->whereIn('status', $open)->whereDate('delivery_date', '=', $today)->count(),
    'inProduction'   => (clone $query)->whereIn('status', [
                            OrderStatus::APPROVED->value, OrderStatus::PRODUCTION->value, OrderStatus::QA->value,
                        ])->count(),
    'readyToDeliver' => (clone $query)->where('status', OrderStatus::READY->value)->count(),
];
```

No change to `applyFiltersToQuery` or the list endpoints — all four filters
(`status`, `startDate`/`endDate` on `delivery_date`) already exist.

## Frontend changes — `frontend/src/views/Orders.jsx`

1. **Stats state** → `{ overdue, dueToday, inProduction, readyToDeliver }`; pass
   the active channel to `getStats` (`?orderType=${orderType}`), and refetch
   stats when the marketplace/merchant tab changes (add `orderType` to the
   stats effect deps).
2. **Card config** — replace the `kpis` array (currently
   [Orders.jsx:296](../frontend/src/views/Orders.jsx#L296)) with the four cards
   above (label, value, tint, icon, and an `onClick`).
3. **Click → filter** — each card sets the existing filter state and resets the
   page; the list refetch fires automatically (its deps already include
   `statusFilter` and `deliveryRange`):
   - Overdue → `setStatusFilter([9,2,3,4,5]); setDeliveryRange([null, dayjs().subtract(1,'day')])`
   - Due today → `setStatusFilter([9,2,3,4,5]); setDeliveryRange([dayjs(), dayjs()])`
   - In production → `setStatusFilter([2,3,4]); setDeliveryRange(null)`
   - Ready to deliver → `setStatusFilter([5]); setDeliveryRange(null)`
   Then `resetPage()`. Add hover/cursor affordance and `aria-label` to cards.
4. **Open-ended delivery range** — Overdue needs "no lower bound." Make
   `buildQuery` emit `startDate` only when `deliveryRange[0]` is set and
   `endDate` only when `deliveryRange[1]` is set, so `[null, yesterday]` and
   `[today, today]` both serialize correctly. (Today `buildQuery` assumes both
   ends are present — [Orders.jsx:94-97](../frontend/src/views/Orders.jsx#L94).)
5. **Subtitle** — the header line "N orders across marketplace and merchant
   channels" stays as the all-time total (it's honest context, not a KPI).

## Consistency notes

- **Card count == filtered rows.** Because each card's predicate is mirrored by
  its filter link *and* stats are channel-scoped to the active tab, the number
  matches what you land on. The only seam: the card uses `delivery_date < today`
  while the list filter uses `<= yesterday` — these are equal for date-only
  values, so counts agree.
- **Team scope** unchanged (ADR 0001): non-admins see only their team in both
  the KPIs and the table.

## Out of scope (later)

- A throughput / "how are we doing this week" trend (delivered-per-day). That
  wants a small dedicated trend endpoint keyed off `order_status_changes`, not a
  cramped KPI card — deliberately deferred.
- Mobile: the mobile Orders header still shows the old 4 stats; port this same
  set there in a follow-up if desired.

## Open questions (confirm before building)

1. **DRAFT in the open set?** Plan excludes DRAFT from Overdue/Due-today (a
   draft isn't a committed order). If drafts with a past delivery date should
   still raise a flag, add `DRAFT (1)` to `OrderStatus::open()` and the two
   card status-filter links.
2. **Channel scoping.** Plan scopes KPIs to the active marketplace/merchant tab
   so counts match the table. If you'd rather the KPIs always show a combined
   headline across both channels, drop the `orderType` param — but then a card
   click into a single-channel table will show fewer rows than the KPI.

## Test notes

- Unit: `OrderStatus::open()`/`terminal()` return the expected value sets.
- Feature: `getStats` with seeded orders across statuses + delivery dates
  returns correct `overdue`/`dueToday`/`inProduction`/`readyToDeliver`, honors
  team scope, and honors `orderType`.
- Manual: click each card → table filters to the matching rows and the result
  count equals the card number.
