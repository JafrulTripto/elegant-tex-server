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

  return (
    <Card
      bordered={false}
      title={<span style={{ color: token.colorTextHeading }}>Top Executives</span>}
      className="hover:shadow-lg transition-shadow duration-300 h-full"
    >
      <div style={{ height: "400px", overflowY: 'auto' }}>
        <Skeleton loading={loading} active avatar paragraph={{ rows: 4 }}>
          <List
            itemLayout="horizontal"
            dataSource={executiveStats}
            renderItem={(item, index) => (
              <List.Item
                actions={[
                  <div className="flex flex-col items-end min-w-[100px]">
                    <Text strong style={{ color: token.colorSuccess }}>
                      {parseInt(item.total_amount).toLocaleString()} ৳
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.total_orders} Orders
                    </Text>
                  </div>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    item.image_id ?
                      <Avatar src={`${process.env.REACT_APP_API_BASE_URL}/files/upload/${item.image_id}`} /> :
                      <Avatar style={{ backgroundColor: token.colorPrimary }} icon={<UserOutlined />} />
                  }
                  title={<Text strong style={{ color: token.colorTextHeading }}>{item.fullname}</Text>}
                  description={<Text type="secondary" ellipsis>{item.email}</Text>}
                />
              </List.Item>
            )}
          />
        </Skeleton>
      </div>
    </Card>
  );
}

export default TopExecutives;
