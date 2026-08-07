export const OrderStatusEnum = Object.freeze([
  {
    // DRAFT is the initial state — no "set to DRAFT" permission; only the
    // umbrella CHANGE_STATUS can move an order back to it.
    label: 'DRAFT',
    value: 1,
    color: '#757575'
  },
  {
    label: 'APPROVED',
    value: 2,
    color: '#492E87',
    permission:'ORDER_APPROVE'
  },
  {
    label: 'PRODUCTION',
    value: 3,
    color: '#FFD700',
    permission:'ORDER_IN_PRODUCTION'
  },
  {
    label: 'QA',
    value: 4,
    color: '#FFA500',
    permission:'ORDER_IN_QA'
  },
  {
    label: 'READY',
    value: 5,
    color: '#2196F3',
    permission:'ORDER_READY'
  },
  {
    label: 'DELIVERED',
    value: 6,
    color: '#008000',
    permission:'ORDER_DELIVERED'
  },
  {
    label: 'RETURNED',
    value: 7,
    color: '#FF0000',
    permission:'ORDER_RETURNED'
  },
  {
    label: 'CANCELLED',
    value: 8,
    color: '#696969',
    permission:'ORDER_CANCELLED'
  },
  {
    label: 'BOOKING',
    value: 9,
    color: '#800080',
    permission:'ORDER_BOOKING'
  }
])

// Transition-scoped status permissions (ADR 0004), mirroring the backend's
// StatusChangeAuthorizer: a user may move an order into a status if they hold
// the umbrella CHANGE_STATUS, or that status's own permission.
export const canSetStatus = (permissions = [], status) =>
  permissions.includes('CHANGE_STATUS') ||
  (!!status?.permission && permissions.includes(status.permission));

// The subset of statuses the user is allowed to set — use this to build any
// status picker so web and mobile share one barrier.
export const settableStatuses = (permissions = []) =>
  OrderStatusEnum.filter((s) => canSetStatus(permissions, s));

// Whether the user can set at least one status (gates the status control itself).
export const canChangeAnyStatus = (permissions = []) =>
  settableStatuses(permissions).length > 0;
