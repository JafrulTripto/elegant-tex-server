export const OrderStatusEnum = Object.freeze([
  {
    label: 'DRAFT',
    value: 1,
    color: '#757575',
    permission:'ORDER_APPROVE'
  },
  {
    label: 'APPROVED',
    value: 2,
    color: '#492E87'
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
