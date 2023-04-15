import React, {useCallback, useEffect, useState} from 'react'
import {Space, Card, Modal, Form, Input, Button, Select, Table, Tag} from 'antd'
import {toast} from 'react-toastify';
import useAxiosClient from "../axios-client.js";
import AddNewItemLayout from "../components/Layouts/AddNewItemLayout.jsx";
import {DeleteOutlined, EditOutlined} from "@ant-design/icons";

const MarketplaceSettings = () => {

    const axiosClient = useAxiosClient();
    const [form] = Form.useForm();
    const [modal, contextHolder] = Modal.useModal();


    const {Option} = Select;
    const getAllMarketplaces = useCallback((page = 1) => {
        setMarketplaceLoading(true);
        const url = page > 1 ? `/settings/marketplace/index?page=${page}` : "/settings/marketplace/index"
        axiosClient.post(url).then((res) => {
            setMarketplaces(res.data.data);
            setMarketplaceLoading(false);
            setTotal(res.data.meta.total);
            setPageSize(res.data.meta.per_page)
        }).catch(error => {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            toast.error(message);
        })
    }, [axiosClient])


    useEffect(() => {
        getAllMarketplaces();
    }, [getAllMarketplaces])

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false)

    const [updateDataId, setUpdateDataId] = useState(null)

    const [usersLoading, setUsersLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [marketplaces, setMarketplaces] = useState([]);
    const [marketplaceLoading, setMarketplaceLoading] = useState(false);

    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);


    const getUsers = async () => {
        setUsersLoading(true);
        const users = await axiosClient.get("/users/getRoleUsers");
        return users.data;
    }

    useEffect(() => {
        const getUsers = async () => {
            setUsersLoading(true);
            const users = await axiosClient.get("/users/getRoleUsers");
            setUsers(users.data);
            setUsersLoading(false);
        }
        getUsers();
    }, [])


    const handleOnClickButton = () => {
        setIsModalOpen(true);
    }

    const handleCancel = () => {
        form.resetFields();
        setIsModalOpen(false);
    }

   const handleEditMarketplace = (record) => {
        setUpdateDataId(record.id);
        setIsModalOpen(true);
        const userIds = record.users.map((user) => {
            return user.id;
        });
        form.setFieldsValue({
            name: record.name,
            pageLink: record.pageLink,
            users: userIds
        })
    }

    const handleDeleteMarketplace = (record) => {
        modal.confirm({
            title: "Are you sure?",
            content: 'Do you realy want delete this record? This process cannot be undone.',
            onOk: () => confirmDeleteItem(record),
        })
    }
    const confirmDeleteItem = async (record) => {
        try {
            const response = await axiosClient.delete(`/settings/marketplace/delete/${record.id}`);
            toast.success(response.data.message);
            getAllMarketplaces();
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            toast.error(message);
        }

    }

    const renderActionButtons = (record) => {
        return (
            <Space size="middle">
                <Button type="primary" className='edit-btn' icon={<EditOutlined/>} size={"small"}
                        onClick={() => handleEditMarketplace(record)}/>
                <Button danger icon={<DeleteOutlined/>} size={"small"}
                        onClick={() => handleDeleteMarketplace(record)}/>
            </Space>
        );
    }

    const renderMarketplaceUsers = (users) => {
        return users.map(user => {
            return <Tag color="#108ee9" style={{fontWeight: "bold"}} key={user.id}>{user.name}</Tag>
        })

    }
    const onFinish = async (data) => {
        const route = updateDataId ? `/settings/marketplace/update/${updateDataId}` : '/settings/marketplace/store'
        try {
            setIsLoading(true);
            const response = await axiosClient.post(route, data);
            setIsLoading(false);
            toast.success(response.data.message);
            setIsModalOpen(false);
            getAllMarketplaces();
            setUpdateDataId(null)
            form.resetFields();
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            toast.error(message);
            setIsLoading(false);
            setUpdateDataId(null);
        }
    }
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Page Link',
            dataIndex: 'pageLink',
            key: 'pageLink',
        },
        {
            title: 'Users',
            dataIndex: 'users',
            key: 'users',
            render: renderMarketplaceUsers
        },
        {
            title: 'Action',
            key: "action",
            render: renderActionButtons
        }
    ];

    return (
        <>
            <Space
                direction="vertical"
                size="middle"
                style={{
                    display: 'flex',
                }}
            >
                <AddNewItemLayout buttonText="Marketplace" onClickButton={handleOnClickButton}/>
                <Card className='shadow'>
                    <Table
                        dataSource={marketplaces}
                        columns={columns}
                        loading={marketplaceLoading}
                        scroll={{x: 400}}
                        size={'small'}
                        pagination={{
                            current: page,
                            pageSize: pageSize,
                            total: total,
                            onChange: (page, pageSize) => {
                                setPage(page)
                                setPageSize(pageSize)
                                getAllMarketplaces(page)
                            }
                        }}
                    />
                </Card>
            </Space>
            <Modal
                title="Add New Page"
                open={isModalOpen}
                okText="Submit"
                okType='submit'
                footer={null}
                onCancel={handleCancel}>
                <Form
                    form={form}
                    name="marketplace"
                    className="login-form"
                    layout='vertical'
                    initialValues={{
                        remember: true,
                    }}
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[
                            {
                                required: true,
                                message: 'Please input page name!',
                            },
                        ]}
                    >
                        <Input placeholder="Name"/>
                    </Form.Item>
                    <Form.Item
                        name="pageLink"
                        label="Page Link"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your page link!',
                            },
                        ]}
                    >
                        <Input placeholder="Page Link"/>
                    </Form.Item>
                    <Form.Item

                        name='users'
                        label="Users"
                        rules={[
                            {
                                required: true,
                                message: 'Please select users!',
                            },

                        ]}>
                        <Select
                            loading={usersLoading}
                            mode="multiple"
                            allowClear>
                            {users.map(data => {
                                return <Option value={data.id} key={data.id}>{data.name}</Option>
                            })}
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={isLoading}>
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
            {contextHolder}
        </>

    )
}

export default MarketplaceSettings;
