import React from 'react';
import { Button, Tag, Typography } from "antd";
import { CalendarOutlined, DownloadOutlined } from "@ant-design/icons";
import { OrderStatusEnum } from "../../utils/enums/OrderStatusEnum";
import { formatOrderNumber } from "../Util/OrderNumberFormatter";
import OrderInvoice from "../OrderInvoice/OrderInvoice";
import { PDFDownloadLink } from '@react-pdf/renderer';
import dayjs from "dayjs";

const { Title, Text } = Typography;

const OrderHeader = ({ order }) => {

    const getOrderStatusInfo = (data) => {
        const status = OrderStatusEnum.find(status => status.value === data);
        console.log(status)
        if (status) {
            return { label: status.label, color: status.color };
        } else {
            return null; // Return null if the value is not found
        }
    };
    let { label, color } = getOrderStatusInfo(order.status)
    return (
        <div className="mb-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Title level={3} style={{ margin: 0 }}>
                        Order #{formatOrderNumber(order.id)}
                    </Title>
                    <div className="pl-4">
                        <Tag color={color}>{label}</Tag>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <div className="mb-1">
                            <Text type="secondary">Ordered By: </Text>
                            <Text strong>{order.orderable.name}</Text>
                        </div>
                        {order.merchantRef && (
                            <div>
                                <Text type="secondary">Merchant Reference: </Text>
                                <Text strong className="text-blue-600 dark:text-blue-400">{order.merchantRef}</Text>
                            </div>
                        )}
                    </div>

                    <div className="pl-4">
                        <PDFDownloadLink document={<OrderInvoice order={order} />}
                            fileName={`${formatOrderNumber(order.id)}-${dayjs().unix()}.pdf`}>
                            {({ blob, url, loading, error }) =>
                                <Button type="dashed" loading={loading} icon={<DownloadOutlined />}
                                >Download PDF
                                </Button>
                            }
                        </PDFDownloadLink>
                    </div>
                </div>
            </div>
            <div className="flex items-center text-gray-500">
                <CalendarOutlined className="pr-1" />
                <Text type="secondary">{dayjs(order.createdAt).format('MMMM Do YYYY, h:mm a')}</Text>
            </div>
        </div >
    );
};

export default OrderHeader;
