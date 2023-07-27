import React, {useCallback, useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";
import {Avatar, Button, Card, Col, Form, Input, Modal, Row, Select, Space, Table, Tag} from "antd";
import {DeleteOutlined, EditOutlined, InfoOutlined, PlusOutlined, UserOutlined} from "@ant-design/icons";
import useAxiosClient from "../axios-client.js";
import {useStateContext} from "../contexts/ContextProvider";
import Permission from "../components/Util/Permission";
import {UserStatusEnum} from "../utils/enums/UserStatusEnum";
import {colors} from "../utils/Colors";
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


    const {user, roles} = useStateContext();

    const fetchUsers = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const link = page > 1 ? `/users/index?page=${page}` : "/users/index"
            const users = await axiosClient.get(link);
            setLoading(false);
            const userData = users.data.data.map((data) => {
                return {...data, key: data.id}
            })
            setUsers(userData);
            setTotal(users.data.total)
        } catch (error) {
            toast.error(error.response.data.message);
            setLoading(false);
        }
    }, [axiosClient])

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers])


    const addNewUser = () => {
        navigate('/users/userForm')
    }


    const renderUserAvater = (image) => {
        if (image) {
            const imagePath = `${process.env.REACT_APP_API_BASE_URL}/files/upload/${image.id}`
            return (
                <Avatar
                    src={imagePath}
                    size={{xs: 24, sm: 32, md: 32}}
                />

            )
        }
        return <Avatar size={{xs: 24, sm: 32, md: 32}} icon={<UserOutlined/>}/>

    }
    const handleUserDetails = (record) => {
        navigate(`/users/${record.firstname}_${record.lastname}`, {state: {id: record.id}})
    }

    const renderActionButtons = (record) => {
        return (
            <Space size="middle">
                <Button type="primary" icon={<InfoOutlined/>} size={"small"} onClick={() => handleUserDetails(record)}/>
                <Button type="primary" disabled className='edit-btn' icon={<EditOutlined/>} size={"small"}
                        onClick={() => handleEditUser(record)}/>
                <Permission required={"DELETE_USER"}>
                    <Button type="primary" danger disabled={record.id === user.id} icon={<DeleteOutlined/>}
                            size={"small"} onClick={() => handleDeleteUser(record)}/>
                </Permission>
            </Space>
        );
    }
    const handleOk = () => {


    };

    const showStatusModal = (data, record) => {
        if (user.id === record.id){
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
            fetchUsers();

        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            toast.error(message);
        }
    }

    const renderUserName = (record, user) => {
        return `${user.firstname} ${user.lastname}`;
    }

    const renderStatus = (data, record, index) => {
        return <Tag color={!data? colors.red : colors.green} style={{cursor: "pointer", fontWeight: 700}}
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
            key: 'name',
            render: renderUserName
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Last Login',
            dataIndex: 'last_login',
            key: 'last_login',
            render: (data) => data ? dayjs(data).format('MMMM Do YYYY, h:mm a') : "Never"
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: renderStatus
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
                await fetchUsers()
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
            <Card className='shadow'>
                <Row justify='space-between'>
                    <Col xs={{span: 24}} lg={{span: 20}}></Col>
                    <Col xs={{span: 24}} lg={{span: 4}} flex={"inherit"}>
                        <Button type="primary" onClick={addNewUser} icon={<PlusOutlined/>}>Add User</Button>
                    </Col>
                </Row>
            </Card>
            <Card className='shadow'>
                <Table
                    dataSource={users}
                    columns={columns}
                    loading={loading}
                    scroll={{x: 400}}
                    size={'small'}
                    pagination={{
                        current: page,
                        pageSize: pageSize,
                        total: total,
                        onChange: (page, pageSize) => {
                            setPage(page)
                            setPageSize(pageSize)
                            fetchUsers(page)
                        }
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
                            style={{width: "100%"}}
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
