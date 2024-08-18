import React from 'react';
import {Col, Row} from "antd";
import ReportBox from "./ReportBox";
import {useUserDashboardData} from "../../hooks/useUserDashboardData";

const UserDashboard = () => {
  const { userDashboardData, userDashboardDataLoading } = useUserDashboardData();
  const extractDataByOrderType = (data, orderType) => {
    const orderData = {
      firstValue: {
        total: data.today.total,
        amount: data.today.amount,
      },
      secondValue: {
        total: data.monthly.total,
        amount: data.monthly.amount,
      },
    };
    return orderData;
  }
  return (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} lg={6}>
          <ReportBox
            data={userDashboardData ? extractDataByOrderType(userDashboardData, 'order') : null}
            loading={userDashboardDataLoading}
            text="Order"
          />
        </Col>
      </Row>
    </>
  );
};

export default UserDashboard;
