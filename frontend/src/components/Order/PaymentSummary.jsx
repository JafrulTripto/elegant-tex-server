import React from 'react';

const PaymentSummary = ({payment}) => {
  return (
    <ul>
        <li className="flex items-center justify-between mb-3"><span>Subtotal</span><span
          className="font-semibold"><span>{payment.amount} tk</span></span></li>
        <li className="flex items-center justify-between mb-3"><span>Delivery fee</span><span
          className="font-semibold"><span>{payment.deliveryCharge} tk</span></span></li>
        <hr className="mb-3"/>
          <li className="flex items-center justify-between"><span>Total</span><span
            className="font-semibold"><span>{payment.totalAmount} tk</span></span>
          </li>
    </ul>
  );
};

export default PaymentSummary;
