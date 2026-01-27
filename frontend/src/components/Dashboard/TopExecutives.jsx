import React, { useEffect, useState } from 'react';
import { Avatar, List, Card, theme, Skeleton, Typography } from "antd";
import useAxiosClient from "../../axios-client";
import { UserOutlined } from "@ant-design/icons";

const { Text } = Typography;

const TopExecutives = (props) => {
  const axiosClient = useAxiosClient();
  const [executiveStats, setExecutiveStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = theme.useToken();

  useEffect(() => {
    setLoading(true);
    axiosClient.get(`dashboard/getMonthlyOrdersPerUser`).then((response) => {
      setExecutiveStats(response.data);
      setLoading(false);
    }).catch((error) => {
      console.error('Error fetching data:', error);
      setLoading(false);
    });
  }, []);

  // Find maximum amount for progress bar calculation
  const maxAmount = Math.max(...executiveStats.map(item => parseInt(item.total_amount) || 0), 1);

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return <span style={{ fontSize: '24px', lineHeight: 1 }}>🥇</span>;
      case 1: return <span style={{ fontSize: '24px', lineHeight: 1 }}>🥈</span>;
      case 2: return <span style={{ fontSize: '24px', lineHeight: 1 }}>🥉</span>;
      default: return <span style={{ color: token.colorTextQuaternary, fontWeight: 'bold', minWidth: '24px', textAlign: 'center' }}>#{index + 1}</span>;
    }
  };

  return (
    <Card
      bordered={false}
      title={<span style={{ color: token.colorTextHeading }}>Top Executives</span>}
      className="hover:shadow-lg transition-shadow duration-300 h-full"
      bodyStyle={{ padding: '0 24px 24px 24px' }}
    >
      <div style={{ height: "400px", overflowY: 'auto', paddingRight: '8px' }} className="custom-scroll">
        <Skeleton loading={loading} active avatar paragraph={{ rows: 4 }}>
          <List
            itemLayout="horizontal"
            dataSource={executiveStats}
            split={false}
            renderItem={(item, index) => {
              const amount = parseInt(item.total_amount) || 0;
              const percent = (amount / maxAmount) * 100;

              return (
                <List.Item
                  className="mb-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-default"
                  style={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}
                  actions={[
                    <div className="flex flex-col items-end min-w-[120px] gap-1">
                      <Text strong style={{ color: token.colorTextHeading, fontSize: '15px' }}>
                        {amount.toLocaleString()} ৳
                      </Text>

                      {/* Visual Progress Bar relative to Top Performer */}
                      <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: index === 0 ? '#fbbf24' : token.colorPrimary
                          }}
                        />
                      </div>

                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {item.total_orders} Orders
                      </Text>
                    </div>
                  ]}
                >
                  <div className="flex items-center gap-4 w-full">
                    {/* Rank Badge */}
                    <div className="flex-shrink-0 w-8 flex justify-center">
                      {getRankIcon(index)}
                    </div>

                    {/* Avatar & User Info */}
                    <List.Item.Meta
                      avatar={
                        item.image_id ?
                          <Avatar size={40} src={`${process.env.REACT_APP_API_BASE_URL}/files/upload/${item.image_id}`} className="border border-slate-200 dark:border-slate-700" /> :
                          <Avatar size={40} style={{ backgroundColor: token.colorPrimary }} icon={<UserOutlined />} />
                      }
                      title={<Text strong style={{ color: token.colorTextHeading, fontSize: '14px' }}>{item.fullname}</Text>}
                      description={<Text type="secondary" style={{ fontSize: '12px' }} ellipsis>{item.email}</Text>}
                      style={{ margin: 0 }}
                    />
                  </div>
                </List.Item>
              )
            }}
          />
        </Skeleton>
      </div>
    </Card>
  );
}

export default TopExecutives;
