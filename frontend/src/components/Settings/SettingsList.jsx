import React from 'react';
import {Card, List} from "antd";
import {FlagOutlined, UnlockOutlined, UsergroupAddOutlined} from "@ant-design/icons";
import {colors} from "../../utils/Colors.js";
import {NavLink} from "react-router-dom";

const SettingsList = () => {

  const iconStyle = {
    fontSize: "20px",
    color: colors.primary
  }

  const data = [
    {
      title: 'Role Settings',
      icon: <UsergroupAddOutlined style={iconStyle} />,
      link: "/settings/roleSettings",
      description: "Manage the application permissions. Permissions set is a collection of settings that give users access to various functions on a page. Permission set may be granted to any number of roles."
    },
    {
      title: 'Permission Settings',
      icon: <UnlockOutlined style={iconStyle} />,
      link: "/settings/permissionSettings",
      description: "Manage the application permissions. Permissions set is a collection of settings that give users access to various functions on a page. Permission set may be granted to any number of roles."
    },
    {
      title: 'Marketplace Settings',
      icon: <FlagOutlined style={iconStyle} />,
      link: "/settings/marketplaceSettings",
      description: "Create and manage the business pages as you need. These business pages will need in order creation."
    },
    {
      title: 'Product Settings',
      icon: <FlagOutlined style={iconStyle} />,
      link: "/settings/productSettings",
      description: "Create and manage the business pages as you need. These business pages will need in order creation."
    },
  ];
  return (
    <Card title="Settings" bordered={false} className="shadow">
      <List
        grid={{ gutter: 16, column: 2 }}
        itemLayout="horizontal"
        dataSource={data}
        renderItem={(item) => (


          <List.Item>
            <List.Item.Meta
              avatar={item.icon}
              title={<NavLink to={item.link}>{item.title}</NavLink>}
              description={item.description}
            />
          </List.Item>
        )}
      />

    </Card>

  )
};

export default SettingsList;
