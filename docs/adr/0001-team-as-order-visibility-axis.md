# Team is the single order-visibility axis

Order visibility used to be split: marketplace orders were scoped by
`marketplace_user` membership (unless the user had `VIEW_ALL_ORDERS`), while
merchant orders were not scoped at all. We are introducing Teams (each user
belongs to exactly one) as the unit of data separation.

**Decision:** Team becomes the *sole* visibility axis for all orders, merchant and
marketplace alike. Each order carries the team of its creator, snapshotted at
creation. Users see only their own team's orders and performance; admins see all
teams. The `marketplace_user`-based visibility rule is retired.

**Consequences:** `marketplace_user` survives only as channel assignment, not
visibility. Merchant orders become team-scoped for the first time. Every user and
order must have a team, so a default "Unassigned" team is seeded and all existing
users/orders are backfilled into it (see the transition plan). Moving a user
between teams does not retroactively reassign their past orders.

**Rejected:** applying team AND marketplace together (two overlapping rules, hard
to reason about); scoping merchant orders by team but leaving marketplace orders on
the old rule (inconsistent per order type).
