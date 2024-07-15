import React, { useState } from 'react';
import { faShop, faRectangleList, faGlobe, faCalendarCheck } from "@fortawesome/free-solid-svg-icons";
import { colors } from "../../utils/Colors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Spin, Typography, Segmented } from 'antd';

const ReportBox = (props) => {
  const { data, loading, text } = props;
  const [reportType, setReportType] = useState('day');

  const showIcon = () => {
    switch (text) {
      case "Order":
        return faRectangleList;
        case "Marketplace":
          return faGlobe;
          case "Merchant":
            return faShop;
          case "Completion":
            return faCalendarCheck;
      default:
        break;
    }
  }

  const showToggleVlaues = () => {
    return text === 'Completion' ? ['Delivered' , 'Returned'] : ['Day', 'Month'];
  }

  const handleToggleReport = (value) => {
    setReportType(value.toLowerCase());
  };

  const showReportText = () => {
    return reportType === 'day' ? 'Today' : 'Since last month'
  }

  if (data) {
    const reportData = reportType === 'day' || reportType === 'delivered' ? data.firstValue : data.secondValue;
    return (
      <div className="report-box zoom-in bg-white rounded-lg shadow-md">
        <div className="box p-5">
          <div className="flex justify-between">
            <FontAwesomeIcon icon={showIcon()} style={{ fontSize: "30px", color: colors.secondary }} />
            <div>
              <Typography.Title level={4} style={{ margin: 0, color: colors.primary }}>
                {text}
              </Typography.Title>
            </div>
          </div>
          <div className='flex justify-between'>
            <div className="text-3xl font-medium leading-8 mt-6 ">{reportData.total}</div>
            <div className="text-3xl font-medium leading-8 mt-6 text-[#50B498]">{`${parseInt(reportData.amount).toLocaleString()} ৳`}</div>
          </div>
          
          <div className="flex justify-between">
            <div className={`text-base text-mt-1 font-medium text-[${colors.secondary}]`}>{showReportText()}</div>
            <div>
              <Segmented
                size='small'
                options={showToggleVlaues()}
                onChange={handleToggleReport}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="report-box zoom-in bg-white rounded-lg shadow-md">
        <div className="flex justify-center items-center box p-5" style={{ height: "154px" }}>
          <div className=""><Spin /></div>
        </div>
      </div>
    )
  }

  return (
    <div className="report-box zoom-in bg-white rounded-lg shadow-md">
      <div className="flex justify-center items-center box p-5" style={{ height: "154px" }}>
        <div className=""><p>No Data</p></div>
      </div>
    </div>
  )
};

export default ReportBox;
