import React from 'react';
import {Spin} from "antd";
import {Loading3QuartersOutlined} from '@ant-design/icons';

const antIcon = <Loading3QuartersOutlined style={{fontSize: 56}} spin/>;
const Loading = () => {
  return (
      <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "100vh"}}>
        <Spin indicator={antIcon} size="large"/>
        <span>Loading...</span>
      </div>

  );
};

export default Loading;
