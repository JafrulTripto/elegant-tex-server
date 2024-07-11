import React from 'react';
import {Empty, Tag, Timeline} from 'antd';
import {ClockCircleOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import {OrderStatusEnum} from "../../utils/enums/OrderStatusEnum";
import { Typography } from 'antd';

const OrderTimeline = ({statuses}) => {
    const { Text } = Typography;
    const getStatusDetails = (statusId) => {
        const status = OrderStatusEnum.find(status => status.value === statusId);
        if (status) {
            return {
                label: status.label,
                color: status.color
            };
        }
        return null;
    };
    const renderStatus = (user, comment, timestamp) => {
        return (
            <div>
                <div>{comment}</div>
                <div>{dayjs(timestamp).format('MMMM Do YYYY, h:mm a')}</div>
                <Text strong italic>({user.firstname})</Text>
            </div>
        );
    }

    if (statuses.length === 0) {
        return <Empty/>;
    }

    const timelineItems = statuses.map((statusChangeItem) => {
        const { user, comment, created_at,status } = statusChangeItem;
        const timestamp = new Date(created_at).getTime();
        const {label, color} = getStatusDetails(status);

        return {
            label:<Tag color={color}>{label}</Tag>,
            dot: (
                <ClockCircleOutlined
                    style={{
                        fontSize: '16px',
                        color: color,
                    }}
                />
            ),
            color: 'red',
            children: renderStatus(user, comment, timestamp),
        };
    });

    const sortedTimelineItems = timelineItems.sort(
        (a, b) => a.createdAt - b.createdAt
    );
    // TODO: Show (No status change record found) if there is no data.
    return (
        <Timeline mode="alternate" items={sortedTimelineItems} />
    );
};

export default OrderTimeline;
