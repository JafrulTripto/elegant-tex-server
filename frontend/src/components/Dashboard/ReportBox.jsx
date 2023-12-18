import React from 'react';
import {faChevronDown, faChevronUp, faPersonDigging} from "@fortawesome/free-solid-svg-icons";
import {colors} from "../../utils/Colors";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { Spin } from 'antd';

const ReportBox = (props) => {

    const {data, loading, text} = props;
  if (data) {
    const orderPercentage = () => {
      if (data.change > 0 ){
        return (
          <div className="ml-auto">
            <div
              className="report-box__indicator bg-green-500 tooltip cursor-pointer rounded-lg px-2 py-1 text-white font-bold">
              {Math.abs(Math.round(data.change))}%<FontAwesomeIcon icon={faChevronUp} style={{fontSize: "15px", paddingLeft:"10px"}}/>
            </div>
          </div>
        )
      }
      return (
        <div className="ml-auto">
          <div
            className="report-box__indicator bg-red-500 tooltip cursor-pointer rounded-lg px-2 py-1 text-white font-bold">
            {Math.abs(Math.round(data.change))}% <FontAwesomeIcon icon={faChevronDown} className="px-1" style={{fontSize: "15px", paddingLeft:"10px"}}/>
          </div>
        </div>
      )
    }

    return (
      <div className="report-box zoom-in bg-white rounded-lg shadow-md">
        <div className="box p-5">
          <div className="flex">
            <FontAwesomeIcon icon={faPersonDigging} style={{fontSize: "30px", color: colors.secondary}}/>
            {orderPercentage()}
          </div>
          <div className="text-3xl font-medium leading-8 mt-6">{props.data.total.toLocaleString()}</div>
          <div className="text-base text-slate-500 mt-1 font-medium">{text}</div>
        </div>
      </div>
    );
  }
  if (loading){
      return (
          <div className="report-box zoom-in bg-white rounded-lg shadow-md">
              <div className="flex justify-center items-center box p-5"  style={{height:"154px"}}>
                  <div className=""><Spin /></div>
              </div>
          </div>
      )
  }
  return (
    <div className="report-box zoom-in bg-white rounded-lg shadow-md">
      <div className="flex justify-center items-center box p-5"  style={{height:"154px"}}>
        <div className=""><p>No Data</p></div>
      </div>
    </div>
  )
};

export default ReportBox;
