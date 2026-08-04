# Fully-stocked orders skip production and QA

An open order line can be fulfilled from Ready Stock ("pull") instead of being
produced. Pulls are per-line, but order status is order-level. Returned goods only
enter Ready Stock if marked sellable at the moment of return.

**Decision:** Pulling a line flags it as fulfilled-from-stock and deducts the
units. Only when *every* line of an order has been pulled does the order
auto-advance straight to READY, skipping PRODUCTION and QA — the sellable-condition
check performed at return time is the quality gate that justifies skipping QA. A
partial pull changes no status. Only DRAFT, BOOKING, and APPROVED orders are
eligible to match and pull.

**Consequences:** An order can reach READY with no PRODUCTION/QA history. The audit
trail relies on the per-line fulfilled-from-stock flag plus the status-change record
the pull writes. If a fully-stocked (already advanced) order is later cancelled or
returned, restoring its units to stock is out of scope for the first version.

**Rejected:** advancing on any single pull (would mark an order ready while other
lines still need producing — status would lie).
