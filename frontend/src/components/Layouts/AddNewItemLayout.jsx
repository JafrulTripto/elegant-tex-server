import React from 'react';
import {Button, Card, Col, Row} from "antd";
import {PlusOutlined} from "@ant-design/icons";

const AddNewItemLayout = ({ buttonText, onClickButton }) => {
  return (
    <Card className='shadow'>
      <Row justify='space-between'>
        <Col xs={{ span: 24 }} lg={{ span: 16 }}>

        </Col>
        <Col xs={{ span: 24 }} lg={{ span: 6 }} flex={"inherit"}>
          <Button type="primary" onClick={onClickButton} icon={<PlusOutlined />}>{buttonText}</Button>
        </Col>
      </Row>

    </Card>
  )
};

export default AddNewItemLayout;
