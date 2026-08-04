import React, { useCallback, useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Select, Space, Table, Tag, Typography } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, TeamOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import useAxiosClient from "../axios-client";
import { toast } from "react-toastify";

const { Title, Text } = Typography;

const TeamSettings = () => {
  const axiosClient = useAxiosClient();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  // Create / edit team modal
  const [editing, setEditing] = useState(null); // null = create, else team being edited
  const [formOpen, setFormOpen] = useState(false);
  const [form] = Form.useForm();

  // Manage members modal
  const [membersTeam, setMembersTeam] = useState(null);
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [membersSaving, setMembersSaving] = useState(false);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get(`/settings/teams/index`);
      setTeams(response.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }, [axiosClient]);

  useEffect(() => { fetchTeams(); }, [fetchTeams]);

  const openCreate = () => { setEditing(null); form.resetFields(); setFormOpen(true); };
  const openEdit = (team) => { setEditing(team); form.setFieldsValue({ name: team.name }); setFormOpen(true); };

  const submitForm = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await axiosClient.put(`/settings/teams/update/${editing.id}`, values);
      } else {
        await axiosClient.post(`/settings/teams/store`, values);
      }
      toast.success(editing ? 'Team updated' : 'Team created');
      setFormOpen(false);
      fetchTeams();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const deleteTeam = (team) => {
    Modal.confirm({
      title: `Delete team "${team.name}"?`,
      content: 'This cannot be undone. Members must be reassigned first.',
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await axiosClient.delete(`/settings/teams/delete/${team.id}`);
          toast.success('Team deleted');
          fetchTeams();
        } catch (error) {
          toast.error(error.response?.data?.message || error.message);
        }
      },
    });
  };

  const openMembers = async (team) => {
    setMembersTeam(team);
    setSelectedUserIds([]);
    try {
      const response = await axiosClient.get(`/settings/teams/assignableUsers`);
      setAssignableUsers(response.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const saveMembers = async () => {
    if (selectedUserIds.length === 0) { setMembersTeam(null); return; }
    setMembersSaving(true);
    try {
      await axiosClient.post(`/settings/teams/${membersTeam.id}/assignUsers`, { user_ids: selectedUserIds });
      toast.success('Members updated');
      setMembersTeam(null);
      fetchTeams();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setMembersSaving(false);
    }
  };

  const columns = [
    { title: 'Team', dataIndex: 'name', key: 'name', render: (name) => <span className="font-medium">{name}</span> },
    { title: 'Members', dataIndex: 'userCount', key: 'userCount', render: (c) => <Tag color="blue">{c}</Tag> },
    {
      title: 'Actions', key: 'actions', align: 'right',
      render: (_, team) => (
        <Space>
          <Button size="small" icon={<UsergroupAddOutlined />} onClick={() => openMembers(team)}>Members</Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(team)} />
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => deleteTeam(team)} />
        </Space>
      ),
    },
  ];

  const currentMembers = membersTeam
    ? assignableUsers.filter(u => u.team_id === membersTeam.id)
    : [];

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Title level={2} className="!mb-0"><TeamOutlined className="mr-2" />Team Settings</Title>
          <Text type="secondary">Group staff into teams; orders and dashboards are separated by team.</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New Team</Button>
      </div>

      <Table rowKey="id" columns={columns} dataSource={teams} loading={loading} pagination={false} />

      <Modal
        title={editing ? 'Edit Team' : 'New Team'}
        open={formOpen}
        onOk={submitForm}
        onCancel={() => setFormOpen(false)}
        okText={editing ? 'Save' : 'Create'}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Team name" rules={[{ required: true, message: 'Please enter a team name' }]}>
            <Input placeholder="e.g. Team Red" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={membersTeam ? `Add members to ${membersTeam.name}` : 'Members'}
        open={!!membersTeam}
        onOk={saveMembers}
        confirmLoading={membersSaving}
        onCancel={() => setMembersTeam(null)}
        okText="Assign"
      >
        <Text type="secondary">Select users to move into this team. To move someone out, add them to another team.</Text>
        <Select
          mode="multiple"
          allowClear
          showSearch
          optionFilterProp="label"
          style={{ width: '100%', marginTop: 12 }}
          placeholder="Search users to add"
          value={selectedUserIds}
          onChange={setSelectedUserIds}
          options={assignableUsers.map(u => ({
            value: u.id,
            label: `${u.firstname} ${u.lastname}${u.team_id === membersTeam?.id ? ' (already here)' : ''}`,
          }))}
        />
        {currentMembers.length > 0 && (
          <div className="mt-4">
            <Text strong>Current members</Text>
            <div className="mt-2 flex flex-wrap gap-2">
              {currentMembers.map(u => (
                <Tag key={u.id}>{u.firstname} {u.lastname}</Tag>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TeamSettings;
