import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Card, Skeleton, Image, Col, Row, Empty, Modal, Select, Steps, Tag, Divider, Typography } from 'antd';
import { ClockCircleOutlined, ShopOutlined, UserOutlined, CreditCardOutlined, InboxOutlined } from '@ant-design/icons';
import useAxiosClient from "../axios-client.js";
import { useStateContext } from "../contexts/ContextProvider";

import PaymentSummary from "../components/Order/PaymentSummary";
import CustomerInfo from "../components/Order/CustomerInfo";
import OrderHeader from "../components/Order/OrderHeader";
import DeliveryInfo from "../components/Order/DeliveryInfo";
import { extractOrderNumber } from "../components/Util/OrderNumberFormatter";
import dayjs from "dayjs";
import { OrderStatusEnum } from "../utils/enums/OrderStatusEnum";

const { Title, Text } = Typography;

const Order = () => {

    const axiosClient = useAxiosClient();
    const { permissions } = useStateContext();
    const canPull = permissions?.includes('PULL_FROM_STOCK');
    const canReturn = permissions?.includes('RETURN_ORDER');
    const ELIGIBLE_STATUSES = [1, 2, 9]; // DRAFT, APPROVED, BOOKING

    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState({});
    const [returnOpen, setReturnOpen] = useState(false);
    const [returnSelections, setReturnSelections] = useState({});
    const navigate = useNavigate()

    const { id } = useParams()

    const fetchOrders = useCallback(async () => {

        setLoading(true);
        try {
            const order = await axiosClient.get(`/orders/getOrder/${extractOrderNumber(id)}`);
            setOrder({ ...order.data.data })
            setLoading(false)
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            navigate('/notFound');
            toast.error(message);
            setLoading(false);
        }

    }, [axiosClient, id, navigate])

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders])

    const handlePull = async (item) => {
        try {
            const response = await axiosClient.post(`/orders/pullFromStock/${order.id}/${item.id}`);
            toast.success(response.data.message);
            fetchOrders();
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    }

    const submitReturns = async () => {
        const lines = Object.entries(returnSelections)
            .filter(([, condition]) => condition)
            .map(([productId, condition]) => ({ productId: Number(productId), condition }));
        if (lines.length === 0) { setReturnOpen(false); return; }
        try {
            const response = await axiosClient.post(`/orders/markReturned/${order.id}`, { lines });
            toast.success(response.data.message);
            setReturnOpen(false);
            setReturnSelections({});
            fetchOrders();
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    }

    // --- Render Helpers ---

    const renderProductList = () => {
        if (!order.products) return <Skeleton paragraph={{ rows: 3 }} />;

        return (
            <div className="flex flex-col gap-4">
                {canReturn && order.status === 6 && (
                    <div className="flex justify-end">
                        <Button danger onClick={() => setReturnOpen(true)}>Mark returned</Button>
                    </div>
                )}
                {order.products.map((item) => (
                    <div key={item.id} className="flex p-4 rounded-xl border border-gray-200 dark:border-gray-700 items-start gap-4 hover:shadow-md transition-shadow duration-200">
                        <div className="flex-shrink-0">
                            <Image
                                className="rounded-lg object-cover"
                                src={`${process.env.REACT_APP_API_BASE_URL}/files/upload/${item.fabrics?.image}`}
                                width={80}
                                height={80}
                                fallback="https://via.placeholder.com/80"
                            />
                        </div>
                        <div className="flex-grow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">{item.productType?.name}</h3>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Tag color="blue">{item.fabrics?.name}</Tag>
                                        {item.fabricType?.name && <Tag color="purple">{item.fabricType.name}</Tag>}
                                    </div>
                                    <p className="text-gray-500 text-sm">{item.description || 'No description provided.'}</p>
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                        {item.fulfilledFromStock && <Tag color="green">Fulfilled from stock</Tag>}
                                        {item.isReturned && (
                                            <Tag color={item.returnCondition === 'SELLABLE' ? 'gold' : 'red'}>
                                                Returned ({item.returnCondition})
                                            </Tag>
                                        )}
                                        {!item.fulfilledFromStock && ELIGIBLE_STATUSES.includes(order.status) && item.availableInStock > 0 && (
                                            <>
                                                <Tag color="green">{item.availableInStock} in ready stock</Tag>
                                                {canPull && (
                                                    <Button size="small" type="link" className="!px-0" onClick={() => handlePull(item)}>
                                                        Pull from stock
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-lg">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.price)}
                                    </div>
                                    <div className="text-gray-400 text-sm">Qty: {item.unit}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    const renderTimeline = () => {
        if (!order.orderStatusChanges) return <Skeleton paragraph={{ rows: 3 }} />;

        // Sort items if needed, or assume backend sends them ordered
        const items = order.orderStatusChanges.map(statusItem => {
            const statusConfig = OrderStatusEnum.find(s => s.value === statusItem.status);
            const color = statusConfig?.color || 'blue';
            const label = statusConfig?.label || statusItem.status;

            return {
                title: (
                    <div className="flex items-center gap-2">
                        <Tag color={color}>{label}</Tag>
                        <span className="text-xs text-zinc-400">{dayjs(statusItem.created_at).format('MMM D, YYYY h:mm A')}</span>
                    </div>
                ),
                description: (
                    <div className="mt-1">
                        {statusItem.comment && <div className="text-zinc-600 mb-1">{statusItem.comment}</div>}
                        {statusItem.user && <div className="text-xs text-zinc-400 italic">by {statusItem.user.firstname}</div>}
                    </div>
                ),
                icon: <ClockCircleOutlined style={{ color: color }} />
            }
        });

        return (
            <div className="px-2">
                <Steps direction="vertical" size="small" current={items.length} items={items} />
            </div>
        );
    }

    // --- Main Render ---

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">

            {/* Header Section */}
            <div>
                {order.id ? <OrderHeader order={order} /> : <Skeleton paragraph={{ rows: 1 }} active />}
            </div>

            <Row gutter={[24, 24]}>

                {/* Main Content Column */}
                <Col xs={24} lg={16}>
                    <div className="flex flex-col gap-6">

                        {/* Products Section */}
                        <Card
                            title={<div className="flex items-center gap-2"><ShopOutlined /> <span className="font-semibold">Order Items</span></div>}
                            bordered={false}
                            className="shadow-sm rounded-xl"
                        >
                            {renderProductList()}
                        </Card>

                        {/* Timeline Section */}
                        <Card
                            title={<div className="flex items-center gap-2"><ClockCircleOutlined /> <span className="font-semibold">Order History</span></div>}
                            bordered={false}
                            className="shadow-sm rounded-xl"
                        >
                            {renderTimeline()}
                        </Card>

                        {/* Images / Attachments */}
                        <Card
                            title="Attachments"
                            bordered={false}
                            className="shadow-sm rounded-xl"
                            bodyStyle={{ padding: '16px' }}
                        >
                            {order.images && order.images.length ? (
                                <div className="grid grid-cols-3 gap-2">
                                    {order.images.map(item => (
                                        <div key={item.id} className="aspect-square relative group overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                                            <Image
                                                className="object-cover w-full h-full"
                                                src={`${process.env.REACT_APP_API_BASE_URL}/files/upload/${item.id}`}
                                                preview={{ mask: 'View' }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No images" />
                            )}
                        </Card>
                    </div>
                </Col>

                {/* Sidebar Column */}
                <Col xs={24} lg={8}>
                    <div className="flex flex-col gap-6">

                        {/* Customer Info */}
                        <Card
                            title={<div className="flex items-center gap-2"><UserOutlined /> <span className="font-semibold">Customer</span></div>}
                            bordered={false}
                            className="shadow-sm rounded-xl"
                            loading={loading && !order.customer}
                        >
                            {order.customer ? <CustomerInfo customer={order.customer} /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                        </Card>

                        {/* Delivery Info */}
                        <Card
                            title={<div className="flex items-center gap-2"><InboxOutlined /> <span className="font-semibold">Delivery</span></div>}
                            bordered={false}
                            className="shadow-sm rounded-xl"
                            loading={loading && !order.payment}
                        >
                            {order.payment ? (
                                <DeliveryInfo
                                    deliveryDate={order.deliveryDate}
                                    deliveryChannel={order.deliveryChannel?.name}
                                />
                            ) : <Skeleton paragraph={{ rows: 2 }} />}
                        </Card>

                        {/* Payment Information */}
                        <Card
                            title={<div className="flex items-center gap-2"><CreditCardOutlined /> <span className="font-semibold">Payment</span></div>}
                            bordered={false}
                            className="shadow-sm rounded-xl"
                            loading={loading && !order.payment}
                        >
                            {order.payment ? <PaymentSummary payment={order.payment} /> : <Skeleton paragraph={{ rows: 2 }} />}
                        </Card>


                    </div>
                </Col>
            </Row>

            <Modal
                title="Mark lines as returned"
                open={returnOpen}
                onOk={submitReturns}
                onCancel={() => setReturnOpen(false)}
                okText="Record return"
                okButtonProps={{ danger: true }}
            >
                <Text type="secondary">Choose which lines came back and their condition. Sellable lines are added to ready stock.</Text>
                <div className="flex flex-col gap-3 mt-3">
                    {(order.products || []).filter(p => !p.isReturned).map(p => (
                        <div key={p.id} className="flex items-center justify-between gap-3">
                            <span className="text-sm">{p.productType?.name} · {p.fabrics?.name} · Qty {p.unit}</span>
                            <Select
                                allowClear
                                style={{ width: 150 }}
                                placeholder="Not returned"
                                value={returnSelections[p.id]}
                                onChange={(val) => setReturnSelections(prev => ({ ...prev, [p.id]: val }))}
                                options={[
                                    { value: 'SELLABLE', label: 'Sellable' },
                                    { value: 'DAMAGED', label: 'Damaged' },
                                ]}
                            />
                        </div>
                    ))}
                </div>
            </Modal>
        </div>
    );
}

export default Order;
