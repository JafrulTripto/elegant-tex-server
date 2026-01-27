import React from 'react';
import { Col, Row, theme, Typography } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import Permission from "../Util/Permission";
import { faLockOpen, faMoneyBillTrendUp, faSliders, faUserTag } from "@fortawesome/free-solid-svg-icons";

const { Title, Text } = Typography;

const SettingsList = () => {
  const navigate = useNavigate();
  const { token } = theme.useToken();

  const data = [
    {
      title: 'Role Settings',
      icon: faUserTag,
      link: "/settings/roleSettings",
      description: "Manage application roles and assign access levels to users.",
      permission: "ROLE_SETTINGS",
      color: '#3b82f6', // Blue
      bgColor: '#eff6ff', // Light Blue
    },
    {
      title: 'Permission Settings',
      icon: faLockOpen,
      link: "/settings/permissionSettings",
      description: "Configure granular permissions for specific modules and actions.",
      permission: 'PERMISSION_SETTINGS',
      color: '#8b5cf6', // Violet
      bgColor: '#f5f3ff', // Light Violet
    },
    {
      title: 'Marketplace Settings',
      icon: faMoneyBillTrendUp,
      link: "/settings/marketplaceSettings",
      description: "Manage connected marketplaces and business page configurations.",
      permission: "MARKETPLACE_SETTINGS",
      color: '#10b981', // Emerald
      bgColor: '#ecfdf5', // Light Emerald
    },
    {
      title: 'Product Settings',
      icon: faSliders,
      link: "/settings/productSettings",
      description: "Customize product attributes, categories, and inventory rules.",
      permission: "PRODUCT_SETTINGS",
      color: '#f59e0b', // Amber
      bgColor: '#fffbeb', // Light Amber
    }
  ];

  return (
    <Row gutter={[24, 24]}>
      {data.map((item, index) => (
        <Permission required={item.permission} key={item.title}>
          <Col xs={24} md={12} lg={8} xl={6}>
            <div
              onClick={() => navigate(item.link)}
              className="group relative h-full bg-white dark:bg-slate-800 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-slate-100 dark:border-slate-700"
            >
              {/* Icon Bubble */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                style={{ backgroundColor: item.bgColor, color: item.color }}
              >
                <FontAwesomeIcon icon={item.icon} style={{ fontSize: "24px" }} />
              </div>

              {/* Content */}
              <div>
                <Title level={4} style={{ marginBottom: '8px', fontSize: '18px' }}>
                  {item.title}
                </Title>
                <Text type="secondary" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                  {item.description}
                </Text>
              </div>

              {/* Hover Indicator (Optional Arrow or Glow) */}
              <div
                className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </div>
          </Col>
        </Permission>
      ))}
    </Row>
  )
};

export default SettingsList;
