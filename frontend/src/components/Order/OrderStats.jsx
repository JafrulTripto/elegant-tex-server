import React from 'react';
import { Card, Col, Row, Statistic } from 'antd';
import { ShoppingOutlined, ClockCircleOutlined, SyncOutlined, CheckCircleOutlined } from '@ant-design/icons';
import CountUp from 'react-countup';

const formatter = (value) => <CountUp end={value} separator="," />;

const OrderStats = ({ total = 0, pending = 0, processing = 0, delivered = 0 }) => {
    return (
        <Row gutter={[16, 16]} className="mb-6">
            <Col xs={12} sm={6} md={6}>
                <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow duration-300 dark:bg-slate-800">
                    <Statistic
                        title={<span className="text-slate-500 dark:text-slate-400 font-medium">Total Orders</span>}
                        value={total}
                        formatter={formatter}
                        prefix={<ShoppingOutlined className="text-blue-500 mr-2" />}
                        valueStyle={{ fontWeight: 600 }}
                        className="text-slate-700 dark:text-slate-200"
                    />
                </Card>
            </Col>
            <Col xs={12} sm={6} md={6}>
                <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow duration-300 dark:bg-slate-800">
                    <Statistic
                        title={<span className="text-slate-500 dark:text-slate-400 font-medium">Pending</span>}
                        value={pending}
                        formatter={formatter}
                        prefix={<ClockCircleOutlined className="text-orange-500 mr-2" />}
                        valueStyle={{ fontWeight: 600 }}
                        className="text-slate-700 dark:text-slate-200"
                    />
                </Card>
            </Col>
            <Col xs={12} sm={6} md={6}>
                <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow duration-300 dark:bg-slate-800">
                    <Statistic
                        title={<span className="text-slate-500 dark:text-slate-400 font-medium">Processing</span>}
                        value={processing}
                        formatter={formatter}
                        prefix={<SyncOutlined spin className="text-blue-400 mr-2" />}
                        valueStyle={{ fontWeight: 600 }}
                        className="text-slate-700 dark:text-slate-200"
                    />
                </Card>
            </Col>
            <Col xs={12} sm={6} md={6}>
                <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow duration-300 dark:bg-slate-800">
                    <Statistic
                        title={<span className="text-slate-500 dark:text-slate-400 font-medium">Delivered</span>}
                        value={delivered}
                        formatter={formatter}
                        prefix={<CheckCircleOutlined className="text-green-500 mr-2" />}
                        valueStyle={{ fontWeight: 600, color: 'var(--ant-color-text)' }}
                    />
                </Card>
            </Col>
        </Row>
    );
};

export default OrderStats;
