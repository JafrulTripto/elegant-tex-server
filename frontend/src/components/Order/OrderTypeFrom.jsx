import React from 'react';
import {OrderTypeEnum} from "../../utils/enums/OrderTypeEnum";
import {Col, Form, Input, Row, Select} from "antd";


const OrderTypeFrom = ({orderType, From, data}) => {

    const {Option} = Select;

    return (
        <Row gutter={24}>

            {orderType === OrderTypeEnum.MARKETPLACE ?
                <Col xs={24} md={12} lg={5}>
                    <Form.Item
                        name="marketplace"
                        label="Marketplace"
                        rules={[
                            {
                                required: false,
                                message: 'Please select marketplace!',
                            },

                        ]}>
                        <Select size='large'>
                            {data.map(data => {
                                return <Option value={data.id} key={data.id}>{data.name}</Option>
                            })}
                        </Select>
                    </Form.Item>
                </Col> :
                <>
                    <Col xs={24} md={12} lg={5}>
                        <Form.Item
                            name="merchant"
                            label="Merchant"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input customer name!',
                                },
                            ]}
                        >
                            <Select size='large'>
                                {data.map(data => {
                                    return <Option value={data.id} key={data.id}>{data.name}</Option>
                                })}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12} lg={5}>
                        <Form.Item
                            name="merchantRef"
                            label="Merchant Reference Number"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input merchant reference!',
                                },
                            ]}
                        >
                            <Input size='large'/>
                        </Form.Item>
                    </Col>
                </>



            }

        </Row>
    );
};

export default OrderTypeFrom;
