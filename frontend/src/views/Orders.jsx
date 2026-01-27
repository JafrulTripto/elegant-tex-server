import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Table, Tag, Tabs, Space, Button, Typography, Avatar, Tooltip, Modal, Form, Select, Input, Row, Col, DatePicker } from 'antd';
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { EditOutlined, DeleteOutlined, UserOutlined, EyeOutlined } from '@ant-design/icons'
import { useStateContext } from "../contexts/ContextProvider.jsx";
import useAxiosClient from "../axios-client.js";
import Permission from "../components/Util/Permission.jsx";
import { OrderTypeEnum } from "../utils/enums/OrderTypeEnum.js";
import { formatOrderNumber } from "../components/Util/OrderNumberFormatter";
import dayjs from "dayjs";
import { OrderStatusEnum } from "../utils/enums/OrderStatusEnum";
import OrderStats from "../components/Order/OrderStats";
import TextArea from "antd/es/input/TextArea";
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';

import ExportOrderExcel from "../components/Order/ExportOrderExcel";

const { Text } = Typography;

function Orders() {

  const axiosClient = useAxiosClient();
  const { user, permissions } = useStateContext();
  const navigate = useNavigate();

  // -- State --
  const [loading, setLoading] = useState(false);

  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, processing: 0, delivered: 0 });
  const [orderType, setOrderType] = useState('Marketplace');

  // -- Table Params State (Filters/Sorters) --
  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10 },
    filters: {},
    sortField: null,
    sortOrder: null,
    searchText: '',
    searchedColumn: '',
  });

  // -- Modal State --

  // -- Modal State --
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [currentOrderStatus, setCurrentOrderStatus] = useState(null);
  const [changedOrderStatus, setChangedOrderStatus] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [statusForm] = Form.useForm();
  const [modal, contextHolder] = Modal.useModal();

  // -- Fetch Data --
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const userId = user.id;
    let link = orderType === 'Marketplace' ? `/orders/getMarketplaceOrders/${userId}?` : `/orders/getMerchantOrders?`;

    const { pagination, filters, sortField, sortOrder, searchText, searchedColumn } = tableParams;

    // Construct query parameters
    const params = {
      page: pagination.current,
      status: filters.status ? filters.status.join(',') : undefined,
      sortField: sortField,
      sortOrder: sortOrder,
      [searchedColumn]: searchText || undefined, // Dynamic search field (id or orderedBy)
    };

    // Delivery Date Range Filter
    if (filters.deliveryDate && filters.deliveryDate.length > 0) {
      // filters.deliveryDate comes as [[startDayjs, endDayjs]] because we wrapped it in [dates] in setSelectedKeys
      const dateRange = filters.deliveryDate[0];
      if (dateRange && dateRange.length === 2) {
        params.startDate = dayjs(dateRange[0]).format('YYYY-MM-DD');
        params.endDate = dayjs(dateRange[1]).format('YYYY-MM-DD');
      }
    }

    const queryParams = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== '' && value !== null)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    try {
      const response = await axiosClient.get(`${link}${queryParams}`);
      setLoading(false);
      const ordersData = response.data.data.map(data => ({ ...data, key: data.id }));
      setOrders(ordersData);

      setTableParams(prev => ({
        ...prev,
        pagination: {
          ...prev.pagination,
          total: response.data.meta.total,
          current: response.data.meta.current_page,
          pageSize: response.data.meta.per_page,
        }
      }));

    } catch (error) {
      // Handle error safely
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      toast.error(message);
      setLoading(false);
    }
  }, [axiosClient, user.id, orderType, tableParams.pagination.current, tableParams.filters, tableParams.sortField, tableParams.sortOrder, tableParams.searchText, tableParams.searchedColumn]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await axiosClient.get(`/orders/getStats/${user.id}`);
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  }, [axiosClient, user.id]);

  // Initial Fetch & Refresh on params change
  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchStats();
    }
  }, [fetchOrders, fetchStats]); // Runs when tableParams or orderType changes


  // -- Handlers --

  const handleTabChange = (key) => {
    const type = key === '1' ? 'Marketplace' : 'Merchant';
    setOrderType(type);
    setTableParams(prev => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1 }
    }));
  }

  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters,
      sortOrder: Array.isArray(sorter) ? undefined : sorter.order,
      sortField: Array.isArray(sorter) ? undefined : sorter.field,
      searchText: tableParams.searchText, // Preserve search
      searchedColumn: tableParams.searchedColumn
    });

    if (pagination.pageSize !== tableParams.pagination.pageSize) {
      setOrders([]); // Clear data to show loading state better
    }
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setTableParams(prev => ({
      ...prev,
      searchText: selectedKeys[0],
      searchedColumn: dataIndex,
      pagination: { ...prev.pagination, current: 1 }
    }));
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setTableParams(prev => ({
      ...prev,
      searchText: '',
      searchedColumn: '',
      pagination: { ...prev.pagination, current: 1 }
    }));
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    render: (text) =>
      tableParams.searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[tableParams.searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const getColumnDateRangeProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <DatePicker.RangePicker
          style={{ marginBottom: 8, display: 'flex' }}
          value={selectedKeys[0]}
          onChange={(dates) => setSelectedKeys(dates ? [dates] : [])}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => {
              confirm();
            }}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Filter
          </Button>
          <Button
            onClick={() => {
              clearFilters && handleReset(clearFilters);
              confirm();
            }}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
  });

  const handleNewOrder = (type) => {
    navigate('/orders/orderForm', { state: { orderType: type, update: false } })
  }

  const handleEdit = (record) => {
    navigate('/orders/editOrderForm', { state: { orderType: record.orderType, update: true, order: record } })
  }

  const handleViewDetails = (record) => {
    navigate(`/orders/${formatOrderNumber(record.id)}`);
  }

  const handleDelete = (record) => {
    modal.confirm({
      title: 'Delete Order?',
      content: `Are you sure you want to delete order ${formatOrderNumber(record.id)}?`,
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          const res = await axiosClient.delete(`/orders/delete/${record.id}`);
          toast.warning(res.data.message);
          fetchOrders();
        } catch (error) {
          toast.error(error.message);
        }
      }
    })
  }

  // -- Status Helper --
  const getStatusConfig = (statusVal) => {
    const status = OrderStatusEnum.find(s => s.value === statusVal);
    return status ? { label: status.label, color: status.color } : { label: 'Unknown', color: 'default' };
  }

  const showStatusModal = (statusVal, id) => {
    // Permission check can be added here if needed
    statusForm.setFieldValue('status', statusVal);
    setCurrentOrderStatus(statusVal);
    setChangedOrderStatus(statusVal);
    setOrderId(id);
    setIsModalOpen(true);
  };

  const updateOrderStatus = async (values) => {
    setStatusLoading(true);
    try {
      const postData = {
        orderId,
        newStatus: values.status,
        statusComment: values.statusComment
      };
      await axiosClient.post('/orders/updateOrderStatus', postData);
      toast.success("Order status updated successfully");
      setIsModalOpen(false);
      fetchOrders();
    } catch (error) {
      const message = (error.response?.data?.message) || error.message;
      toast.error(message);
    } finally {
      setStatusLoading(false);
    }
  };

  // -- Table Columns --
  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      ...getColumnSearchProps('id'),
      render: (id) => (
        <NavLink to={`${formatOrderNumber(id)}`} className="font-mono text-blue-600 hover:text-blue-800 font-medium">
          {formatOrderNumber(id)}
        </NavLink>
      )
    },
    {
      title: 'Items',
      key: 'items',
      render: (_, record) => (
        <span className="text-slate-500">{record.itemsCount || 0} items</span>
      )
    },
    {
      title: 'Ordered By',
      dataIndex: 'orderedBy',
      key: 'orderedBy',
      ...getColumnSearchProps('orderedBy'),
      render: (text) => (
        <div className="flex items-center gap-2">
          <Avatar size="small" style={{ backgroundColor: '#fde3cf', color: '#f56a00' }}>
            {text ? text.charAt(0).toUpperCase() : <UserOutlined />}
          </Avatar>
          <span className="font-medium text-slate-700 dark:text-slate-200">{text}</span>
        </div>
      )
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      render: (date) => <span className="text-slate-500">{dayjs(date).format('MMM D, YYYY')}</span>
    },
    {
      title: 'Delivery',
      dataIndex: 'deliveryDate',
      key: 'deliveryDate',
      sorter: true,
      ...getColumnDateRangeProps('deliveryDate'),
      render: (date) => <span className="text-slate-500">{dayjs(date).format('MMM D, YYYY')}</span>
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      sorter: true,
      render: (amount) => (
        <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
          {new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(amount)}
        </span>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: OrderStatusEnum.map(status => ({ text: status.label, value: status.value })),
      render: (status, record) => {
        const config = getStatusConfig(status);
        return (
          <Tag
            color={config.color}
            className="cursor-pointer rounded-full px-3 py-0.5 border-0 font-medium select-none transform hover:scale-105 transition-transform"
            onClick={() => showStatusModal(status, record.id)}
          >
            {config.label}
          </Tag>
        )
      }
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button type="text" shape="circle" icon={<EyeOutlined className="text-blue-500" />} onClick={() => handleViewDetails(record)} />
          </Tooltip>
          <Permission required={'EDIT_ORDER'}>
            <Tooltip title="Edit Order">
              <Button type="text" shape="circle" icon={<EditOutlined className="text-orange-500" />} onClick={() => handleEdit(record)} />
            </Tooltip>
          </Permission>
          <Permission required={'DELETE_ORDER'}>
            <Tooltip title="Delete Order">
              <Button type="text" shape="circle" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
            </Tooltip>
          </Permission>
        </Space>
      )
    }
  ];

  const tabItems = [
    { label: 'Marketplace', key: '1' },
  ];
  if (permissions.includes("VIEW_MERCHANTS")) {
    tabItems.push({ label: 'Merchant', key: '2' });
  }

  return (
    <div className="animate-fade-in p-2">

      {/* 1. Stats Section */}
      <OrderStats total={stats.total} pending={stats.pending} processing={stats.processing} delivered={stats.delivered} />

      {/* 2. Filters & Actions Section */}
      <Card className='shadow mb-4'>
        <Row justify='space-between' align="middle">
          <Col>
            <Permission required={'EXPORT_ORDERS'}>
              <ExportOrderExcel />
            </Permission>
          </Col>
          <Col>
            <Space>
              <Permission required={'CREATE_MERCHANT_ORDER'}>
                <Button type="dashed" onClick={() => handleNewOrder(OrderTypeEnum.MERCHANT)}>Merchant Order</Button>
              </Permission>
              <Permission required={'CREATE_MARKETPLACE_ORDER'}>
                <Button type="primary" onClick={() => handleNewOrder(OrderTypeEnum.MARKETPLACE)}>New Order</Button>
              </Permission>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 3. Main Data Section */}
      <Card bordered={false} className="shadow-sm rounded-xl overflow-hidden dark:bg-slate-800">
        <Tabs
          activeKey={orderType === 'Marketplace' ? '1' : '2'}
          onChange={handleTabChange}
          items={tabItems}
          className="px-4"
        />

        <Table
          columns={columns}
          dataSource={orders}
          loading={loading}
          pagination={{
            ...tableParams.pagination,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} orders`
          }}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
          rowKey="id"
        />
      </Card>

      {/* Status Modal */}
      <Modal
        title="Update Order Status"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
      >
        <Form
          form={statusForm}
          layout="vertical"
          onFinish={updateOrderStatus}
          className="mt-4"
        >
          <Form.Item name="status" label="Status">
            <Select options={OrderStatusEnum.map(s => ({ label: s.label, value: s.value }))} onChange={(val) => setChangedOrderStatus(val)} />
          </Form.Item>
          <Form.Item name="statusComment" label="Comment (Optional)">
            <TextArea rows={3} placeholder="Add a note about this status change..." />
          </Form.Item>
          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={statusLoading} disabled={currentOrderStatus === changedOrderStatus}>
              Update Status
            </Button>
          </div>
        </Form>
      </Modal>

      {contextHolder}
    </div>
  );
}

export default Orders;
