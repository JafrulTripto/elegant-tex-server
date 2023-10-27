import React, {useEffect} from 'react';
import {Col, Row} from "antd";
import ReportBox from "./ReportBox";
import BarChart from "./BarChart";
import MarketplaceOrdersChart from "./MarketplaceOrdersChart";
import {useDashboardData} from "../../hooks/useDashboardData";

const AdminDashboard = () => {

  const {dashboardData, dashboardDataLoading} = useDashboardData();


  return (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} lg={6}>
          <ReportBox data={dashboardData ? dashboardData.total_orders_today : null} loading={dashboardDataLoading} text="Order's Today"/>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <ReportBox data={dashboardData ? dashboardData.total_amount_sold_today : null} loading={dashboardDataLoading}
                     text={"Amount sold today (Taka)"}/>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <ReportBox data={dashboardData ? dashboardData.total_merchant_orders_this_month : null} loading={dashboardDataLoading}
                     text={"Merchant order's this month"}/>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <ReportBox data={dashboardData ? dashboardData.total_marketplace_orders_this_month : null} loading={dashboardDataLoading}
                     text={"Marketplace order's this month"}/>
        </Col>
        <Col xs={24} md={12} lg={12}>
          <div className="bg-white rounded-lg shadow-md p-5">
            <h5
              className="mb-2 text-xl font-medium leading-tight text-neutral-800">
              Orders this week
            </h5>
            <BarChart/>
          </div>
        </Col>
        <Col xs={24} md={12} lg={12}>
          <MarketplaceOrdersChart/>
        </Col>
      </Row>
    </>

  );
};

export default AdminDashboard;
