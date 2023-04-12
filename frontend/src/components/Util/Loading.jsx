import React from 'react';
import {Spin, Typography} from "antd";
import {Loading3QuartersOutlined} from '@ant-design/icons';
import {colors} from "../../utils/Colors";

const antIcon = <Loading3QuartersOutlined style={{fontSize: 56}} spin/>;
const Loading = (props) => {

  const { Title } = Typography;

  const calculateHeight = () =>{
    if (props.layout === 'default'){
      return "calc(100vh - 148px)";
    }
    return "100vh";
  }
  return (
    <>
      <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: calculateHeight(), flexDirection: "column"}}>
        <Spin indicator={antIcon} size="large"/>
        <Title level={4} style={{paddingTop:"15px",paddingLeft:"15px", color: colors.secondary}}>Please wait. Loading . . .</Title>
      </div>
    </>
  );
};

export default Loading;
