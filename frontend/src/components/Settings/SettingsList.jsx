import React from 'react';
import {Col, Row} from "antd";
import {FlagOutlined, UnlockOutlined, UsergroupAddOutlined} from "@ant-design/icons";
import {colors} from "../../utils/Colors.js";
import {Link} from "react-router-dom";
import Permission from "../Util/Permission";


const SettingsList = () => {

  const iconStyle = {
    fontSize: "20px",
    color: colors.primary
  }

  const data = [
    {
      title: 'Role Settings',
      icon: <UsergroupAddOutlined style={iconStyle}/>,
      link: "/settings/roleSettings",
      description: "Manage the application roles.User can have multiple roles.",
      permission: "ROLE_SETTINGS"
    },
    {
      title: 'Permission Settings',
      icon: <UnlockOutlined style={iconStyle}/>,
      link: "/settings/permissionSettings",
      description: "Manage the application permissions.",
      permission: 'PERMISSION_SETTINGS'
    },
    {
      title: 'Marketplace Settings',
      icon: <FlagOutlined style={iconStyle}/>,
      link: "/settings/marketplaceSettings",
      description: "Create and manage the business pages as you need. These business pages will need in order creation.",
      permission: "MARKETPLACE_SETTINGS"
    },
    {
      title: 'Product Settings',
      icon: <FlagOutlined style={iconStyle}/>,
      link: "/settings/productSettings",
      description: "Create and manage the business pages as you need. These business pages will need in order creation.",
      permission: "PRODUCT_SETTINGS"
    }
  ];
  return (
    <Row gutter={[16, 16]}>
      {data.map((item) => {
        return <Permission required={item.permission} key={item.title}>
          <Col xs={24} md={12} lg={12}>
            <div className="rounded overflow-hidden">
              <div className="px-6 py-4">
                <div className="flex">
                  <div className="pr-2 pt-1">{item.icon}</div>
                  <div className="font-medium text-lg mb-2"><Link to={item.link}>{item.title}</Link></div>
                </div>

                <span className="text-gray-700 text-base pl-7" style={{
                  whiteSpace: "normal",
                  overflow: "hidden !important",
                  textOverflow: 'ellipsis !important',
                  display: "inline-block"
                }}>
                  {item.description}
                </span>
              </div>
            </div>
          </Col>
        </Permission>
      })}
    </Row>


  )
};

export default SettingsList;
