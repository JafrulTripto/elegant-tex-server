import React from 'react';
import { Col, Row } from "antd";
import ReportBox from "./ReportBox";
import { useUserDashboardData } from "../../hooks/useUserDashboardData";
import { useStateContext } from "../../contexts/ContextProvider";
import FulfillmentSummary from "./FulfillmentSummary";

const UserDashboard = () => {
  const { userDashboardData, userDashboardDataLoading } = useUserDashboardData();
  const { user } = useStateContext();

  const extractDataByOrderType = (data, orderType) => {
    return {
      firstValue: {
        total: data.today.total,
        amount: data.today.amount,
      },
      secondValue: {
        total: data.monthly.total,
        amount: data.monthly.amount,
      },
    };
  }
  return (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} lg={6}>
          <ReportBox
            data={userDashboardData ? extractDataByOrderType(userDashboardData, 'order') : null}
            loading={userDashboardDataLoading}
            text="My Orders"
          />
        </Col>
        <Col xs={24}>
          <FulfillmentSummary userId={user?.id} />
        </Col>
      </Row>
    </>
  );
};

export default UserDashboard;
