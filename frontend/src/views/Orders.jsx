import React, {useState, useEffect, useCallback} from 'react';
import {Space, Card, Row, Col, Button, Input, Table, Tag, Tabs, Select, Modal} from 'antd';
import {NavLink, useNavigate} from "react-router-dom";
import {toast} from 'react-toastify';
import {PlusOutlined, DeleteOutlined, EditOutlined} from '@ant-design/icons'
import {useStateContext} from "../contexts/ContextProvider.jsx";
import useAxiosClient from "../axios-client.js";
import Permission from "../components/Util/Permission.jsx";
import {OrderTypeEnum} from "../utils/enums/OrderTypeEnum.js";
import {formatOrderNumber} from "../components/Util/OrderNumberFormatter";
import dayjs from "dayjs";


function Sales() {

  const axiosClient = useAxiosClient();
  const {Search} = Input;
  const {user, permissions} = useStateContext();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(13);
  const [orderType, setOrderType] = useState('Marketplace');
  const [orderStatus, setOrderStatus] = useState(null);
  const [currentOrderStatus, setCurrentOrderStatus] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderId, setOrderId] = useState(null);


  const checkOrderStatusChangePermission = (value, permission) => {
    if (permissions.includes('CHANGE_STATUS')) {
      return false;
    }
    return !(permissions.includes(permission) && value > currentOrderStatus);


  }

  const OrderStatusList = Object.freeze([
    {
      text: 'DRAFT',
      value: 0,
      color: '#FF0032',
      disabled: currentOrderStatus > 0
    },
    {
      text: 'APPROVED',
      value: 1,
      color: '#1640D6',
      disabled: checkOrderStatusChangePermission(1, 'ORDER_APPROVE')
    },
    {
      text: 'PRODUCTION',
      value: 2,
      color: '#D0A2F7',
      disabled: checkOrderStatusChangePermission(2, 'ORDER_IN_PRODUCTION')
    },
    {
      text: 'QA',
      value: 3,
      color: '#F99417',
      disabled: checkOrderStatusChangePermission(3, 'ORDER_IN_QA')
    },
    {
      text: 'READY',
      value: 4,
      color: '#0C6170',
      disabled: checkOrderStatusChangePermission(4, 'ORDER_READY')
    },
    {
      text: 'BOOKING',
      value: 8,
      color: '#7C93C3',
      disabled: checkOrderStatusChangePermission(8, 'ORDER_BOOKING')
    },
    {
      text: 'DELIVERED',
      value: 5,
      color: '#37BEB0',
      disabled: checkOrderStatusChangePermission(5, 'ORDER_DELIVERED')
    },
    {
      text: 'RETURNED',
      value: 6,
      color: '#FBC740',
      disabled: checkOrderStatusChangePermission(6, 'ORDER_RETURNED')
    },
    {
      text: 'CANCELLED',
      value: 7,
      color: '#FF0032',
      disabled: checkOrderStatusChangePermission(7, 'ORDER_CANCELLED')
    }
  ])

  const handleNewOrder = (orderType) => {
    navigate('/orders/orderForm', {state: {orderType, update: false}})
  }

  const fetchOrders = useCallback(async (page = 1, filter = []) => {
    setLoading(true);
    let link = '';
    const userId = user.id;

    if (orderType === 'Marketplace') {
      link = `/orders/getMarketplaceOrders/${userId}?`;
    } else {
      link = `/orders/getMerchantOrders?`;
    }

    // Add page parameter
    link += `page=${page}`;

    // Check if filter is defined and not empty
    if (filter.status && filter.status.length > 0) {
      // Add filter parameter
      link += `&status=${filter.status.join(',')}`;
    }
    try {
      const orders = await axiosClient.get(link);
      setLoading(false);

      const ordersData = orders.data.data.map((data) => {
        return { ...data, key: data.id };
      });

      setOrders(ordersData);
      setTotal(orders.data.meta.total);
    } catch (error) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      toast.error(message);
      setLoading(false);
    }
  }, [axiosClient, user.id, orderType]);


  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, fetchOrders, orderType])


  const handleEditOrder = (record) => {
    navigate('/orders/editOrderForm', {state: {orderType: record.orderType, update: true, order: record}})
  }
  const handleDeleteOrder = (record) => {
    Modal.confirm({
      title: 'Do you want to delete this order?',
      okText: "Yes",
      okType: "primary",
      okButtonProps: {danger: true},
      onOk: () => confirmDeleteOrder(record.id)
    })

  }

  const confirmDeleteOrder = async (id) => {
    try {
      const data = await axiosClient.delete(`/orders/delete/${id}`);
      toast.warning(data.data.message);
      fetchOrders(1);

    } catch (error) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      toast.error(message);
    }
  }

  const renderActionButtons = (record) => {
    return (
      <Space size="middle">
        <Button className='edit-btn' icon={<EditOutlined/>} size={"small"} onClick={() => handleEditOrder(record)}/>
        <Permission required={'DELETE_ORDER'}>
          <Button type="primary" danger icon={<DeleteOutlined/>} size={"small"}
                  onClick={() => handleDeleteOrder(record)}/>
        </Permission>
      </Space>
    );
  }

  const onSearch = async (value, page = 1) => {
    if (value) {
      setLoading(true);
      const userId = user.id;
      try {
        let link = '';
        if (orderType === 'Marketplace') {
          link = page > 1 ? `/orders/getMarketplaceOrders/${userId}?page=${page}&search=${value}` : `/orders/getMarketplaceOrders/${userId}?search=${value}`;
        } else {
          link = page > 1 ? `/orders/getMerchantOrders?page=${page}&search=${value}` : `/orders/getMerchantOrders?search=${value}`;

        }
        const orders = await axiosClient.get(link);
        setLoading(false);
        const ordersData = orders.data.data.map((data) => {
          return {...data, key: data.id}
        })
        setOrders(ordersData);
        setTotal(orders.data.meta.total)
      } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        toast.error(message);
        setLoading(false);
      }
    }
  };

  const onTabChange = (key) => {
    const orderType = key === 1 ? 'Marketplace' : 'Merchant'
    setOrderType(orderType);
    // fetchOrders(1);
  }
  const showStatusModal = (data, id) => {
    setCurrentOrderStatus(data);
    setOrderStatus(data);
    setIsModalOpen(true);
    setOrderId(id);
  };
  const handleOk = () => {
    const postData = {
      orderId,
      orderStatus
    }
    setStatusLoading(true);
    axiosClient.post('/orders/changeOrderStatus', postData).then((response) => {
      const order = response.data.data;
      const target = orders.find((obj) => obj.id === order.id);
      Object.assign(target, order);
      setOrderStatus(null);
      setStatusLoading(false)
      setIsModalOpen(false);
      toast.success("Succesfully changed order status to " + retrieveStatusString(response.data.data.status));

    }).catch((error) => {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      toast.error(message);
      setStatusLoading(false)
    })

  };
  const handleCancel = () => {
    setIsModalOpen(false);
  }
  const handleStatusChange = (status) => {
    setOrderStatus(status);
  }

  const generateTagColorFromStatus = (status) => {
    let obj = OrderStatusList.find(o => o.value === status);
    return obj.color;
  }

  const retrieveStatusString = (statusValue) => {
    const statusObject = OrderStatusList.find((status) => status.value === statusValue);
    return statusObject ? statusObject.text : 'Unknown';
  };

  const renderStatus = (data, record, index) => {
    return <Tag color={generateTagColorFromStatus(data)} style={{cursor: "pointer", fontWeight: 700}}
                onClick={() => showStatusModal(data, record.id)}>{retrieveStatusString(data)}</Tag>
  }


  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      render: (data) => <NavLink to={`${formatOrderNumber(data)}`}>{formatOrderNumber(data)}</NavLink>
    },
    {
      title: 'Ordered By',
      dataIndex: 'orderedBy',
      key: 'orderedBy',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: OrderStatusList,
      render: renderStatus
    },
    {
      title: 'Created By',
      dataIndex: 'createdBy',
      key: 'createdBy',
    },
    {
      title: 'Order Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (data) => dayjs(data).format('MMMM DD, YYYY')
    },
    {
      title: 'Delivery Date',
      dataIndex: 'deliveryDate',
      key: 'deliveryDate',
      render: (data) => dayjs(data).format('MMMM DD, YYYY')
    },
    {
      title: 'Total Amount (Tk)',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
    },
    {
      title: 'Action',
      key: "action",
      render: renderActionButtons
    }
  ];


  function handleTableChange(pagination, filter) {

    setPage(pagination.current)
    setPageSize(pagination.pageSize)
    fetchOrders(pagination.current, filter)
  }

  const renderTabItems = () => {
    const tabItems = [
      {
        label: `Marketplace`,
        key: 1,
        children: <Table
          dataSource={orders}
          columns={columns}
          loading={loading}
          scroll={{x: 400}}
          size={'small'}
          onChange={handleTableChange}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
          }}
        />,
      }
    ];

    if (permissions.includes("VIEW_MERCHANTS")) {
      tabItems.push({
        label: `Merchant`,
        key: 2,
        children: <Table
          dataSource={orders}
          columns={columns}
          loading={loading}
          scroll={{x: 400}}
          size={'small'}
          onChange={handleTableChange}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total
          }}
        />,
      });
    }
    return tabItems;
  }


  return (
    <Space
      direction="vertical"
      size="middle"
      style={{
        display: 'flex',
      }}
    >
      <Card className='shadow'>
        <Row justify='space-between'>
          <Col xs={{span: 24}} lg={{span: 6}}>
            <Search placeholder="Search orders . . ." onSearch={onSearch} enterButton/>
          </Col>
          <Col xs={{span: 24}} lg={{span: 12}} flex={"inherit"}>
            <Space>
              <Permission required={'CREATE_MERCHANT_ORDER'}>
                <Button type="primary" ghost onClick={() => handleNewOrder(OrderTypeEnum.MERCHANT)}
                        icon={<PlusOutlined/>}>Merchant Order</Button>
              </Permission>
              <Permission required={'CREATE_MARKETPLACE_ORDER'}>
                <Button type="primary" onClick={() => handleNewOrder(OrderTypeEnum.MARKETPLACE)} icon={<PlusOutlined/>}>Marketplace
                  Order</Button>
              </Permission>
            </Space>
          </Col>
        </Row>
      </Card>
      <Tabs defaultActiveKey="1" onChange={onTabChange} items={renderTabItems()}></Tabs>
      <Modal title="Status" confirmLoading={statusLoading} width={400} open={isModalOpen} onOk={handleOk}
             onCancel={handleCancel}>
        <Select
          value={orderStatus}
          style={{width: "100%"}}
          onChange={handleStatusChange}
          options={OrderStatusList}
        />
      </Modal>
    </Space>
  )
}

export default Sales
