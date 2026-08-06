
export function formatOrderNumber(num) {
  const now = new Date();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear().toString().substring(2);
  const number = num.toString().padStart(4, '0');
  return `ET-ORD-${month}${year}-${number}`;
}

export function extractOrderNumber(orderNumber) {
  return +orderNumber.split("-").pop();
}

// Short, human-friendly number derived from the real stored order_id
// (ET-ORD-<datetime><seq>) by dropping the datetime and keeping the trailing
// sequence — e.g. "ET-ORD-202608051015431042" -> "ET-ORD-1042".
export function shortOrderNumber(orderId) {
  if (!orderId) return '';
  return `ET-ORD-${String(orderId).slice(-4)}`;
}
