import React from 'react';
import SettingsList from "../components/Settings/SettingsList.jsx";
import {Card} from "antd";

const Settings = () => {
  return (

    <div className="xl:px-10 xl:pt-12">
      <Card title="Settings">
        <SettingsList />
      </Card>
    </div>


  )
};

export default Settings;
