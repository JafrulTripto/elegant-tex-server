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

  // Progress bar is always relative to monthly top performer
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
              const monthlyAmount = parseInt(item.total_amount) || 0;
              const yearlyAmount = parseInt(item.yearly_amount) || 0;
              const percent = (monthlyAmount / maxAmount) * 100;

              return (
                <List.Item
                  className="mb-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-default"
                  style={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}
                  actions={[
                    <div className="flex items-center gap-3">
                      {/* Monthly */}
                      <div className="flex flex-col items-end gap-1">
                        <Text type="secondary" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Monthly</Text>
                        <Text strong style={{ color: token.colorTextHeading, fontSize: '14px' }}>
                          {monthlyAmount.toLocaleString()} ৳
                        </Text>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden" style={{ minWidth: '70px' }}>
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${percent}%`,
                              backgroundColor: index === 0 ? '#fbbf24' : token.colorPrimary
                            }}
                          />
                        </div>
                        <Text type="secondary" style={{ fontSize: 10 }}>{item.total_orders} orders</Text>
                      </div>

                      {/* Divider */}
                      <div style={{ width: 1, height: 48, backgroundColor: token.colorBorderSecondary }} />

                      {/* Yearly */}
                      <div className="flex flex-col items-end gap-1">
                        <Text type="secondary" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Yearly</Text>
                        <Text strong style={{ color: token.colorTextHeading, fontSize: '14px' }}>
                          {yearlyAmount.toLocaleString()} ৳
                        </Text>
                        <div style={{ height: '6px' }} />
                        <Text type="secondary" style={{ fontSize: 10 }}>{item.yearly_orders} orders</Text>
                      </div>
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
