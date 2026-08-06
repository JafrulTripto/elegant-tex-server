# Elegant Tex

Order & production management for a textile business. Orders move through a
production lifecycle; each order carries product line items and (for marketplace
orders) a customer.

## Products & Fabrics

**Product**:
One line on an order — a quantity of a given Product Type in a specific Fabric
Type and Fabric Color, at a price. A Product belongs to an Order; it is not a
standalone catalog entry.
_Avoid_: item, line item, SKU

**Product Type**:
The kind of finished good (e.g. bedsheet, pillow cover). Curated in Product
Settings.
_Avoid_: category

**Fabric Color**:
The color or pattern of a line's fabric, chosen from a swatch catalog where each
entry carries a swatch image. Formerly labelled just "Fabric".
_Avoid_: Fabric (now ambiguous), swatch, colour, ProductColor

**Fabric Type**:
The material/kind of fabric (e.g. cotton, silk). An axis independent of Fabric
Color — any Fabric Color may pair with any Fabric Type. Curated in Product
Settings.
_Avoid_: Fabric, material, ProductFabric

**Product Kind**:
The identity that decides whether two Products are "the same kind" for stock
matching: the triple (Product Type + Fabric Type + Fabric Color). Quantity,
price, and description are not part of a Kind.
_Avoid_: SKU, variant, product identity

## Teams & Access

**Team**:
A named group of staff Users; every User belongs to exactly one Team. The Team is
the unit of data separation — members see their own Team's Orders and performance
and no other Team's, while Admins see all Teams. Distinct from Role (which governs
permissions) and Marketplace (a sales channel).
_Avoid_: group, squad, department, marketplace

## Stock & Returns

**Ready Stock**:
The on-hand count of finished units, per Product Kind, derived as the running sum
of that Kind's Stock Movements. Company-wide — not scoped by Team.
_Avoid_: inventory, warehouse, available stock

**Stock Movement**:
A single recorded change to Ready Stock for one Product Kind: a signed quantity
with a reason, an actor, and a timestamp. Kinds of movement — return-in (a sellable
returned line), manual-in (a manual addition), manual adjustment (a correction such
as loss or stock-take, may be negative), and pull-out (an order line fulfilled from
stock).
_Avoid_: transaction, entry, ledger row

**Pull from stock**:
Fulfilling one open order line from Ready Stock instead of producing it: it flags
that line as fulfilled-from-stock and records a pull-out Stock Movement. When
*every* line of an order is pulled, the order jumps straight to READY.
_Avoid_: consume, allocate, reserve
