import React from 'react';
import {Col, DatePicker, Form, InputNumber, Row, Select} from "antd";
import {useDeliveryChannels} from "../../hooks/useDeliveryChannels";
import moment from "moment";

const DeliveryFrom = () => {

  const {deliveryChannels} = useDeliveryChannels();
  const {Option} = Select;

  const disabledDate = (current) => {
    // Can not select days before today and today
    return current && current < moment().endOf('day');
  }


  return (
    <Row gutter={24}>
      <Col xs={24} md={12} lg={8}>
        <Form.Item
          name="deliveryChannel"
          label="Delivery Channel"
          rules={[
            {
              required: true,
              message: 'Please select delivery channel!',
            },

          ]}>
          <Select>
            {deliveryChannels.map(data => {
              return <Option value={data.id} key={data.id}>{data.name}</Option>
            })}
          </Select>
        </Form.Item>
      </Col>
      <Col xs={24} md={12} lg={8}>
        <Form.Item
          name="deliveryDate"
          label="Delivery Date"
          rules={[
            {
              required: true,
              message: 'Please input delivery Date!',
            },

          ]}>
          <DatePicker format={"YYYY-MM-DD"} disabledDate={disabledDate} style={{width: "100%"}}/>
        </Form.Item>
      </Col>
      <Col xs={24} md={12} lg={8}>
        <Form.Item
          name="deliveryCharge"
          label="Delivery Charge (BDT)"
          rules={[
            {
              required: true,
              message: 'Please input valid delivery charge!',
            },

          ]}>
          <InputNumber
            min={0}
            style={{width: "100%"}}
          />
        </Form.Item>
      </Col>
    </Row>
  );
};

export default DeliveryFrom;
