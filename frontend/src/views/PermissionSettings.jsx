import React, {useEffect, useState} from 'react';
import {Button, Card, Col, Form, Input, List, Modal, Row, Space} from "antd";
import AddNewItemLayout from "../components/Layouts/AddNewItemLayout.jsx";
import {toast} from "react-toastify";
import axiosClient from "../axios-client.js";

const PermissionSettings = () => {
  const [form] = Form.useForm();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const [permissions, setPermissions] = useState([]);
  const [permission, setPermission] = useState(null);


  useEffect(() => {
    getPermissions();

    return () => {

    }
  }, [])


  const handleOnClickButton = () => {
    setIsModalOpen(true);
  }

  const getPermissions = async () => {
    setIsLoading(true);
    try {
      const response = await axiosClient.get(`/permissions/getPermissions`);
      setPermissions(response.data);
    } catch (error) {
      toast.error(error.response.data.message);
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
      const response = await axiosClient.post(`/permissions/createPermission`, data);
      setIsLoading(false);
      toast.success(response.data.message);
      setIsModalOpen(false);
      getPermissions();
    } catch (error) {
      toast.error(error.response.statusText);
    }
  }

  const editPermission = (item) => {
  }
  const handleDeletePermission = (permissionId) => {
    Modal.confirm({
      title: 'Are you sure want to delete this permission?',
      okText: "Yes",
      okType: "danger",
      onOk: () => confirmDeletePermission(permissionId)
    })
  }
  const confirmDeletePermission = (item) => {
    axiosClient.get(`/permissions/deletePermission?permissionId=${item}`).then(response => {
      toast.success(response.data);
      getPermissions();
    })
  }
  const assignUserPermission = (item) => {
    setPermission(item);
  }



  return (
    <>
      <Space
        direction="vertical"
        size="middle"
        style={{
          display: 'flex',
        }}
      >
        <AddNewItemLayout buttonText="Add Permission" onClickButton={handleOnClickButton} />
        <Row gutter={10}>

          <Col xs={24} md={12} lg={12}>
            <Card className='shadow'>
              <List
                header={<h2>Permissions</h2>}
                bordered
                loading={isLoading}
                dataSource={permissions}
                renderItem={(item) => (
                  <List.Item key={item.id}
                             actions={[
                               [
                                 <Button key= "edit" type='link' size='small' onClick={()=>editPermission(item)}>Edit</Button>,
                                 <Button key= "assign" type='link' size='small'  onClick={()=>assignUserPermission(item.name)}>Assign</Button>,
                                 <Button key= "delete" type='text' size='small' danger onClick={()=>handleDeletePermission(item.id)}>Delete</Button>
                               ]
                             ]}>
                    {item.name}
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          <Col xs={24} md={16} lg={16}>
            {/* {permission ? <AssignUserPermission permission={permission} /> : null} */}
          </Col>
        </Row>
      </Space>
      <Modal
        title="Add New Permission"
        open={isModalOpen}
        okText="Submit"
        okType='submit'
        footer={null}
        onCancel={handleCancel}>
        <Form
          form={form}
          name="permission_form"
          className="login-form"
          layout='vertical'
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
        >
          <Form.Item
            name="name"
            label="Permission Name"
            rules={[
              {
                required: true,
                message: 'Please input your permission name!',
              },
            ]}
          >
            <Input placeholder="Permission Name" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>)
};

export default PermissionSettings;
