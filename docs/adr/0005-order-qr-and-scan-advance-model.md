# Order QR payload and scan-to-advance model

The mobile app lets floor staff advance an order's status by scanning a code on the
physical order. No QR exists anywhere today, `getOrder` resolves by database id
while the printed, human-facing identifier is the order number, and a scan on a busy
floor must be hard to trigger by accident. We need a payload that is stable once
printed and a scan interaction that is safe.

**Decision:** An Order QR encodes a namespaced deep link carrying the database id —
`eleganttex://order/{id}`. The namespace stops the scanner acting on unrelated codes;
the id resolves directly via `getOrder/{id}`. The **web** generates the code, on the
invoice PDF and a printable label. Manual entry accepts the printed order number and
resolves it via a lookup-by-order-number path. A scan opens a **one-tap confirm card**
showing `current → suggested-next` (with the option to pick any permitted status). A
next step is suggested only for orders that are APPROVED or later, along the
production span (PRODUCTION → QA → READY → DELIVERED); it is never auto-suggested from
a terminal status (DELIVERED) or an off-flow status (RETURNED / CANCELLED / BOOKING),
which instead show the current status and drop to a manual pick. The transition obeys
the per-target-status permission rule (see ADR 0004).

**Consequences:** Once codes are printed on real orders the payload format is
effectively frozen — changing it means reprinting. The scanner depends on the web
QR-generation change and the order-number lookup shipping first. Approval
(DRAFT → APPROVED) is deliberately not a scan action.

**Rejected:** zero-tap auto-advance (a mis-scan silently moves an order, and the
naive next-status math misfires on off-flow statuses); a plain id or the `ET-ORD-…`
string with no namespace (the scanner would "succeed" on unrelated QR codes); a
signed/opaque token (adds key management for no real gain on an internal,
already-authenticated tool).
