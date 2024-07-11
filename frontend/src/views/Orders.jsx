import React, {useState, useEffect, useCallback, useRef} from 'react';
import {Space, Card, Row, Col, Button, Input, Table, Tag, Tabs, Select, Modal, Form, DatePicker} from 'antd';
import {NavLink, useNavigate} from "react-router-dom";
import {toast} from 'react-toastify';
import {PlusOutlined, DeleteOutlined, EditOutlined, SearchOutlined} from '@ant-design/icons'
import {useStateContext} from "../contexts/ContextProvider.jsx";
import useAxiosClient from "../axios-client.js";
import Permission from "../components/Util/Permission.jsx";
import {OrderTypeEnum} from "../utils/enums/OrderTypeEnum.js";
import {formatOrderNumber} from "../components/Util/OrderNumberFormatter";
import dayjs from "dayjs";
import TextArea from "antd/es/input/TextArea";
import Highlighter from 'react-highlight-words';
import {OrderStatusEnum} from "../utils/enums/OrderStatusEnum";
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
    const [currentOrderStatus, setCurrentOrderStatus] = useState(null);
    const [changedOrderStatus, setChangedOrderStatus] = useState(null);
    const searchInput = useRef(null);
    const [searchText, setSearchText] = useState('');
    const [filteredDeliveryDates, setFilteredDeliveryDates] = useState({})
    const [searchedColumn, setSearchedColumn] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [statusForm] = Form.useForm();
    const { RangePicker } = DatePicker;


    const fetchOrders = useCallback(async (page = 1, filter = []) => {
        console.log(filter)
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
        if (filter.deliveryDate && filter.deliveryDate.length > 0) {
            link += `&startDate=${filter.deliveryDate[0].format("YYYY-MM-DD")}&endDate=${filter.deliveryDate[1].format("YYYY-MM-DD")}`
        }
        if (filter.id && filter.id.length > 0) {
            link += `&search=${filter.id[0]}`
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
        }
    }, [user, fetchOrders, orderType])

    const isOrderStatusDisabled = (value, permission) => {
        if (permissions.includes('CHANGE_STATUS')) {
            return false;
        }
        return !(permissions.includes(permission) && value > currentOrderStatus);


    }
    const transformStatusArray = (statuses, textKey) => {
        return statuses.map(({value, label, color}) => {
            const object = {};
            object[textKey] = label;
            object['value'] = value;
            object['color'] = color;
            object['disabled'] = value === 1 ? currentOrderStatus > 1 : isOrderStatusDisabled(`ORDER_${label}`);
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

    const onTabChange = (key) => {
        const orderType = key === 1 ? 'Marketplace' : 'Merchant'
        setOrderType(orderType);
        // fetchOrders(1);
    }
    const showStatusModal = (data, id) => {
        statusForm.setFieldValue('status', data);
        setCurrentOrderStatus(data);
        setChangedOrderStatus(data);
        setIsModalOpen(true);
        setOrderId(id);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
        statusForm.resetFields();
    }

    const getOrderStatusInfo = (data) => {
        const status = OrderStatusEnum.find(status => status.value === data);
        if (status) {
            return { label: status.label, color: status.color };
        } else {
            return null; // Return null if the value is not found
        }
    };
    const renderStatus = (data, record, index) => {
        const {label, color } = getOrderStatusInfo(data)
        return <Tag color={color} style={{cursor: "pointer", fontWeight: 700}}
                    onClick={() => showStatusModal(data, record.id)}>{label}</Tag>
    }

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        console.log(selectedKeys)
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };
    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({setSelectedKeys, selectedKeys, confirm, clearFilters, close}) => (
            <div
                style={{
                    padding: 8,
                }}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{
                        marginBottom: 8,
                        display: 'block',
                    }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined/>}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters, selectedKeys, dataIndex)}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({
                                closeDropdown: false,
                            });
                            setSearchText(selectedKeys[0]);
                            setSearchedColumn(dataIndex);
                        }}
                    >
                        Filter
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            close();
                        }}
                    >
                        close
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined
                style={{
                    color: filtered ? '#1677ff' : undefined,
                }}
            />
        ),

        render: (data) =>
            searchedColumn === dataIndex ? (
                <NavLink to={`${formatOrderNumber(data)}`}>
                    <Highlighter
                        highlightStyle={{
                            backgroundColor: '#ffc069',
                            padding: 0,
                        }}
                        searchWords={[searchText]}
                        autoEscape
                        textToHighlight={formatOrderNumber(data) ? formatOrderNumber(data) : ''}
                    />
                </NavLink>
            ) : (
                <NavLink to={`${formatOrderNumber(data)}`}>{formatOrderNumber(data)}</NavLink>
            ),
    });
    const onChangeFilterDeliveryDates = (dates) => {
        console.log(dates)
        let filteredDates = {};
        if(dates) {
            filteredDates = {
                startDate:dates[0].format("YYYY-MM-DD"),
                endDate: dates[1].format("YYYY-MM-DD")
            }
        }

    }

    const handleFilterDeliveryDates = (dates, confirm, dataIndex) => {
        let filteredDates = {};
        if(dates) {
            filteredDates = {
                startDate:dates[0].format("YYYY-MM-DD"),
                endDate: dates[1].format("YYYY-MM-DD")
            }
        }
        setFilteredDeliveryDates(filteredDates);
        confirm();
    }
    const filterDeliveryDates = (dataIndex) => ({
        filterDropdown: ({setSelectedKeys, selectedKeys, confirm, clearFilters, close}) => (
            <div
                style={{
                    padding: 8,
                }}
                onKeyDown={(e) => e.stopPropagation()}
            >


                <Space direction="vertical" size={12}>
                    <RangePicker
                        format="DD/MM/YYYY"
                        onChange={(dates) => setSelectedKeys(dates)}
                    />
                    <Space>
                        <Button
                            type="primary"
                            onClick={() => handleFilterDeliveryDates(selectedKeys, confirm, dataIndex)}
                            icon={<SearchOutlined/>}
                            size="small"
                            style={{
                                width: 90,
                            }}
                        >
                            Go
                        </Button>
                        <Button
                            type="link"
                            size="small"
                            onClick={() => {
                                close();
                            }}
                        >
                            close
                        </Button>
                    </Space>

                </Space>
            </div>
        ),

        render: (data) => dayjs(data).format('MMMM DD, YYYY'),

    });


    const columns = [
        {
            title: 'Order ID',
            dataIndex: 'id',
            key: 'id',
            ...getColumnSearchProps('id')
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
            filters: transformStatusArray(OrderStatusEnum, 'text'),
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
            ...filterDeliveryDates('deliveryDate')
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

    const updateOrderStatus = async (data) => {
        const postData = {
            orderId,
            newStatus: data.status,
            statusComment: data.statusComment
        };

        setStatusLoading(true);

        try {
            const response = await axiosClient.post('/orders/updateOrderStatus', postData);
            const order = response.data;
            const target = orders.find((obj) => obj.id === order.id);
            Object.assign(target, order);
            setIsModalOpen(false);
            toast.success("Successfully changed order status to updated status");
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            toast.error(message);
        } finally {
            setStatusLoading(false);
        }
    };

    const onChangeOrderStatus = (data) => {
        setChangedOrderStatus(data)
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
                        {/*// Implement Something here*/}
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
                            onChange={onChangeOrderStatus}
                            options={transformStatusArray(OrderStatusEnum, 'label')}
                        />
                    </Form.Item>
                    <Form.Item
                        name="statusComment"
                        label="Status Comment"
                    >
                        <TextArea rows={4}/>
                    </Form.Item>
                    <Form.Item>
                        <Button disabled={currentOrderStatus === changedOrderStatus} type="primary"
                                className='float-right' htmlType="submit" loading={statusLoading}>
                            Submit
                        </Button>
                    </Form.Item>
                </Form>


            </Modal>
        </Space>
    )
}

export default Sales
