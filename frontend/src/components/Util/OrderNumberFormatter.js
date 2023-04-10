
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
