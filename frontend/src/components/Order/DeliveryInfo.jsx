import React from 'react';
import dayjs from "dayjs";

const DeliveryInfo = ({deliveryDate, deliveryChannel}) => {
  return (
    <ul>
      <li className="flex items-center justify-between mb-3"><span>Delivery Channel</span><span
        className="font-semibold"><span>{deliveryChannel}</span></span></li>
      <li className="flex items-center justify-between mb-3"><span>Delivery Date</span><span
        className="font-semibold"><span>{dayjs(deliveryDate).format('DD MMMM')}</span></span></li>
    </ul>
  );
};

export default DeliveryInfo;
