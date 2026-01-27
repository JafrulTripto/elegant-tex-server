import React from 'react';
import { Spin, Typography, theme } from "antd";
import { LoadingOutlined } from '@ant-design/icons';

const Loading = ({ fullScreen = false }) => {
  const { Title, Text } = Typography;
  const { token } = theme.useToken();

  const antIcon = <LoadingOutlined style={{ fontSize: 40, color: token.colorPrimary }} spin />;

  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    height: fullScreen ? "100vh" : "100%",
    minHeight: fullScreen ? "100vh" : "300px", // Ensure at least some height if parent is collapsed
    width: "100%",
    backgroundColor: "transparent"
  };

  return (
    <div style={containerStyle} className="animate-fade-in">
      <Spin indicator={antIcon} />
      <Text
        style={{
          marginTop: 16,
          fontSize: 16,
          fontWeight: 500,
          color: token.colorTextSecondary
        }}
      >
        Loading...
      </Text>
    </div>
  );
};

export default Loading;
