import React, {useState, useEffect, useCallback} from 'react';
import {Space, Card, Row, Col, Button, Input, Table, Tag, Tabs, Select, Modal, Form} from 'antd';
import {NavLink, useNavigate} from "react-router-dom";
import {toast} from 'react-toastify';
import {PlusOutlined, DeleteOutlined, EditOutlined} from '@ant-design/icons'
import {useStateContext} from "../contexts/ContextProvider.jsx";
import useAxiosClient from "../axios-client.js";
import Permission from "../components/Util/Permission.jsx";
import {OrderTypeEnum} from "../utils/enums/OrderTypeEnum.js";
import {formatOrderNumber} from "../components/Util/OrderNumberFormatter";
import dayjs from "dayjs";
import TextArea from "antd/es/input/TextArea";


function Sales() {

    const axiosClient = useAxiosClient();
    const {Search} = Input;
    const {user, permissions} = useStateContext();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false);
    const [statuses, setStatuses] = useState([]);
    const [orders, setOrders] = useState([]);
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(13);
    const [orderType, setOrderType] = useState('Marketplace');
    const [currentOrderStatus, setCurrentOrderStatus] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [statusForm] = Form.useForm();

    const fetchOrderStatuses = async () => {
        let statuses = await axiosClient.get('/status/getStatuses');
        setStatuses(statuses.data);
    };
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
                return {...data, key: data.id};
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
            fetchOrderStatuses()
        }
    }, [user, fetchOrders, orderType])

    const isOrderStatusDisabled = (value, permission) => {
        if (permissions.includes('CHANGE_STATUS')) {
            return false;
        }
        return !(permissions.includes(permission) && value > currentOrderStatus);


    }
    const transformStatusArray = (statuses, textKey) => {
        return statuses.map(({id, text, color}) => {
            const object = {};
            object[textKey] = text;
            object['value'] = id;
            object['color'] = color;
            object['disabled'] = id === 1 ? currentOrderStatus > 1 : isOrderStatusDisabled(`ORDER_${text}`);
            return object;
        });
    }


    const handleNewOrder = (orderType) => {
        navigate('/orders/orderForm', {state: {orderType, update: false}})
    }


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
                <Button className='edit-btn' icon={<EditOutlined/>} size={"small"}
                        onClick={() => handleEditOrder(record)}/>
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
        statusForm.setFieldValue('status', data);
        setCurrentOrderStatus(data);
        setIsModalOpen(true);
        setOrderId(id);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
        statusForm.resetFields();
    }

    const renderStatus = (data, record, index) => {
        return <Tag color={data.color} style={{cursor: "pointer", fontWeight: 700}}
                    onClick={() => showStatusModal(data.id, record.id)}>{data.text}</Tag>
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
            filters: transformStatusArray(statuses, 'text'),
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

    const updateOrderStatus = (data) => {
        const postData = {
            orderId,
            newStatus: data.status,
            statusComment: data.statusComment

        }
        setStatusLoading(true);
        axiosClient.post('/orders/updateOrderStatus', postData).then((response) => {
            const order = response.data.data;
            const target = orders.find((obj) => obj.id === order.id);
            Object.assign(target, order);
            setStatusLoading(false)
            setIsModalOpen(false);
            toast.success("Succesfully changed order status to updated status");

        }).catch((error) => {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            toast.error(message);
            setStatusLoading(false)
        })
    };
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
                                <Button type="primary" onClick={() => handleNewOrder(OrderTypeEnum.MARKETPLACE)}
                                        icon={<PlusOutlined/>}>Marketplace
                                    Order</Button>
                            </Permission>
                        </Space>
                    </Col>
                </Row>
            </Card>
            <Tabs defaultActiveKey="1" onChange={onTabChange} items={renderTabItems()}></Tabs>
            <Modal
                title="Update Status"
                confirmLoading={statusLoading}
                width={400}
                open={isModalOpen}
                okText="Submit"
                okType='submit'
                footer={null}
                onCancel={handleCancel}>
                <Form
                    form={statusForm}
                    name="role_form"
                    className="login-form"
                    layout='vertical'
                    // initialValues={{
                    //     remember: true,
                    // }}
                    onFinish={updateOrderStatus}
                >
                    <Form.Item
                        name="status"
                        label="Status"
                    >
                        <Select
                            options={transformStatusArray(statuses, 'label')}
                        />
                    </Form.Item>
                    <Form.Item
                        name="statusComment"
                        label="Status Comment"
                    >
                        <TextArea rows={4}/>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" className='float-right' htmlType="submit" loading={statusLoading}>
                            Submit
                        </Button>
                    </Form.Item>
                </Form>


            </Modal>
        </Space>
    )
}

export default Sales
