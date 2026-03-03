import React from 'react';
import AdminDashboard from "../components/Dashboard/AdminDashboard";
import { useStateContext } from "../contexts/ContextProvider";
import UserDashboard from "../components/Dashboard/UserDashboard";

const Dashboard = () => {
  const { permissions } = useStateContext();
  const adminDashboardPermission = () => {
    return permissions.includes('ADMIN_DASHBOARD');
  }

  return (adminDashboardPermission() ? <AdminDashboard /> : <UserDashboard />);
};

export default Dashboard;
