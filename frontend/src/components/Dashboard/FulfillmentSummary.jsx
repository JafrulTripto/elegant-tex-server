import React, { useEffect, useState } from 'react';
import { Card, theme, Skeleton } from "antd";
import useAxiosClient from "../../axios-client";
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    RollbackOutlined,
} from "@ant-design/icons";

const FulfillmentSummary = ({ userId } = {}) => {
    const axiosClient = useAxiosClient();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { token } = theme.useToken();

    useEffect(() => {
        setLoading(true);
        const url = userId
            ? `dashboard/getUserFulfillmentStats?id=${userId}`
            : 'dashboard/getMonthlyFulfillmentStats';
        axiosClient.get(url).then((response) => {
            setStats(response.data);
            setLoading(false);
        }).catch((error) => {
            console.error('Error fetching fulfillment stats:', error);
            setLoading(false);
        });
    }, []);

    const promised = stats?.promised ?? 0;
    const delivered = stats?.delivered ?? 0;
    const cancelled = stats?.cancelled ?? 0;
    const returned = stats?.returned ?? 0;

    // Delivery rate: delivered out of promised
    const deliveryRate = promised > 0 ? Math.round((delivered / promised) * 100) : 0;
    const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });

    const tiles = [
        {
            key: 'promised',
            label: 'Promised to Deliver',
            value: promised,
            icon: <ClockCircleOutlined style={{ fontSize: 22 }} />,
            color: token.colorInfo,
            bg: 'rgba(6, 182, 212, 0.12)',
            sub: `Scheduled for ${currentMonth}`,
        },
        {
            key: 'delivered',
            label: 'Delivered',
            value: delivered,
            icon: <CheckCircleOutlined style={{ fontSize: 22 }} />,
            color: token.colorSuccess,
            bg: 'rgba(16, 185, 129, 0.12)',
            sub: `${deliveryRate}% delivery rate`,
        },
        {
            key: 'cancelled',
            label: 'Cancelled',
            value: cancelled,
            icon: <CloseCircleOutlined style={{ fontSize: 22 }} />,
            color: token.colorError,
            bg: 'rgba(239, 68, 68, 0.12)',
            sub: `Status changed in ${currentMonth}`,
        },
        {
            key: 'returned',
            label: 'Returned',
            value: returned,
            icon: <RollbackOutlined style={{ fontSize: 22 }} />,
            color: token.colorWarning,
            bg: 'rgba(245, 158, 11, 0.12)',
            sub: `Status changed in ${currentMonth}`,
        },
    ];

    return (
        <Card
            bordered={false}
            className="hover:shadow-lg transition-shadow duration-300 h-full"
            title={<span style={{ color: token.colorTextHeading }}>Order Fulfillment — {currentMonth}</span>}
        >
            <Skeleton loading={loading} active paragraph={{ rows: 3 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {tiles.map((tile) => (
                        <div
                            key={tile.key}
                            style={{
                                borderRadius: token.borderRadiusLG,
                                padding: '16px 20px',
                                background: token.colorBgLayout,
                                border: `1px solid ${token.colorBorderSecondary}`,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 10,
                            }}
                        >
                            {/* Icon + Label row */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 10,
                                    background: tile.bg,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: tile.color,
                                    flexShrink: 0,
                                }}>
                                    {tile.icon}
                                </div>
                                <span style={{ fontSize: 13, color: token.colorTextSecondary, fontWeight: 500 }}>
                                    {tile.label}
                                </span>
                            </div>

                            {/* Count */}
                            <div style={{ fontSize: 36, fontWeight: 700, lineHeight: 1, color: token.colorTextHeading }}>
                                {tile.value.toLocaleString()}
                            </div>

                            {/* Progress bar (relative to promised) */}
                            <div>
                                <div style={{
                                    height: 4,
                                    borderRadius: 4,
                                    background: token.colorFillSecondary,
                                    overflow: 'hidden',
                                }}>
                                    <div style={{
                                        height: '100%',
                                        borderRadius: 4,
                                        background: tile.color,
                                        width: `${promised > 0 ? Math.min((tile.value / promised) * 100, 100) : 0}%`,
                                        transition: 'width 0.6s ease',
                                    }} />
                                </div>
                                <span style={{ fontSize: 11, color: token.colorTextDescription, marginTop: 4, display: 'block' }}>
                                    {tile.sub}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </Skeleton>
        </Card>
    );
};

export default FulfillmentSummary;
