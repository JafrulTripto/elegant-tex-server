import React from 'react';
import {Tag, Timeline} from 'antd';
import {ClockCircleOutlined} from "@ant-design/icons";
import dayjs from "dayjs";

const OrderTimeline = ({statuses}) => {

    const renderStatus = (text, comment, color, timestamp) => {
        return (
            <div>
                <div style={{color}}>{text}</div>
                <div>{dayjs(timestamp).format('MMMM Do YYYY, h:mm a')}</div>
                <div>{comment? comment : "Status changed"}</div>
            </div>
        );
    }

    const timelineItems = statuses.map((status) => {
        const { color, text, comment, pivot } = status;
        const timestamp = new Date(pivot.created_at).getTime();

        return {
            dot: (
                <ClockCircleOutlined
                    style={{
                        fontSize: '16px',
                        color: color,
                    }}
                />
            ),
            color: color,
            children: renderStatus(text, comment, color, timestamp),
        };
    });

    const sortedTimelineItems = timelineItems.sort(
        (a, b) => a.createdAt - b.createdAt
    );

    return (
        <Timeline mode="alternate" items={sortedTimelineItems} />
    );
};

export default OrderTimeline;
