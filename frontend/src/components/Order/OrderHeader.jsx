import React, {useState} from 'react';
import {Button, Tag} from "antd";
import {CalendarOutlined, DownloadOutlined} from "@ant-design/icons";
import moment from "moment/moment";
import {OrderStatusEnum} from "../../utils/enums/OrderStatusEnum";
import {formatOrderNumber} from "../Util/OrderNumberFormatter";
import OrderInvoice from "../OrderInvoice/OrderInvoice";
import { PDFDownloadLink } from '@react-pdf/renderer';
import dayjs from "dayjs";

const OrderHeader = ({order}) => {
  const [pdfLoading, setPdfLoading] = useState(false);

  const generateTagColorFromStatus = (status) => {
    let obj = OrderStatusEnum.find(o => o.label === status);
    return obj.color;
  }
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h3 className="text-2xl text-stone-900">
            Order #{formatOrderNumber(order.id)}
          </h3>
          <div className="mb-3 pl-5 font-bold">
            <Tag color={generateTagColorFromStatus(order.status)}>{order.status}</Tag>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-zinc-500">
            <span className="text-sm font-thin">Ordered By:</span> {order.orderable.name}
          </div>
          <div className="pl-4">

            <PDFDownloadLink document={<OrderInvoice order={order} />} fileName={`${formatOrderNumber(order.id)}-${dayjs().unix()}.pdf`}>
              {({ blob, url, loading, error }) =>
                <Button type="dashed" loading={loading} icon={<DownloadOutlined/>}
                >Download PDF
                </Button>
              }
            </PDFDownloadLink>
          </div>

        </div>
      </div>
      <CalendarOutlined className="text-zinc-500 pr-1"/>
      <span className="text-zinc-500">{moment(order.createdAt).format('MMMM Do YYYY, h:mm a')}</span>
    </div>
  );
};

export default OrderHeader;
