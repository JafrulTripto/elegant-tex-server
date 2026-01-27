import React, { useState, useEffect } from 'react'
import { Card, Transfer } from 'antd'
import useAxiosClient from "../../../axios-client.js";
import { colors } from "../../../utils/Colors.js";


function AssignUserRoles(props) {

  const axiosClient = useAxiosClient();
  const [targetKeys, setTargetKeys] = useState([100]);
  const [roleData, setRoleData] = useState([]);
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchRoleUsers = async () => {
      setLoading(true);
      const roleUsers = await axiosClient.get(`/users/getRoleUsers`);
      const tempData = [];
      roleUsers.data.forEach(element => {
        let data = {
          key: element.id,
          title: element.name,
          roles: element.roles
        }
        tempData.push(data);

      });
      let data = tempData.filter(item => item.roles.includes(props.role)).map(item => item.key)
      setTargetKeys(data)
      setRoleData(tempData);
      setLoading(false);
    }
    fetchRoleUsers()
  }, [axiosClient, props.role]);

  const handleChange = (newTargetKeys, direction, moveKeys) => {
    if (direction === 'right') {
      assignRole(moveKeys, props.role);
    } else {
      removeRole(moveKeys, props.role);
    }
    setTargetKeys(newTargetKeys);
  };

  const handleSearch = (dir, value) => {
  };

  const removeRole = async (userIds, role) => {
    let data = {
      userIds,
      role
    }
    await axiosClient.post(`/roles/removeRole`, data);
  }

  const assignRole = async (userIds, role) => {
    let data = {
      userIds,
      role
    }
    await axiosClient.post(`/roles/assignRole`, data);
  }


  return (
    <div className='p-4'>
      <Transfer
        listStyle={{ width: '45%', height: 400 }}
        dataSource={roleData}
        showSearch
        disabled={props.role === 'SUDO'}
        titles={[
          <span className="font-semibold text-slate-600">Available Users</span>,
          <span className="font-semibold text-blue-600">{props.role} Users</span>
        ]}
        targetKeys={targetKeys}
        onChange={handleChange}
        onSearch={handleSearch}
        render={item => item.title}
        pagination
      />
    </div>
  )
}

export default AssignUserRoles;
