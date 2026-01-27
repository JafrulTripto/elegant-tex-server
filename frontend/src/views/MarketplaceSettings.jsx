import React, { useCallback, useEffect, useState } from 'react'
import { Space, Card, Modal, Form, Input, Button, Select, Row, Col, Typography, Avatar, Tooltip, Drawer, List } from 'antd'
import { toast } from 'react-toastify';
import useAxiosClient from "../axios-client.js";
import { DeleteOutlined, EditOutlined, PlusOutlined, GlobalOutlined, UserOutlined, TeamOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

const MarketplaceSettings = () => {

    const axiosClient = useAxiosClient();
    const [form] = Form.useForm();
    const [modal, contextHolder] = Modal.useModal();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const [updateDataId, setUpdateDataId] = useState(null)
    const [usersLoading, setUsersLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [marketplaces, setMarketplaces] = useState([]);
    const [marketplaceLoading, setMarketplaceLoading] = useState(false);

    // Team Drawer State
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [currentDrawerTeam, setCurrentDrawerTeam] = useState({ name: '', users: [] });

    // Pagination states
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

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

    useEffect(() => {
        const getUsers = async () => {
            setUsersLoading(true);
            const users = await axiosClient.get("/users/getRoleUsers");
            setUsers(users.data);
            setUsersLoading(false);
        }
        getUsers();
    }, [axiosClient])


    const handleOnClickButton = () => {
        setIsModalOpen(true);
    }

    const handleCancel = () => {
        form.resetFields();
        setIsModalOpen(false);
        setUpdateDataId(null);
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

    const handleOpenTeamDrawer = (record) => {
        setCurrentDrawerTeam({
            name: record.name,
            users: record.users || []
        });
        setDrawerVisible(true);
    }

    const handleCloseDrawer = () => {
        setDrawerVisible(false);
        setCurrentDrawerTeam({ name: '', users: [] });
    }

    const handleDeleteMarketplace = (record) => {
        modal.confirm({
            title: "Are you sure?",
            content: `Do you really want delete ${record.name}? This process cannot be undone.`,
            okText: 'Yes, Delete',
            okType: 'danger',
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

    return (
        <div className="animate-fade-in">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <Title level={2} className="!mb-0">Marketplace Settings</Title>
                    <Text type="secondary">Manage connected marketplaces and assigned teams</Text>
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleOnClickButton} size="large">
                    Add Marketplace
                </Button>
            </div>

            <Row gutter={[24, 24]}>
                {marketplaces.map((item) => (
                    <Col xs={24} sm={12} lg={8} xl={6} key={item.id}>
                        <Card
                            bordered={false}
                            className="h-full shadow-sm hover:shadow-lg transition-all duration-300 group border border-slate-200 dark:border-slate-700 !bg-white dark:!bg-slate-800"
                            actions={[
                                <Tooltip title="Edit">
                                    <EditOutlined key="edit" className="text-blue-500" onClick={() => handleEditMarketplace(item)} />
                                </Tooltip>,
                                <Tooltip title="Delete">
                                    <DeleteOutlined key="delete" className="text-red-500" onClick={() => handleDeleteMarketplace(item)} />
                                </Tooltip>
                            ]}
                        >
                            <Card.Meta
                                title={
                                    <div className="flex items-center justify-between mb-2">
                                        <Text strong className="text-lg">{item.name}</Text>
                                        {item.pageLink && (
                                            <a href={item.pageLink} target="_blank" rel="noopener noreferrer" className="text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                                                <GlobalOutlined />
                                            </a>
                                        )}
                                    </div>
                                }
                                description={
                                    <div>
                                        <div className="mb-3 text-xs uppercase font-semibold text-slate-400 dark:text-slate-500 tracking-wider">Assigned Team</div>
                                        <div className="h-10 flex items-center">
                                            {item.users && item.users.length > 0 ? (
                                                <Tooltip title="Click to view full team">
                                                    <div
                                                        className="cursor-pointer p-1 -ml-1 transition-opacity hover:opacity-80 outline-none focus:outline-none ring-0 border-none"
                                                        onClick={() => handleOpenTeamDrawer(item)}
                                                    >
                                                        <Avatar.Group maxCount={4} maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>
                                                            {item.users.map(user => (
                                                                <Avatar key={user.id} style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />}>
                                                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                                                </Avatar>
                                                            ))}
                                                        </Avatar.Group>
                                                    </div>
                                                </Tooltip>
                                            ) : (
                                                <Text className="italic text-sm text-slate-400 dark:text-slate-500">No users assigned</Text>
                                            )}
                                        </div>
                                    </div>
                                }
                            />
                        </Card>
                    </Col>
                ))}
            </Row>


            <Modal
                title={updateDataId ? "Edit Marketplace" : "Add New Marketplace"}
                open={isModalOpen}
                okText={updateDataId ? "Update" : "Create"}
                okType='primary'
                onCancel={handleCancel}
                footer={null}
            >
                <Form
                    form={form}
                    layout='vertical'
                    onFinish={onFinish}
                    className="mt-4"
                >
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: 'Please input page name!' }]}
                    >
                        <Input placeholder="e.g. Amazon US" size="large" />
                    </Form.Item>
                    <Form.Item
                        name="pageLink"
                        label="Page Link"
                        rules={[{ required: true, message: 'Please input your page link!' }]}
                    >
                        <Input prefix={<GlobalOutlined className="text-slate-400" />} placeholder="https://..." size="large" />
                    </Form.Item>
                    <Form.Item
                        name='users'
                        label="Assigned Users"
                        rules={[{ required: true, message: 'Please select users!' }]}
                    >
                        <Select
                            loading={usersLoading}
                            mode="multiple"
                            allowClear
                            placeholder="Select team members"
                            size="large"
                            maxTagCount="responsive"
                        >
                            {users.map(data => (
                                <Option value={data.id} key={data.id}>{data.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item className="mb-0 text-right">
                        <Space>
                            <Button onClick={handleCancel}>Cancel</Button>
                            <Button type="primary" htmlType="submit" loading={isLoading}>
                                {updateDataId ? "Update" : "Create"}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Team Members Drawer */}
            <Drawer
                title={
                    <div className="flex items-center space-x-2">
                        <TeamOutlined className="text-blue-500" />
                        <Text strong className="text-lg">{currentDrawerTeam.name} - Team</Text>
                    </div>
                }
                placement="right"
                onClose={handleCloseDrawer}
                open={drawerVisible}
                width={350}
            >
                {currentDrawerTeam.users.length > 0 ? (
                    <List
                        itemLayout="horizontal"
                        dataSource={currentDrawerTeam.users}
                        renderItem={(user) => (
                            <List.Item>
                                <List.Item.Meta
                                    avatar={
                                        <Avatar
                                            size="large"
                                            style={{ backgroundColor: '#87d068' }}
                                            icon={<UserOutlined />}
                                        >
                                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                        </Avatar>
                                    }
                                    title={<Text strong>{user.name}</Text>}
                                    description={
                                        <Text type="secondary" className="text-xs">
                                            {/* Role or ID could go here if available */}
                                            Team Member
                                        </Text>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <TeamOutlined className="text-4xl mb-3 opacity-30" />
                        <p>No members assigned to this marketplace.</p>
                    </div>
                )}
            </Drawer>

            {contextHolder}
        </div>
    )
}

export default MarketplaceSettings;
