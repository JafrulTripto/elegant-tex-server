import React, { useCallback, useEffect, useState } from 'react';
import { toast } from "react-toastify";
import { Button, Card, Col, Form, Input, List, Modal, Row, Space, Typography, Tabs } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import useAxiosClient from "../axios-client.js";
import RolePermissions from "../components/Settings/RoleSettings/RolePermissions.jsx";
import AssignUserRoles from "../components/Settings/RoleSettings/AssignUserRoles.jsx";
import { colors } from "../utils/Colors.js";


const RoleSettings = () => {

  const axiosClient = useAxiosClient();
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const [roles, setRoles] = useState([]);
  const [role, setRole] = useState(null);
  const { Title } = Typography;


  const getRoles = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosClient.get(`/settings/getRoles`);
      setRoles(response.data);
      if (response.data.length) {
        setRole(response.data[0].name)
      }

    } catch (error) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      toast.error(message);
      setIsLoading(false);
    }

    setIsLoading(false);
  }, [axiosClient])


  useEffect(() => {
    getRoles();
  }, [getRoles])


  const handleOnClickButton = () => {
    setIsModalOpen(true);
  }


  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
  };
  const onFinish = async (data) => {
    try {
      setIsLoading(true);
      const response = await axiosClient.post(`/settings/createRole`, data);
      setIsLoading(false);
      toast.success(response.data.message);
      setIsModalOpen(false);
      getRoles();
    } catch (error) {
      toast.error(error.response.statusText);
    }
  }

  const editRole = (item) => {
  }
  const handleDeleteRole = (role) => {
    const roleId = role.id;
    Modal.confirm({
      title: `Are you sure want to delete ${role.name} role?`,
      okText: "Yes",
      okType: "danger",
      onOk: () => confirmDeleteRole(roleId)
    })
  }
  const confirmDeleteRole = (item) => {
    axiosClient.get(`/roles/deleteRole?roleId=${item}`).then(response => {
      toast.success(response.data);
      getRoles();
    })
  }
  const assignUserRole = (item) => {
    setRole(item);
  }


  const items = [
    {
      key: '1',
      label: 'Permissions',
      children: role ? <RolePermissions role={role} /> : null,
    },
    {
      key: '2',
      label: 'Assigned Users',
      children: role ? <AssignUserRoles role={role} /> : null,
    },
  ];

  return (
    <div className="animate-fade-in h-[calc(100vh-100px)]">
      <Row gutter={24} className="h-full">
        {/* Left Sidebar: Role List */}
        <Col xs={24} md={8} lg={6} className="h-full flex flex-col border-r border-slate-200 dark:border-slate-700 pr-4">
          <div className="mb-4 flex justify-between items-center">
            <Title level={4} style={{ margin: 0 }}>Roles</Title>
            <Button type="primary" shape="circle" icon={<PlusOutlined />} onClick={handleOnClickButton} />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scroll">
            <List
              dataSource={roles}
              loading={isLoading}
              renderItem={(item) => (
                <div
                  key={item.id}
                  onClick={() => setRole(item.name)}
                  className={`p-3 mb-2 rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-between group
                                ${role === item.name
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-semibold shadow-sm'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }
                            `}
                >
                  <span>{item.name}</span>
                </div>
              )}
            />
          </div>
        </Col>

        {/* Right Content: Tabs & Details */}
        <Col xs={24} md={16} lg={18} className="h-full flex flex-col pl-4">
          {role ? (
            <Card className="h-full shadow-sm flex flex-col" bodyStyle={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Header */}
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                <div>
                  <Title level={3} style={{ margin: 0 }}>{role}</Title>
                  <span className="text-slate-400 text-sm">Manage permissions and users for this role</span>
                </div>
                <Space>
                  {/* Only show delete if not basic roles? Logic kept simple as per original */}
                  <Button danger onClick={() => handleDeleteRole(roles.find(r => r.name === role))}>
                    Delete Role
                  </Button>
                </Space>
              </div>

              {/* Tabs */}
              <div className="flex-1 overflow-hidden">
                <Tabs defaultActiveKey="1" items={items} className="h-full" />
              </div>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
              Select a role to view details
            </div>
          )}
        </Col>
      </Row>

      <Modal
        title="Add New Role"
        open={isModalOpen}
        okText="Create"
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
            label="Role Name"
            rules={[{ required: true, message: 'Please input role name!' }]}
          >
            <Input placeholder="e.g. Manager" size="large" />
          </Form.Item>
          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={handleCancel}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={isLoading}>
                Create Role
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoleSettings;
