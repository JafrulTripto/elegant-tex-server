import React from 'react';
import { Col, Row } from "antd";
import ReportBox from "./ReportBox";
import BarChart from "./BarChart";
import MarketplaceOrdersChart from "./MarketplaceOrdersChart";
import { useDashboardData } from "../../hooks/useDashboardData";

const AdminDashboard = () => {
  const { dashboardData, dashboardDataLoading } = useDashboardData();

  const extractDataByOrderType = (data, orderType) => {
    const orderData = {
      firstValue: {
        total: data.total_orders_today.total,
        amount: data.total_orders_today.amount,
      },
      secondValue: {
        total: data.total_orders_this_month.total,
        amount: data.total_orders_this_month.amount,
      },
    };
  
    const marketplaceData = {
      firstValue: {
        total: data.total_marketplace_orders_today.total,
        amount: data.total_marketplace_orders_today.amount,
      },
      secondValue: {
        total: data.total_marketplace_orders_this_month.total,
        amount: data.total_marketplace_orders_this_month.amount,
      },
    };
  
    const merchantData = {
      firstValue: {
        total: data.total_merchant_orders_today.total,
        amount: data.total_merchant_orders_today.amount,
      },
      secondValue: {
        total: data.total_merchant_orders_this_month.total,
        amount: data.total_merchant_orders_this_month.amount,
      },
    };

    const completionData = {
      firstValue: data.delivered_orders_this_month,
      secondValue: data.returned_orders_this_month
    }
  
    switch (orderType.toLowerCase()) {
      case 'order':
        return orderData;
      case 'marketplace':
        return marketplaceData;
      case 'merchant':
        return merchantData;
      case 'completion':
        return completionData;
      default:
        throw new Error('Invalid order type');
    }
  };


  return (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} lg={6}>
          <ReportBox
            data={dashboardData ? extractDataByOrderType(dashboardData, 'order') : null}
            loading={dashboardDataLoading}
            text="Order"
          />
        </Col>
        <Col xs={24} md={12} lg={6}>
          <ReportBox
            data={dashboardData ? extractDataByOrderType(dashboardData, 'marketplace') : null}
            loading={dashboardDataLoading}
            text="Marketplace"
          />
        </Col>
        <Col xs={24} md={12} lg={6}>
          <ReportBox
            data={dashboardData ? extractDataByOrderType(dashboardData, 'merchant') : null}
            loading={dashboardDataLoading}
            text="Merchant"
          />
        </Col>
        <Col xs={24} md={12} lg={6}>
          <ReportBox
            data={dashboardData ? extractDataByOrderType(dashboardData, 'completion') : null}
            loading={dashboardDataLoading}
            text="Completion"
          />
        </Col>
        <Col xs={24} md={24} lg={24}>
          <div className="bg-white rounded-lg shadow-md p-5 text-center">
            <div>
              <h5 className="mb-2 text-xl font-medium leading-tight text-neutral-800">
                Orders this Month
              </h5>
            </div>
            <div className="" style={{ height: "400px" }}>
              <BarChart />
            </div>
          </div>
        </Col>
        <Col xs={24} md={24} lg={24}>
          <MarketplaceOrdersChart />
        </Col>
      </Row>
    </>
  );
};

export default AdminDashboard;
