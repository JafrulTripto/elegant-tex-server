import React, { useState } from 'react';
import {
  ShoppingOutlined,
  GlobalOutlined,
  ShopOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { Card, Skeleton, Segmented, Statistic, theme } from 'antd';

const ReportBox = (props) => {
  const { data, loading, text } = props;
  const [reportType, setReportType] = useState('day');
  const { token } = theme.useToken();

  const getIcon = () => {
    const style = { fontSize: 24, padding: 8, borderRadius: 8 };
    switch (text) {
      case "Order":
      case "My Orders":
        return <ShoppingOutlined style={{ ...style, color: token.colorPrimary, background: '#e6f4ff' }} />;
      case "Marketplace":
        return <GlobalOutlined style={{ ...style, color: token.colorInfo, background: '#cffafe' }} />;
      case "Merchant":
        return <ShopOutlined style={{ ...style, color: token.colorWarning, background: '#fef3c7' }} />;
      case "Completion":
        return <CheckCircleOutlined style={{ ...style, color: token.colorSuccess, background: '#d1fae5' }} />;
      default:
        return null;
    }
  };

  const showToggleValues = () => {
    return text === 'Completion' ? ['Delivered', 'Returned'] : ['Day', 'Month'];
  };

  const handleToggleReport = (value) => {
    setReportType(value.toLowerCase());
  };

  const showReportText = () => {
    return reportType === 'day' && text !== 'Completion' ? 'Today' : 'Since last month';
  };

  const reportData = data
    ? (reportType === 'day' || reportType === 'delivered' ? data.firstValue : data.secondValue)
    : { total: 0, amount: 0 };

  return (
    <Card
      bordered={false}
      className="hover:shadow-lg transition-shadow duration-300 h-full"
      bodyStyle={{ padding: '20px' }}
    >
      <Skeleton loading={loading} active avatar paragraph={{ rows: 2 }}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            {getIcon()}
            <span className="text-slate-500 font-medium text-base">{text}</span>
          </div>
          <Segmented
            size='small'
            options={showToggleValues()}
            onChange={handleToggleReport}
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between">
            <Statistic
              value={reportData.total}
              valueStyle={{ fontWeight: 700, fontSize: 28 }}
            />
            <div className="text-right">
              <div className="text-xs text-slate-400 mb-1">{showReportText()}</div>
              {data && text !== 'Completion' && (
                <div className="text-sm font-semibold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                  ৳ {parseInt(reportData.amount).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </Skeleton>
    </Card>
  );
};

export default ReportBox;
