# Order-status changes are gated per target status, not by one blanket permission

The system seeds both a blanket `CHANGE_STATUS` permission ("change to any status")
and per-target-status permissions (`ORDER_APPROVE`, `ORDER_IN_PRODUCTION`,
`ORDER_IN_QA`, `ORDER_READY`, `ORDER_DELIVERED`, `ORDER_RETURNED`,
`ORDER_CANCELLED`). Until now only `CHANGE_STATUS` was enforced (in
`updateOrderStatus`), so the per-status permissions were dead metadata and any
status-mover could set any status. The mobile QR flow needs floor roles
(production / QA / delivery) that each advance only their own stage.

**Decision:** Moving an order *into* status X requires `CHANGE_STATUS` (the umbrella
super-mover) **or** the target-status permission for X. This is enforced server-side
in `updateOrderStatus` and `cancelOrder`; the web status picker and the mobile
status sheet / scan both filter to the statuses the current user may set, so all
three surfaces share one barrier. `DRAFT → APPROVED` requires `ORDER_APPROVE`.

**Consequences:** Roles compose from existing permissions — Production holds
`ORDER_IN_PRODUCTION` (and `ORDER_IN_QA` to hand off), QA holds
`ORDER_IN_QA` / `ORDER_READY`, delivery holds `ORDER_DELIVERED`, supervisors keep
`CHANGE_STATUS`. Existing roles must be re-granted the appropriate per-status
permissions (or `CHANGE_STATUS`) or their holders lose the ability to change
status. `ORDER_BOOKING` is not currently seeded; add it if BOOKING should be gated.
The change touches backend, web, and mobile together.

**Rejected:** keeping the blanket `CHANGE_STATUS` and enforcing stage roles only
client-side in the mobile app — not a real barrier (a crafted request bypasses it),
and the web would diverge from mobile.
