import React, {useEffect, useState} from 'react';
import {OrderTypeEnum} from "../../utils/enums/OrderTypeEnum";
import {Col, Form, Row, Select} from "antd";
import {useMarketplaces} from "../../hooks/useMarketplaces";
import {useMerchants} from "../../hooks/useMerchants";

const OrderTypeFrom = ({orderType, From, data}) => {

  const {Option} = Select;

  return (
    <Row gutter={24}>
       <Col xs={24} md={12} lg={5}>
         {orderType === OrderTypeEnum.MARKETPLACE ? <Form.Item
          name="marketplace"
          label="Marketplace"
          rules={[
            {
              required: false,
              message: 'Please select marketplace!',
            },

          ]}>
          <Select>
            {data.map(data => {
              return <Option value={data.id} key={data.id}>{data.name}</Option>
            })}
          </Select>
        </Form.Item> : <Form.Item
           name="merchant"
           label="Merchant"
           rules={[
             {
               required: true,
               message: 'Please input customer name!',
             },
           ]}
         >
           <Select>
             {data.map(data => {
               return <Option value={data.id} key={data.id}>{data.name}</Option>
             })}
           </Select>
         </Form.Item>}
      </Col>
    </Row>
  );
};

export default OrderTypeFrom;
