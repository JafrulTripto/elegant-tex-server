import React from 'react';
import SettingsList from "../components/Settings/SettingsList.jsx";

const Settings = () => {
  return (

    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your application configuration and preferences</p>
      </div>
      <SettingsList />
    </div>


  )
};

export default Settings;
