import React, {useEffect, useState} from 'react';
import {toast} from "react-toastify";
import {Anchor, Button, Card, Col, Form, Input, List, Modal, Row, Space, Typography} from "antd";
import {PlusOutlined} from "@ant-design/icons";
import axiosClient from "../axios-client.js";
import RolePermissions from "../components/Settings/RoleSettings/RolePermissions.jsx";
import AssignUserRoles from "../components/Settings/RoleSettings/AssignUserRoles.jsx";
import {colors} from "../utils/Colors.js";


const RoleSettings = () => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const [roles, setRoles] = useState([]);
  const [role, setRole] = useState(null);
  const { Title } = Typography;


  useEffect(() => {
    getRoles();

  }, [])


  const handleOnClickButton = () => {
    setIsModalOpen(true);
  }

  const getRoles = async () => {
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

  const rolesListHeader = (<Row>
    <Col xl={16} md={12} sm={12}><Title level={3}>Roles</Title></Col>
    <Col xl={8} md={12} sm={12} type="flex" align="end">
      <Button type="primary" onClick={handleOnClickButton} icon={<PlusOutlined />}>Add Role</Button>
    </Col>
  </Row>)


  return (
    <>
      <Space
        direction="vertical"
        size="middle"
        style={{
          display: 'flex',
        }}
      >
        {/* <AddNewItemLayout buttonText="Add Role" onClickButton={handleOnClickButton} /> */}
        <Row gutter={[12, 12]}>

          <Col xs={24} md={8} lg={8}>
            <Card className='shadow'>
              <List
                style={{ height: 350 }}
                header={rolesListHeader}
                bordered
                loading={isLoading}
                dataSource={roles}
                renderItem={(item) => (
                  <List.Item key={item.id} className={item.name === role ? 'list-item-selected' : null}

                             actions={[
                               [
                                 <Button key="edit" type='link' size='small' onClick={() => editRole(item)}>Edit</Button>,
                                 <Button key="delete" type='text' size='small' danger onClick={() => handleDeleteRole(item)}>Delete</Button>
                               ]
                             ]}>
                    <Button onClick={() => assignUserRole(item.name)} type="link" style={{color: colors.secondary}}>{item.name}</Button>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          <Col xs={24} md={16} lg={16}>
            {role ? <AssignUserRoles role={role} /> : null}
          </Col>
          <Col xs={24} md={24} lg={24}>
            {role ? <RolePermissions role={role} /> : null}
          </Col>
        </Row>
      </Space>
      <Modal
        title="Add New Role"
        open={isModalOpen}
        okText="Submit"
        okType='submit'
        footer={null}
        onCancel={handleCancel}>
        <Form
          form={form}
          name="role_form"
          className="login-form"
          layout='vertical'
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
        >
          <Form.Item
            name="name"
            label="Role Name"
            rules={[
              {
                required: true,
                message: 'Please input your role name!',
              },
            ]}
          >
            <Input placeholder="Role Name" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default RoleSettings;
