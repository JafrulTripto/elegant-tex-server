// The Order QR payload (ADR 0005): a namespaced deep link carrying the DB order
// id, so the mobile app resolves it via getOrder/{id} and unrelated QR codes are
// ignored. Single source of truth for the scheme, shared by the invoice + label.
export const ORDER_QR_SCHEME = 'eleganttex';

export const orderDeepLink = (id) => `${ORDER_QR_SCHEME}://order/${id}`;
