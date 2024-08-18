import React, {useEffect, useState} from 'react';
import {Avatar, List, Radio, Spin} from "antd";
import useAxiosClient from "../../axios-client";
import {colors} from "../../utils/Colors";
import {UserOutlined} from "@ant-design/icons";

const TopExecutives = (props) => {
  const axiosClient = useAxiosClient();
  const [executiveStats, setExecutiveStats] = useState([]);

  useEffect(() => {
    axiosClient.get(`dashboard/getMonthlyOrdersPerUser`).then((response) => {
      setExecutiveStats(response.data);
    }).catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const listStyles = {
    height: "400px",
    overflow:'auto'
  }
  return(
    <div className="bg-white rounded-lg shadow-md p-5 border-b-2">
      <div className="flex flex-row justify-between">
        <div>
          <h5 className="mb-2 text-xl font-medium leading-tight text-slate-700">
            Executives Order
          </h5>
        </div>
        <div>
          <div className="flex justify-between">
            <div className="px-5 font-bold text-slate-700 mt-2">Order Count</div>
            <div className="px-5 text-end w-auto font-bold text-slate-700 mt-2 mr-2" style={{width:"100px"}}>Amount</div>
          </div>
        </div>
      </div>
      <div className="pl-3 rounded-md border-neutral-200 border border-solid" style={listStyles}>
        <List
          itemLayout="horizontal"
          dataSource={executiveStats}
          renderItem={(item, index) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  item.image_id ?
                    <Avatar src={`${process.env.REACT_APP_API_BASE_URL}/files/upload/${item.image_id}`}/> :
                    <Avatar
                      style={{
                        backgroundColor: '#87d068',
                      }}
                      icon={<UserOutlined />}
                    />
                }
                title={item.fullname}
                description={item.email}
              />
              <div className="flex justify-between">
                <div className="px-5 font-bold text-red-400">{item.total_orders}</div>
                <div className="px-2 text-end w-auto font-bold text-[#50B498]" style={{width:"120px"}}>{`${parseInt(item.total_amount).toLocaleString()} ৳`}</div>
              </div>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
}

export default TopExecutives;
