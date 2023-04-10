import React from 'react';
import {Col, Row} from "antd";
import ReportBox from "./ReportBox";
import {useOrderCountToday} from "../../hooks/useOrderCountToday";

const DashboardWidgets = () => {
  const {orderCountToday} = useOrderCountToday();
  return (
    <Row gutter={[16,16]}>
      <Col xs={24} md={12} lg={6}>
        <ReportBox data={orderCountToday}/>
      </Col>
      <Col xs={24} md={12} lg={6}><ReportBox/></Col>
      <Col xs={24} md={12} lg={6}><ReportBox/></Col>
      <Col xs={24} md={12} lg={6}><ReportBox/></Col>
    </Row>
  );
};

export default DashboardWidgets;
