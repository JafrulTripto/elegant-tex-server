import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Avatar, Button, Card, Col, Form, Input, Modal, Row, Select, Space, Table, Tag, theme, Tooltip } from "antd";
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import useAxiosClient from "../axios-client.js";
import { useStateContext } from "../contexts/ContextProvider";
import Permission from "../components/Util/Permission";
import { UserStatusEnum } from "../utils/enums/UserStatusEnum";
import dayjs from "dayjs";

const Users = (callback, deps) => {
    const axiosClient = useAxiosClient();
    const navigate = useNavigate()
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [statusLoading, setStatusLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userStatus, setUserStatus] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    const [statusForm] = Form.useForm();
    const { token } = theme.useToken();


    const [searchText, setSearchText] = useState('');
    const [filterStatus, setFilterStatus] = useState(null);
    const [sortedInfo, setSortedInfo] = useState({});

    const { user, roles } = useStateContext();

    const fetchUsers = useCallback(async (page = 1, search = searchText, status = filterStatus, sort = sortedInfo) => {
        setLoading(true);
        try {
            let link = `/users/index?page=${page}`;
            if (search) link += `&search=${search}`;
            if (status !== null) link += `&status=${status}`;
            if (sort.field && sort.order) {
                link += `&sort_by=${sort.field}&sort_order=${sort.order === 'ascend' ? 'asc' : 'desc'}`;
            }

            const users = await axiosClient.get(link);
            setLoading(false);
            const userData = users.data.data.map((data) => {
                return { ...data, key: data.id }
            })
            setUsers(userData);
            setTotal(users.data.total)
        } catch (error) {
            toast.error(error.response.data.message);
            setLoading(false);
        }
    }, [axiosClient, searchText, filterStatus, sortedInfo])

    useEffect(() => {
        fetchUsers();
    }, []) // Only run on mount

    const handleSearch = (value) => {
        setSearchText(value);
        setPage(1);
        fetchUsers(1, value, filterStatus, sortedInfo);
    };

    const handleFilterStatusChange = (value) => {
        setFilterStatus(value);
        setPage(1);
        fetchUsers(1, searchText, value, sortedInfo);
    };

    const handleTableChange = (pagination, filters, sorter) => {
        setPage(pagination.current);
        setPageSize(pagination.pageSize);
        setSortedInfo(sorter);
        fetchUsers(pagination.current, searchText, filterStatus, sorter);
    };

    const addNewUser = () => {
        navigate('/users/userForm')
    }


    const renderUserAvater = (image) => {
        if (image) {
            const imagePath = `${process.env.REACT_APP_API_BASE_URL}/files/upload/${image.id}`
            return (
                <Avatar
                    src={imagePath}
                    size={{ xs: 24, sm: 32, md: 32 }}
                />
            )
        }
        return <Avatar size={{ xs: 24, sm: 32, md: 32 }} icon={<UserOutlined />} />

    }
    const handleUserDetails = (record) => {
        navigate(`/users/${record.firstname}_${record.lastname}`, { state: { id: record.id } })
    }

    const renderActionButtons = (record) => {
        return (
            <Space size="small">
                <Tooltip title="View Details">
                    <Button
                        type="text"
                        shape="circle"
                        icon={<EyeOutlined style={{ color: token.colorPrimary }} />}
                        onClick={() => handleUserDetails(record)}
                    />
                </Tooltip>

                <Permission required={"UPDATE_USER"}>
                    <Tooltip title="Edit User">
                        <Button
                            type="text"
                            shape="circle"

                            className='edit-btn'
                            icon={<EditOutlined style={{ color: token.colorWarning }} />}
                            onClick={() => handleEditUser(record)}
                        />
                    </Tooltip>
                </Permission>

                <Permission required={"DELETE_USER"}>
                    <Tooltip title="Delete User">
                        <Button
                            type="text"
                            shape="circle"
                            danger
                            disabled={record.id === user.id}
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteUser(record)}
                        />
                    </Tooltip>
                </Permission>
            </Space>
        );
    }
    const handleOk = () => {


    };

    const showStatusModal = (data, record) => {
        if (user.id === record.id) {
            return
        }
        setIsModalOpen(true);
        statusForm.setFieldsValue({
            status: data
        });
        setSelectedUser(record.id)
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    }
    const handleStatusChange = (status) => {
        setUserStatus(status);
    }
    const handleEditUser = (record) => {
        navigate('/users/userForm', { state: { user: record } })
    }

    const handleDeleteUser = (record) => {
        Modal.confirm({
            title: 'Are you sure want to delete this user data?',
            okText: "Yes",
            okType: "danger",
            onOk: () => confirmDeleteUser(record.id)
        })
    }

    const confirmDeleteUser = async (id) => {
        try {
            const url = `/users/delete?id=${id}`;
            const data = await axiosClient.get(url);
            toast.warning(data.data.message);
            fetchUsers(page, searchText, filterStatus, sortedInfo);

        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            toast.error(message);
        }
    }

    const renderUserName = (record, user) => {
        return <span style={{ fontWeight: 600, color: token.colorTextHeading }}>{user.firstname} {user.lastname}</span>; // Use colorTextHeading
    }

    const renderStatus = (data, record, index) => {
        const statusColor = !data ? 'error' : 'success';
        return <Tag color={statusColor} style={{ cursor: "pointer", fontWeight: 700 }}
            onClick={() => showStatusModal(data, record)}>{UserStatusEnum[data]}</Tag>
    }
    const userStatusOptions = [
        {
            label: "ACTIVE",
            value: 1
        },
        {
            label: "INACTIVE",
            value: 0
        }
    ]

    const columns = [
        {
            title: 'User',
            dataIndex: 'image',
            key: 'image',
            render: renderUserAvater
        },
        {
            title: 'Name',
            dataIndex: 'firstname',
            key: 'firstname',
            render: renderUserName,
            sorter: true,
            sortOrder: sortedInfo.columnKey === 'firstname' && sortedInfo.order,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            sorter: true,
            sortOrder: sortedInfo.columnKey === 'email' && sortedInfo.order,
        },
        {
            title: 'Phone',
            dataIndex: ['address', 'phone'],
            key: 'phone',
            render: (text) => text || <span style={{ color: token.colorTextDescription }}>N/A</span>
        },
        {
            title: 'Last Login',
            dataIndex: 'last_login',
            key: 'last_login',
            render: (data) => data ? <span style={{ color: token.colorTextSecondary }}>{dayjs(data).format('MMM D, YYYY h:mm A')}</span> : <span style={{ color: token.colorTextDescription }}>Never</span>,
            sorter: true,
            sortOrder: sortedInfo.columnKey === 'last_login' && sortedInfo.order,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: renderStatus,
            sorter: true,
            sortOrder: sortedInfo.columnKey === 'status' && sortedInfo.order,
        },
        {
            title: 'Action',
            key: "action",
            render: renderActionButtons
        }
    ];

    const submitUserStatus = () => {
        setStatusLoading(true);
        statusForm.validateFields().then(async (values) => {
            try {
                const response = await axiosClient.put(`/users/changeStatus/${selectedUser}`, values);
                toast.success(response.data.message)
                setIsModalOpen(false)
                await fetchUsers(page, searchText, filterStatus, sortedInfo)
                setStatusLoading(false);
            } catch (error) {
                const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
                toast.error(message);
                setStatusLoading(false);
            }
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
            <Card bordered={false} className='shadow-sm hover:shadow-md transition-shadow duration-300'>
                <Row justify='space-between' align="middle" gutter={[16, 16]}>
                    <Col>
                        <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: token.colorTextHeading, margin: 0 }}>Users</h1>
                    </Col>
                    <Col>
                        <Space>
                            <Input.Search
                                placeholder="Search users..."
                                onSearch={handleSearch}
                                style={{ width: 250 }}
                                allowClear
                            />
                            <Select
                                placeholder="Filter by status"
                                style={{ width: 150 }}
                                onChange={handleFilterStatusChange}
                                allowClear
                                options={[
                                    { label: 'All', value: null },
                                    { label: 'Active', value: 1 },
                                    { label: 'Inactive', value: 0 },
                                ]}
                            />
                            <Button type="primary" onClick={addNewUser} icon={<PlusOutlined />}>Add User</Button>
                        </Space>
                    </Col>
                </Row>
            </Card>
            <Card bordered={false} className='shadow-sm'>
                <Table
                    dataSource={users}
                    columns={columns}
                    loading={loading}
                    scroll={{ x: 600 }}
                    size={'middle'}
                    onChange={handleTableChange}
                    pagination={{
                        current: page,
                        pageSize: pageSize,
                        total: total,
                        showSizeChanger: true,
                    }}
                />
            </Card>
            <Modal
                title="Change User Status"
                confirmLoading={statusLoading}
                width={400}
                onOk={submitUserStatus}
                onCancel={handleCancel}
                open={isModalOpen}
            >
                <Form
                    form={statusForm}
                    name={"statusForm"}
                    layout='vertical'
                    initialValues={{
                        remember: true,
                    }}
                    onFinish={submitUserStatus}
                >
                    <Form.Item
                        name="status"
                        label="Status"
                        rules={[
                            {
                                required: true,
                                message: `Status is required!`,
                            },
                        ]}
                    >
                        <Select
                            value={userStatus}
                            style={{ width: "100%" }}
                            onChange={handleStatusChange}
                            options={userStatusOptions}
                        />
                    </Form.Item>
                </Form>

            </Modal>
        </Space>

    )
};

export default Users;
