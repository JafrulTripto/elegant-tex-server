import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Col,
  Row,
  Tag,
  Descriptions,
  Tabs,
  theme,
  Skeleton,
  Space,
  Typography
} from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined, SafetyCertificateOutlined, LockOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import useAxiosClient from "../axios-client";
import { useStateContext } from "../contexts/ContextProvider";

const { Title, Text } = Typography;

const UserProfile = () => {
  const { state } = useLocation();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false)
  const [fetchedUser, setFetchedUser] = useState(null)
  const axiosClient = useAxiosClient();
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const { user } = useStateContext(); // Get logged-in user

  useEffect(() => {
    const getUserData = async () => {
      try {
        setIsLoading(true);

        let userId = state?.id;

        // If no ID passed but we are on /profile, use logged-in user's ID
        if (!userId && location.pathname === '/profile' && user?.id) {
          userId = user.id;
        }

        // Fallback if still no ID
        if (!userId) {
          // Verify we aren't waiting for user context to load
          if (location.pathname === '/profile' && !user) {
            // Keep loading if user context is fetching
            return;
          }
          navigate('/users');
          return;
        }

        const response = await axiosClient.get(`/users/user/${userId}`);
        // API returns data wrapped in data object based on typical Laravel resource response
        setFetchedUser(response.data.data ? response.data.data : response.data)
        setIsLoading(false);
      } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        // Don't show error if we are just waiting for auth
        if (location.pathname !== '/profile') {
          toast.error(message);
        }
        setIsLoading(false);
      }
    }

    if (user || state?.id) {
      getUserData();
    }
  }, [state, axiosClient, navigate, location.pathname, user])

  const resetUserPassword = () => {
    if (fetchedUser) {
      navigate('/resetPassword', { state: { email: fetchedUser.email } });
    }
  }

  const renderProfileCard = () => {
    if (!fetchedUser) return null;

    const imagePath = fetchedUser.image ? `${process.env.REACT_APP_API_BASE_URL}/files/upload/${fetchedUser.image.id}` : null;

    return (
      <Card bordered={false} className="shadow-sm h-full" bodyStyle={{ textAlign: 'center', padding: '32px' }}>
        <div className="flex flex-col items-center">
          {imagePath ? (
            <Avatar
              size={120}
              src={imagePath}
              className="mb-4 shadow-md border-4"
              style={{ borderColor: token.colorBgContainer }}
            />
          ) : (
            <Avatar
              size={120}
              icon={<UserOutlined />}
              className="mb-4"
              style={{ backgroundColor: token.colorPrimaryBg, color: token.colorPrimary }}
            />
          )}

          <Title level={3} style={{ margin: 0 }}>{fetchedUser.firstName} {fetchedUser.lastName}</Title>
          <Text type="secondary" className="mb-4">{fetchedUser.email}</Text>

          <div className="mb-6">
            {fetchedUser.roles && fetchedUser.roles.length > 0 ? (
              fetchedUser.roles.map((role, index) => (
                <Tag key={index} color="blue" className="px-3 py-1 text-sm font-semibold rounded-full">{role.toUpperCase()}</Tag>
              ))
            ) : (
              <Tag color="default">USER</Tag>
            )}
          </div>

          <Space direction="vertical" style={{ width: '100%' }}>
            <Button block icon={<MailOutlined />} href={`mailto:${fetchedUser.email}`}>
              Send Email
            </Button>
          </Space>
        </div>
      </Card>
    );
  }

  const renderOverviewTab = () => {
    if (!fetchedUser) return null;
    return (
      <Descriptions bordered column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}>
        <Descriptions.Item label={<span className="font-semibold"><UserOutlined /> Full Name</span>}>
          {fetchedUser.firstName} {fetchedUser.lastName}
        </Descriptions.Item>
        <Descriptions.Item label={<span className="font-semibold"><MailOutlined /> Email</span>}>
          {fetchedUser.email}
        </Descriptions.Item>
        <Descriptions.Item label={<span className="font-semibold"><PhoneOutlined /> Phone</span>}>
          {fetchedUser?.address?.phone || <Text type="secondary">N/A</Text>}
        </Descriptions.Item>
        <Descriptions.Item label={<span className="font-semibold"><HomeOutlined /> Address</span>}>
          {fetchedUser?.address ? (
            <div>
              <div>{fetchedUser.address.address}</div>
              <div className="text-gray-500 text-sm">
                {fetchedUser.address.upazila?.name}, {fetchedUser.address.district?.name}
              </div>
            </div>
          ) : <Text type="secondary">N/A</Text>}
        </Descriptions.Item>
      </Descriptions>
    );
  }

  const renderSecurityTab = () => {
    return (
      <div className="p-4">
        <Title level={5}>Security Settings</Title>
        <div className="flex justify-between items-center border-b pb-4 mb-4" style={{ borderColor: token.colorSplit }}>
          <div>
            <div className="font-semibold">Password</div>
            <div className="text-gray-500 text-sm">Reset user password to default or send reset link</div>
          </div>
          <Button type="primary" danger ghost onClick={resetUserPassword} icon={<LockOutlined />}>
            Reset Password
          </Button>
        </div>
      </div>
    );
  }

  const tabItems = [
    {
      key: '1',
      label: <span><UserOutlined />Overview</span>,
      children: renderOverviewTab(),
    },
    {
      key: '2',
      label: <span><SafetyCertificateOutlined />Security</span>,
      children: renderSecurityTab(),
    }
  ];

  if (isLoading) {
    return (
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}><Skeleton active className="p-5 bg-white rounded-lg" /></Col>
        <Col xs={24} md={16}><Skeleton active className="p-5 bg-white rounded-lg" paragraph={{ rows: 6 }} /></Col>
      </Row>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <Title level={4} style={{ margin: 0 }}>User Profile</Title>
        <Text type="secondary">Manage user details and permissions</Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8} lg={7} xl={6}>
          {renderProfileCard()}
        </Col>
        <Col xs={24} md={16} lg={17} xl={18}>
          <Card bordered={false} className="shadow-sm h-full">
            <Tabs defaultActiveKey="1" items={tabItems} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UserProfile;
