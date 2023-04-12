import React, {useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";
import {Avatar, Button, Card, Col, Modal, Row, Space, Table} from "antd";
import {DeleteOutlined, EditOutlined, InfoOutlined, PlusOutlined, UserOutlined} from "@ant-design/icons";
import useAxiosClient from "../axios-client.js";
import moment from "moment";
import {useStateContext} from "../contexts/ContextProvider";
import Permission from "../components/Util/Permission";

const Users = () => {
  const axiosClient = useAxiosClient();
  const navigate = useNavigate()
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {user} = useStateContext();

  useEffect(() => {
      console.log("fetch user")
    fetchUsers();
  },[])


  const addNewUser = () => {
    navigate('/users/userForm')
  }
  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const link = page > 1 ? `/users/index?page=${page}` : "/users/index"
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
  }

  const renderUserAvater = (image) => {
    if (image) {
      const imagePath = `${import.meta.env.VITE_API_BASE_URL}/files/upload/${image.id}`
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
    navigate(`/users/${record.firstname}_${record.lastname}`, {state: {id:record.id}})
  }

  const renderActionButtons = (record) => {
    return (
      <Space size="middle">
        <Button type="primary" icon={<InfoOutlined />} size={"small"} onClick={() => handleUserDetails(record)} />
        <Button type="primary" disabled className='edit-btn' icon={<EditOutlined />} size={"small"} onClick={() => handleEditUser(record)} />
        <Permission required={"DELETE_USER"}>
          <Button type="primary" danger disabled={record.id === user.id} icon={<DeleteOutlined />} size={"small"} onClick={() => handleDeleteUser(record)} />
        </Permission>
      </Space>
    );
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
      render: (data) => data ? moment(data).format('MMMM Do YYYY, h:mm a') : "Never"
    },
    {
      title: 'Action',
      key: "action",
      render: renderActionButtons
    }
  ];

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
          <Col xs={{ span: 24 }} lg={{ span: 20 }}></Col>
          <Col xs={{ span: 24 }} lg={{ span: 4 }} flex={"inherit"}>
            <Button type="primary" onClick={addNewUser} icon={<PlusOutlined />}>Add User</Button>
          </Col>
        </Row>
      </Card>
      <Card className='shadow'>
        <Table
          dataSource={users}
          columns={columns}
          loading={loading}
          scroll={{ x: 400 }}
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
    </Space>

  )
};

export default Users;
