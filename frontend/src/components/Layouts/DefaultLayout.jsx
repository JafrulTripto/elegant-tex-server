import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useStateContext } from "../../contexts/ContextProvider.jsx";
import { Layout, Menu, Modal, theme, Avatar, Dropdown, Button, Switch, Typography } from "antd";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DashboardOutlined,
    ShoppingOutlined,
    UserOutlined,
    SettingOutlined,
    ShopOutlined,
    LogoutOutlined,
    BulbOutlined,
    BulbFilled
} from '@ant-design/icons';
import useAxiosClient from "../../axios-client.js";
import Loading from "../Util/Loading.jsx";
import { toast } from "react-toastify";
import BreadCrumb from "../BreadCrumb";

const { Header, Sider, Content, Footer } = Layout;

const DefaultLayout = () => {

    const axiosClient = useAxiosClient();
    const navigate = useNavigate();
    const location = useLocation();

    // Get current route key for highlighting
    const currentKey = location.pathname.split('/')[1] || 'dashboard';

    const [collapsed, setCollapsed] = useState(false);

    // Use token from theme if needed, but we rely on global CSS mostly
    const {
        token: { colorBgContainer, borderRadiusLG, colorPrimary },
    } = theme.useToken();

    const { user, token, setUser, setPermissions, setRoles, setToken, permissions, darkMode, setDarkMode } = useStateContext();
    const tokenRef = useRef(token);

    useEffect(() => {
        tokenRef.current = token;
    }, [token]);

    const fetchUser = useCallback(() => {
        axiosClient.post('auth/me').then(({ data }) => {
            setUser(data.user);
            setPermissions(data.permissions);
            setRoles(data.roles);
        }).catch(error => {
            tokenRef.current = null;
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            toast.error(message);
        })
    }, [axiosClient, setRoles, setPermissions, setUser])

    useEffect(() => {
        if (tokenRef.current) {
            fetchUser();
        }
    }, [fetchUser, tokenRef]);

    if (!token) {
        return <Navigate to="/login" />
    }

    const handleLogout = () => {
        Modal.confirm({
            title: 'Sign Out',
            content: 'Are you sure you want to log out?',
            okText: "Logout",
            okType: "danger",
            cancelText: "Cancel",
            onOk: () => confirmLogout()
        })
    }

    const confirmLogout = async () => {
        try {
            const response = await axiosClient.post(`/auth/logout`);
            toast.success(response.data.message);
            setUser(null)
            setToken(null);
        } catch (error) {
            setToken(null);
            setUser(null);
            console.error(error);
        }
    }

    const menuItems = [
        {
            key: 'dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
            permission: ''
        },
        {
            key: 'merchants',
            icon: <ShopOutlined />,
            label: 'Merchants',
            permission: 'VIEW_MERCHANTS'
        },
        {
            key: 'orders',
            icon: <ShoppingOutlined />,
            label: 'Orders',
            permission: 'VIEW_ORDERS'
        },
        {
            key: 'users',
            icon: <UserOutlined />,
            label: 'Users',
            permission: 'VIEW_USERS'
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Settings',
            permission: 'VIEW_SETTINGS'
        }
    ];

    const permittedMenuItems = menuItems.filter(item => {
        // Optimization: If permission is empty string, always show.
        // Otherwise check if permission exists in permission array.
        if (!item.permission) return true;
        return permissions.includes(item.permission);
    });

    // Profile Dropdown Menu
    const userMenu = (
        <Menu items={[
            {
                key: 'profile',
                label: 'Profile',
                icon: <UserOutlined />,
                onClick: () => navigate('/profile') // Assumes /profile route exists
            },
            {
                type: 'divider',
            },
            {
                key: 'logout',
                label: 'Logout',
                icon: <LogoutOutlined />,
                danger: true,
                onClick: handleLogout
            },
        ]} />
    );


    return (
        <Layout className="h-screen overflow-hidden">
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                breakpoint="lg"
                onBreakpoint={(broken) => {
                    setCollapsed(broken);
                }}
                className="shadow-xl z-20"
                width={260}
                style={{
                    height: '100vh',
                    overflowY: 'auto'
                }}
            >
                <div
                    className="h-16 flex items-center justify-center m-2 bg-slate-800/50 rounded-lg cursor-pointer transition-colors hover:bg-slate-800/70"
                    onClick={() => navigate('/')}
                >
                    <div className={`transition-all duration-300 flex items-center justify-center gap-2 ${collapsed ? 'scale-0 w-0 opacity-0 overflow-hidden' : 'scale-100 opacity-100'}`}>
                        <img src="/eleganttexlogo.png" alt="Elegant Tex" style={{ height: '42px', width: 'auto' }} />
                        <span className="text-white font-bold text-xl whitespace-nowrap tracking-wide">Elegant Tex</span>
                    </div>
                    {collapsed && <span className="text-white font-bold text-xl">ET</span>}
                </div>

                <Menu
                    mode="inline"
                    selectedKeys={[currentKey]}
                    items={permittedMenuItems}
                    onClick={(item) => navigate("/" + item.key)}
                    className="border-none px-2"
                />
            </Sider>

            <Layout className="h-full overflow-hidden relative flex flex-col">
                <Header
                    className="glass-header sticky top-0 z-10 flex items-center justify-between px-6 p-0"
                    style={{ height: 64 }}
                >
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            width: 48,
                            height: 48,
                        }}
                    />

                    <div className="flex items-center gap-4">
                        <Switch
                            checked={darkMode}
                            onChange={() => setDarkMode(!darkMode)}
                            checkedChildren={<BulbFilled />}
                            unCheckedChildren={<BulbOutlined />}
                        />

                        {user && (
                            <Dropdown overlay={userMenu} placement="bottomRight" arrow>
                                <div className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                    <Avatar
                                        style={{ backgroundColor: colorPrimary }}
                                        icon={<UserOutlined />}
                                    >
                                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                    </Avatar>
                                    <div className="hidden md:block leading-tight">
                                        <div className="font-semibold text-slate-700">{user.name}</div>
                                        <div className="text-xs text-slate-500">{user.email}</div>
                                    </div>
                                </div>
                            </Dropdown>
                        )}
                    </div>
                </Header>

                <Content className="p-2 flex-1 flex flex-col shadow-inner overflow-y-auto">
                    <BreadCrumb />
                    <div
                        className="mt-4 flex-1"
                        style={{
                            background: 'transparent',
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        {user && Object.keys(user).length !== 0 ? <Outlet /> : <Loading layout='default' />}
                    </div>
                </Content>

                <Footer className="text-center bg-transparent p-1">
                    <Typography.Text type="secondary">
                        Elegant Tex Server ©{new Date().getFullYear()} Created by Tripzin.inc
                    </Typography.Text>
                </Footer>
            </Layout>
        </Layout>
    );
};

export default DefaultLayout;
