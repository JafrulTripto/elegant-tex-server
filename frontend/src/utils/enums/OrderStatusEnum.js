export const OrderStatusEnum = Object.freeze([
  {
    label: 'DRAFT',
    value: 0,
    color: '#FF0032',
    permission:'ORDER_APPROVE'
  },
  {
    label: 'APPROVED',
    value: 1,
    color: '#122c91'
  },
  {
    label: 'PRODUCTION',
    value: 2,
    color: 'purple',
    permission:'ORDER_IN_PRODUCTION'
  },
  {
    label: 'QA',
    value: 3,
    color: 'green',
    permission:'ORDER_IN_QA'
  },
  {
    label: 'READY',
    value: 4,
    color: '#0C6170',
    permission:'ORDER_READY'
  },
  {
    label: 'DELIVERED',
    value: 5,
    color: '#37BEB0',
    permission:'ORDER_DELIVERED'
  },
  {
    label: 'RETURNED',
    value: 6,
    color: '#FBC740',
    permission:'ORDER_RETURNED'
  },
  {
    label: 'CANCELLED',
    value: 7,
    color: '#FBC740',
    permission:'ORDER_CANCELLED'
  },
  {
    label: 'BOOKING',
    value: 8,
    color: '#38419D',
    permission:'ORDER_BOOKING'
  }
])
