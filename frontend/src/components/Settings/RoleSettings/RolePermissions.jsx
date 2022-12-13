import { Card, Table, Tag, Space, Switch, message } from 'antd';
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import axiosClient from "../../../axios-client.js";



function RolePermissions({ role }) {

  const [rolePermissions, setRolePermissions] = useState([]);
  const [permissionLoading, setPermissionLoading] = useState(false);
  const [rolePermissionLoading, setRolePermissionLoading] = useState(false);
  const [loadingSwithcKey, setLoadingSwithcKey] = useState(null);

  useEffect(() => {
    getPermissionsOfRole();

  }, [role])


  const onChange = (record, value) => {
    setLoadingSwithcKey(record.key);
    const data = {
      role: role,
      permission: record.permission
    }
    setPermissionLoading(true)
    if (value) {
      givePermission(data, record.key);
    } else {
      revokePermission(data, record.key);
    }

  }

  const updateRolePermissions = (recordKey, updatedValue) => {
    const newRolePermissions = rolePermissions.map((rolePermission) => {

      if (rolePermission.key === recordKey) {
        let newRolePermission = {};
        newRolePermission = {
          ...rolePermission, value: updatedValue
        }
        return newRolePermission
      }
      return rolePermission
    });
    setRolePermissions(newRolePermissions);
    setLoadingSwithcKey(null);
  }

  const givePermission = async (data, recordKey) => {
    try {
      const response = await axiosClient.post(`/roles/givePermissionToRole`, data);
      message.success(response.data.message);
      updateRolePermissions(recordKey, true);
      setPermissionLoading(false)
    } catch (error) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      message.error(message);
    }
  }
  const revokePermission = async (data, recordKey) => {
    try {
      const response = await axiosClient.post(`/roles/revokePermissionToRole`, data);
      message.info(response.data.message);
      updateRolePermissions(recordKey, false);
      setPermissionLoading(false)
    } catch (error) {
      const messageText = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      message.error(messageText);
    }
  }

  const getPermissionsOfRole = async () => {
    try {
      setRolePermissionLoading(true);
      const response = await axiosClient.get(`/roles/getRolePermissions?role=${role}`);
      const rolePermssionsArray = response.data.map((item, index) => {
        return {
          key: index,
          permission: item.permission,
          value: item.value
        }
      })
      setRolePermissions(rolePermssionsArray);
      setRolePermissionLoading(false);
    } catch (error) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      toast.error(message);
    }
  }


  const columns = [
    {
      title: 'Permission',
      dataIndex: 'permission',
      key: 'permission',
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: (e, record) => <Switch loading={record.key === loadingSwithcKey && permissionLoading} disabled = {loadingSwithcKey} checked={record.value} onChange={(value) => onChange(record, value)} />
    },

  ];

  return (
    <Card className='shadow'>
      <Table
        columns={columns}
        loading={rolePermissionLoading}
        dataSource={rolePermissions}
        scroll={{ y: 300 }}
        pagination={false}
        size={'small'}
      />
    </Card>
  )
}

export default RolePermissions;
