import React, { useCallback, useEffect, useState } from 'react';
import { Button, Card, Col, Form, Input, List, Modal, Row, Space, Table } from "antd";
import AddNewItemLayout from "../components/Layouts/AddNewItemLayout.jsx";
import { toast } from "react-toastify";
import useAxiosClient from "../axios-client.js";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import Permission from "../components/Util/Permission";
import TextArea from "antd/es/input/TextArea";

const PermissionSettings = () => {

  const axiosClient = useAxiosClient();
  const [form] = Form.useForm();
  const [modal, contextHolder] = Modal.useModal();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const [permissions, setPermissions] = useState([]);

  const getPermissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosClient.get(`/permissions/getPermissions`);
      setPermissions(response.data);
    } catch (error) {
      toast.error(error.response.data.message);
      setIsLoading(false);
    }

    setIsLoading(false);
  }, [axiosClient])

  useEffect(() => {
    getPermissions();

  }, [getPermissions])


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
    modal.confirm({
      title: 'Are you sure want to delete this permission?',
      okText: "Yes",
      okType: "danger",
      onOk: () => confirmDeletePermission(permissionId)
    })
  }
  const confirmDeletePermission = (item) => {
    axiosClient.delete(`/permissions/delete/${item.id}`).then(response => {
      toast.success(response.data);
      getPermissions();
    })
  }

  const handleEditPermission = (record) => {

  };
  const renderActionButtons = (record) => {
    return (
      <Space size="middle">
        <Button className='edit-btn' icon={<EditOutlined />} size={"small"} onClick={() => handleEditPermission(record)} />
        <Permission required={'DELETE_ORDER'}>
          <Button type="primary" danger icon={<DeleteOutlined />} size={"small"}
            onClick={() => handleDeletePermission(record)} />
        </Permission>
      </Space>
    );
  }
  const columns = [

    {
      title: 'Permission',
      dataIndex: 'name',
      key: 'permission',
      width: "30%"
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: "50%"
    },
    {
      title: 'Action',
      key: "action",
      render: renderActionButtons,
      width: "20%"
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
        <AddNewItemLayout buttonText="Add Permission" onClickButton={handleOnClickButton} />
        <Row gutter={10}>

          <Col xs={24} md={12} lg={24}>
            <Card className='shadow'>
              <Table
                columns={columns}
                dataSource={permissions}
                pagination={false}
                scroll={{ y: 620 }}
              />
            </Card>
          </Col>
          <Col xs={24} md={16} lg={16}>

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
          <Form.Item
            name="description"
            label="Permission description"
            rules={[
              {
                required: true,
                message: 'Enter permission description here!',
              },
            ]}
          >
            <TextArea placeholder="Permission description" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      {contextHolder}
    </>)
};

export default PermissionSettings;
