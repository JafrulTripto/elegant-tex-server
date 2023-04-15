import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Navigate, Outlet, useNavigate, useLocation} from "react-router-dom";
import {useStateContext} from "../../contexts/ContextProvider.jsx";
import {Layout, Menu, Modal, theme} from "antd";
import {
    MenuFoldOutlined, MenuUnfoldOutlined, DashboardFilled, ShoppingFilled, UserOutlined, SettingFilled, ShopOutlined,
} from '@ant-design/icons';
import useAxiosClient from "../../axios-client.js";
import Loading from "../Util/Loading.jsx";
import {toast} from "react-toastify";
import {ElegantTexIcon} from "../../utils/icons/ElegantTexIcon";
import NavigationDropdown from "../NavigationDropdown";
import BreadCrumb from "../BreadCrumb";
import {colors} from "../../utils/Colors";


const {Header, Sider, Content} = Layout;

const DefaultLayout = () => {

    const axiosClient = useAxiosClient();
    const navigate = useNavigate();
    const location = useLocation();
    const route = location.pathname.split('/');

    const [collapsed, setCollapsed] = useState(false);
    const [navbarWidth, setNavbarWidth] = useState("");

    const {
        token: {colorBgContainer},
    } = theme.useToken();

    const routes = [
        {
            key: 'dashboard',
            icon: <DashboardFilled style={{color: colors.secondary, fontSize: "22px"}}/>,
            label: 'Dashboard',
            permission: ''
        },
        {
            key: 'merchants',
            icon: <ShopOutlined style={{color: colors.secondary, fontSize: "22px"}}/>,
            label: 'Merchants',
            permission: 'VIEW_MERCHANTS'
        },
        {
            key: 'orders',
            icon: <ShoppingFilled style={{color: colors.secondary, fontSize: "22px"}}/>,
            label: 'Orders',
            permission: 'VIEW_ORDERS'
        },
        {
            key: 'users',
            icon: <UserOutlined style={{color: colors.secondary, fontSize: "22px"}}/>,
            label: 'Users',
            permission: 'VIEW_USERS'
        },
        {
            key: 'settings',
            icon: <SettingFilled style={{color: colors.secondary, fontSize: "22px"}}/>,
            label: 'Settings',
            permission: 'VIEW_SETTINGS'
        }
    ];



    const {user, token, setUser, setPermissions, setRoles, setToken, permissions} = useStateContext();
    const tokenRef = useRef(token);

    useEffect(() => {
        tokenRef.current = token;
    }, [token]);

    const fetchUser = useCallback(() => {
        axiosClient.post('auth/me').then(({data}) => {
            setUser(data.user);
            setPermissions(data.permissions);
            setRoles(data.roles);
        }).catch(error => {
            tokenRef.current = null; // update tokenRef.current without causing re-render
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            toast.error(message);
        })
    }, [axiosClient, setRoles, setPermissions, setUser])

    useEffect(() => {
        if (collapsed) {
            setNavbarWidth("calc(100% - 82px)")
        } else {
            setNavbarWidth("calc(100% - 250px)")
        }
        if (tokenRef.current) {
            fetchUser();
        }
    }, [collapsed, fetchUser, tokenRef]);

    if (!token) {
        return <Navigate to="/login"/>
    }


    const sidebarCollapseToggle = () => {
        setCollapsed(!collapsed)
        if (collapsed) {
            setNavbarWidth("calc(100% - 250px)");
        } else {
            setNavbarWidth("calc(100% - 82px)");
        }
    }
    const onBreakpointHandler = (broken) => {
        if (broken) {
            setNavbarWidth("calc(100% - 82px)");
        }
        setCollapsed(broken)
    }


    const handleLogout = (e) => {
        e.preventDefault();
        Modal.confirm({
            title: 'Do you want to logout?',
            okText: "Yes",
            okType: "primary",
            okButtonProps: {danger: true},
            onOk: () => confirmLogout()
        })
    }
    const confirmLogout = async () => {

        try {
            const response = await axiosClient.post(`/auth/logout`);
            toast.success(response.data.message);
            setUser(null)
            setToken(null);
        }  catch(error){
            setToken(null);
            setUser(null);
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            toast.error(message);
        }

    }
    const generatePermittedRoutes = () => {
        return routes.filter(route => {
            if (route.permission === '') return route;
            return permissions.indexOf(route.permission) > -1;
        })

    }


    return (<Layout style={{minHeight: "100vh"}}>
        <Sider
            style={{
                overflow: "auto", height: "100vh", position: "sticky", top: 0, left: 0
            }}
            trigger={null}
            collapsible
            breakpoint={'sm'}
            width={250}
            collapsedWidth={70}
            onBreakpoint={onBreakpointHandler}
            collapsed={collapsed}>
            <div style={{padding: "5px", display: "flex"}}>
                <ElegantTexIcon/>
            </div>
            <Menu
                theme="dark"
                mode="inline"
                defaultSelectedKeys={route[1] === '' ? 'dashboard' : route[1]}
                items={generatePermittedRoutes()}
                onClick={(item) => navigate("/" + item.key)}
            />
        </Sider>
        <Layout className="site-layout">
            <Header
                style={{
                    position: 'fixed',
                    zIndex: 1000,
                    width: navbarWidth,
                    padding: "0 20px",
                    background: colorBgContainer,
                    transition: "350ms"
                }}>
                <div className="flex justify-between">
                    <div>
                        {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                            className: 'trigger', onClick: sidebarCollapseToggle,
                        })}
                    </div>
                    {user && Object.keys(user).length !== 0 ?
                        <NavigationDropdown user={user} handleLogout={handleLogout}/> : null}
                </div>
            </Header>
            <BreadCrumb/>
            <Content
                className="sm:px-1 md:px-5 lg:px-5 mx-2 py-5"
                style={{
                    minHeight: 280, background: "#f5f5f5",
                }}>
                {user && Object.keys(user).length !== 0 ? <Outlet/> : <Loading layout='default'/>}
            </Content>
        </Layout>
    </Layout>);
};

export default DefaultLayout;


