import React, { useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Descriptions, Skeleton, Image, Space, Col, Row, Empty } from 'antd';
import axiosClient from "../axios-client.js";
import {colors} from "../utils/Colors.js";


const Order = () => {

  const [Loading, setLoading] = useState(false);
  const [order, setOrder] = useState({});


  const { id } = useParams()


  useEffect(() => {
    fetchOrders();

    return () => {

    }
  }, [])

  const fetchOrders = async () => {

    setLoading(true);
    try {
      const order = await axiosClient.get(`/orders/getOrder/${id}`);
      setOrder({ ...order.data })
      setLoading(false)
    } catch (error) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      toast.error(message);
      setLoading(false);
    }

  }

  return (
    <Row gutter={[12, 0]}>
      <Col xs={24} md={16}>
        <Row gutter={[12, 12]}>
          <Col xs={24} md={24}>
            <Card className='shadow' title="Customer Information" headStyle={{backgroundColor:colors.primary, color:"white", fontWeight:"Bold"}}>
              {order.customer ? <Descriptions size='small' labelStyle={{ color: "#3C4048", fontWeight: "bold" }}>
                <Descriptions.Item label="Name">{order.customer.name}</Descriptions.Item>

                <Descriptions.Item label="Facebook ID">{order.customer.facebook_id}</Descriptions.Item>
                <Descriptions.Item label="Address">
                  {`${order.customer.address.address}, ${order.customer.address.district}, ${order.customer.address.division}`}
                </Descriptions.Item>
                <Descriptions.Item label="Phone">{order.customer.address.phone}</Descriptions.Item>
                <Descriptions.Item label="Alternate Phone">{order.customer.alt_phone}</Descriptions.Item>

              </Descriptions> : <Skeleton paragraph={{ rows: 3 }} />}

            </Card>
          </Col>
          <Col xs={24} md={24}>
            <Card className='shadow' title="Product Information" headStyle={{backgroundColor:colors.primary, color:"white", fontWeight:"Bold"}}>
              <Space direction="vertical" style={{ display: 'flex' }}>
                {order && order.product ? order.product.map((item, index) => {
                  return <Descriptions labelStyle={{ color: "#3C4048", fontWeight: "bold" }} bordered size='small' style={{width:"100%"}} key={index}>
                    <Descriptions.Item label={"Product - " + (index + 1)}>{item.type_id}</Descriptions.Item>
                    <Descriptions.Item label="Color">{item.color_id}</Descriptions.Item>
                    <Descriptions.Item label="Fabric">{item.fabric_id}</Descriptions.Item>
                    <Descriptions.Item label="Description">{item.description}</Descriptions.Item>

                  </Descriptions>

                }) : <Skeleton paragraph={{ rows: 3 }} />}
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={24}>
            <Card className='shadow' title="Delivery Information" headStyle={{backgroundColor:colors.primary, color:"white", fontWeight:"Bold"}}>
              {order && order.image ? <Descriptions  labelStyle={{ color: "#3C4048", fontWeight: "bold" }} bordered size='small'>
                <Descriptions.Item label="Delivery Channel">{order.delivery_channel}</Descriptions.Item>
                <Descriptions.Item label="Delivery Date">{order.delivery_date}</Descriptions.Item>
                <Descriptions.Item label="Delivery Charge">{order.delivery_charge}</Descriptions.Item>
                <Descriptions.Item label="Total Amount">{order.total_amount + " tk"}</Descriptions.Item>
              </Descriptions> : <Skeleton paragraph={{ rows: 3 }} />}

            </Card>
          </Col>
        </Row>

      </Col>

      <Col xs={24} md={8}>
        <Card className='shadow' title="Images" style={{ overflow: "auto" }} headStyle={{backgroundColor:colors.primary, color:"white", fontWeight:"Bold"}}>
          {order.image && order.image.length ? <Row gutter={[16, 16]}>
              {order.image.map(item => {
                return <Col key={item.id}>
                  <Image
                    width={100}
                    height={100}
                    src={`${import.meta.env.VITE_API_BASE_URL}/api/files/upload/${item.id}`}
                  />
                </Col>
              })}
            </Row>

            : <Empty description={"No image found."} />}

        </Card>
      </Col>




    </Row>


  )
}

export default Order;
