import React, {useState, useEffect} from 'react'
import {Card, Transfer} from 'antd'
import axiosClient from "../../../axios-client.js";
import {colors} from "../../../utils/Colors.js";


function AssignUserRoles(props) {

  const [targetKeys, setTargetKeys] = useState([100]);
  const [roleData, setRoleData] = useState([]);
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchRoleUsers()
  }, [props.role]);

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
    const response = axiosClient.post(`/roles/removeRole`, data);
  }

  const assignRole = async (userIds, role) => {
    let data = {
      userIds,
      role
    }
    const response = axiosClient.post(`/roles/assignRole`, data);
  }

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

  return (
    <Card className='shadow' loading={loading}>
      <Transfer
        listStyle={{width: 500, height: 350}}
        dataSource={roleData}
        showSearch
        titles={[<h3 style={{color: colors.primary, fontWeight: "700"}}>Users</h3>,
          <h3 style={{color: colors.primary, fontWeight: "700"}}>{props.role}</h3>]}

        targetKeys={targetKeys}
        onChange={handleChange}
        onSearch={handleSearch}
        render={item => item.title}
        pagination
      />
    </Card>
  )
}

export default AssignUserRoles;
