# Ready Stock is company-wide, not team-scoped

Orders and dashboards are strictly separated by Team. Ready Stock holds returned,
sellable finished goods, counted per Product Kind and matched to open orders so
staff can fulfil from stock instead of re-producing.

**Decision:** Ready Stock is a single global pool. Any team's open order may match
and pull any unit, regardless of which team's return created it — the goods are one
physical inventory and the feature's whole purpose is to avoid re-making something
that already exists.

**Consequences:** A deliberate exception to team separation. A member can see and
pull stock that originated from another team's return, so "1 in ready stock" on an
order badge is not gated by team. Team separation is about orders and performance,
not physical stock.

**Rejected:** per-team stock (consistent with strict separation, but leaves
physically-available units idle while another team re-produces the same Kind,
defeating the feature).
