import React from 'react';
import {Tag, Timeline} from 'antd';
import {ClockCircleOutlined} from "@ant-design/icons";
import dayjs from "dayjs";

const OrderTimeline = ({statuses}) => {
    const renderStatus = (user, comment, timestamp) => {
        return (
            <div>
                <div>{comment}</div>
                <div>{dayjs(timestamp).format('MMMM Do YYYY, h:mm a')}</div>
                <div>({user.firstname})</div>
            </div>
        );
    }

    const timelineItems = statuses.map((statusChangeItem) => {
        const { user, comment, created_at } = statusChangeItem;
        const timestamp = new Date(created_at).getTime();

        return {
            dot: (
                <ClockCircleOutlined
                    style={{
                        fontSize: '16px',
                        color: 'red',
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
