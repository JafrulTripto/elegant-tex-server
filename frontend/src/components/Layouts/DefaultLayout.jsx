import React, {useEffect, useState} from 'react';
import {Navigate, NavLink, Outlet, useNavigate} from "react-router-dom";
import {useStateContext} from "../../contexts/ContextProvider.jsx";
import {Button, Col, Layout, Menu, Modal, Row, theme} from "antd";
import {
  MenuFoldOutlined, MenuUnfoldOutlined, DashboardFilled, ShoppingFilled, UserOutlined, SettingFilled,
} from '@ant-design/icons';
import axiosClient from "../../axios-client.js";
import Loading from "../Util/Loading.jsx";
import {toast} from "react-toastify";


const {Header, Sider, Content} = Layout;

const DefaultLayout = () => {

  const [collapsed, setCollapsed] = useState(false);
  const [navbarWidth, setNavbarWidth] = useState("");
  const [navbarLeft, setNavbarLeft] = useState("");
  const {
    token: {colorBgContainer},
  } = theme.useToken();

  const routes = [{
    key: 'dashboard', icon: <DashboardFilled/>, label: 'Dashboard',
  }, {
    key: 'orders', icon: <ShoppingFilled/>, label: 'Orders',
  }, {
    key: 'users', icon: <UserOutlined/>, label: 'Users',
  }, {
    key: 'settings', icon: <SettingFilled/>, label: 'Settings',
  },];

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true)

  const {user, token, setUser, setPermissions, setRoles, setToken} = useStateContext();

  useEffect(() => {
    if (collapsed) {
      setNavbarWidth("calc(100% - 82px)")
      setNavbarLeft("82px")
    } else {
      setNavbarWidth("calc(100% - 250px)")
      setNavbarLeft("250px")
    }
    if (token) {
      axiosClient.get('/user').then(({data}) => {
        setUser(data.user);
        setPermissions(data.permissions);
        setRoles(data.roles);
      }).catch(error => {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        toast.error(message);
      })
    }
  }, [])

  if (!token) {
    return <Navigate to="/login"/>
  }




  const sidebarCollapseToggle = () => {
    setCollapsed(!collapsed)
    if (collapsed) {
      setNavbarWidth("calc(100% - 250px)");
      setNavbarLeft("250px")
    } else {
      setNavbarWidth("calc(100% - 82px)");
      setNavbarLeft("82px")
    }
  }
  const onBreakpointHandler = (broken) => {
    if (broken) {
      setNavbarWidth("calc(100% - 82px)");
      setNavbarLeft("82px")
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
  const confirmLogout = () => {

    axiosClient.post(`/auth/logout`).then(res => {
      toast.success(response.data.message);
      setUser(null)
      setToken(null);
    }).catch(error => {
      setToken(null);
      setUser(null);
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      toast.error(message);

    })

    //navigate("/login");
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
        onBreakpoint={onBreakpointHandler}
        collapsed={collapsed}>
        <div className="logo"/>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          items={routes}
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
          <div style={{display: "flex", justifyContent: "space-between"}}>
            <div>
              {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                className: 'trigger', onClick: sidebarCollapseToggle,
              })}
            </div>
            <Row gutter={[16, 0]}>
              <Col>{user.name}</Col>
              <Col><Button type="link" onClick={handleLogout}>Logout</Button></Col>
            </Row>


          </div>


        </Header>
        <Content
          style={{
            margin: '80px 16px 16px 16px', padding: 24, minHeight: 280, background: "#f5f5f5",
          }}
        >

          {user && Object.keys(user).length !== 0 ? <Outlet/> : <Loading/>}
        </Content>
      </Layout>
    </Layout>);
};

export default DefaultLayout;


