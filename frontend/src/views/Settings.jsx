import React from 'react';
import SettingsList from "../components/Settings/SettingsList.jsx";
import { Typography } from 'antd';

const { Title, Text } = Typography;

const Settings = () => {
  return (

    <div className="animate-fade-in">
      <div className="mb-8">
        <Title level={2} className="!mb-0">Settings</Title>
        <Text type="secondary">Manage your application configuration and preferences</Text>
      </div>
      <SettingsList />
    </div>


  )
};

export default Settings;
