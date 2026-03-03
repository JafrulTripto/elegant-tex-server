import React, { useState } from 'react';
import {
  ShoppingOutlined,
  GlobalOutlined,
  ShopOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { Card, Skeleton, Statistic, theme, Switch } from 'antd';

const ReportBox = (props) => {
  const { data, loading, text } = props;
  const [reportType, setReportType] = useState('day');
  const { token } = theme.useToken();

  const getIcon = () => {
    // Use low opacity background of the primary color for dark mode compatibility
    const opacity = 0.15;
    const style = { fontSize: 24, padding: 8, borderRadius: 8 };

    switch (text) {
      case "Order":
      case "My Orders":
        return <ShoppingOutlined style={{ ...style, color: token.colorPrimary, backgroundColor: `rgba(0, 122, 255, ${opacity})` }} />;
      case "Marketplace":
        return <GlobalOutlined style={{ ...style, color: token.colorInfo, backgroundColor: `rgba(6, 182, 212, ${opacity})` }} />;
      case "Merchant":
        return <ShopOutlined style={{ ...style, color: token.colorWarning, backgroundColor: `rgba(245, 158, 11, ${opacity})` }} />;
      case "Completion":
        return <CheckCircleOutlined style={{ ...style, color: token.colorSuccess, backgroundColor: `rgba(16, 185, 129, ${opacity})` }} />;
      default:
        return null;
    }
  };


  const showReportText = () => {
    return reportType === 'day' && text !== 'Completion' ? 'Today' : 'Last 30 days';
  };

  const reportData = data
    ? (reportType === 'day' || reportType === 'delivered' ? data.firstValue : data.secondValue)
    : { total: 0, amount: 0 };

  return (
    <Card
      bordered={false}
      className="h-full shadow-sm hover:shadow-md transition-all duration-300"
      bodyStyle={{ padding: '24px' }}
      style={{ borderRadius: token.borderRadiusLG }}
    >
      <Skeleton loading={loading} active avatar paragraph={{ rows: 2 }}>
        {/* Top Row: Icon and Title aligned left, Segmented Control right */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              {getIcon()}
              <div className="flex flex-col">
                <span style={{ color: token.colorTextSecondary, fontSize: '14px', fontWeight: 500 }}>
                  {text}
                </span>
                <span style={{ color: token.colorTextDescription, fontSize: '12px' }}>
                  {showReportText()}
                </span>
              </div>
            </div>
            <Switch
              checked={reportType === 'month' || reportType === 'returned'}
              onChange={(checked) => {
                if (text === 'Completion') {
                  setReportType(checked ? 'returned' : 'delivered');
                } else {
                  setReportType(checked ? 'month' : 'day');
                }
              }}
              checkedChildren={text === 'Completion' ? 'R' : 'M'}
              unCheckedChildren={text === 'Completion' ? 'D' : 'D'}
              size="small"
            />
          </div>

          {/* Bottom Section: Value and Amount Badge */}
          <div className="flex items-end justify-between mt-2">
            <Statistic
              value={reportData.total}
              valueStyle={{ fontWeight: 700, fontSize: 32, lineHeight: 1, color: token.colorTextHeading }}
              formatter={(value) => parseInt(value).toLocaleString()}
            />

            {data && text !== 'Completion' && (
              <div
                className="flex items-center justify-center cursor-default"
                style={{
                  backgroundColor: token.colorBgLayout,
                  padding: '6px 12px',
                  borderRadius: '12px',
                  border: `1px solid ${token.colorBorderSecondary}`
                }}
                title="Total Amount"
              >
                <span style={{ fontSize: '13px', fontWeight: 600, color: token.colorSuccess }}>
                  ৳ {parseInt(reportData.amount).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </Skeleton>
    </Card>
  );
};

export default ReportBox;
