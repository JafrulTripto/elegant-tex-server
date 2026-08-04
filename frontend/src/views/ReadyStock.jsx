import React, { useCallback, useEffect, useState } from 'react';
import { Button, Drawer, Form, Input, InputNumber, Modal, Space, Table, Tag, Typography } from "antd";
import { DatabaseOutlined, HistoryOutlined, PlusOutlined, SlidersOutlined } from "@ant-design/icons";
import useAxiosClient from "../axios-client";
import { toast } from "react-toastify";
import { useStateContext } from "../contexts/ContextProvider";

const { Title, Text } = Typography;

const ReadyStock = () => {
  const axiosClient = useAxiosClient();
  const { permissions } = useStateContext();
  const canManage = permissions?.includes("MANAGE_STOCK");

  const [kinds, setKinds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Add / adjust modal
  const [entryOpen, setEntryOpen] = useState(false);
  const [entryKind, setEntryKind] = useState(null);
  const [entryType, setEntryType] = useState('MANUAL_IN');
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  // History drawer
  const [historyKind, setHistoryKind] = useState(null);
  const [movements, setMovements] = useState([]);

  const fetchStock = useCallback(async (searchTerm = '') => {
    setLoading(true);
    try {
      const response = await axiosClient.get(`/stock/index`, { params: { search: searchTerm } });
      setKinds(response.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }, [axiosClient]);

  useEffect(() => { fetchStock(); }, [fetchStock]);

  const openEntry = (kind, type) => {
    setEntryKind(kind);
    setEntryType(type);
    form.resetFields();
    setEntryOpen(true);
  };

  const submitEntry = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      await axiosClient.post(`/stock/movements`, {
        productKindId: entryKind.id,
        quantity: entryType === 'ADJUSTMENT' ? values.quantity : Math.abs(values.quantity),
        type: entryType,
        reason: values.reason,
      });
      toast.success('Stock updated');
      setEntryOpen(false);
      fetchStock(search);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSaving(false);
    }
  };

  const openHistory = async (kind) => {
    setHistoryKind(kind);
    setMovements([]);
    try {
      const response = await axiosClient.get(`/stock/movements/${kind.id}`);
      setMovements(response.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const columns = [
    { title: 'Product Type', dataIndex: 'productType', key: 'productType' },
    { title: 'Fabric Type', dataIndex: 'fabricType', key: 'fabricType', render: (v) => <Tag color="purple">{v}</Tag> },
    { title: 'Fabric Color', dataIndex: 'fabricColor', key: 'fabricColor', render: (v) => <Tag color="blue">{v}</Tag> },
    {
      title: 'On hand', dataIndex: 'onHand', key: 'onHand', align: 'center',
      render: (v) => <span className={`font-semibold ${v > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>{v}</span>,
      sorter: (a, b) => a.onHand - b.onHand,
    },
    {
      title: 'Actions', key: 'actions', align: 'right',
      render: (_, kind) => (
        <Space>
          <Button size="small" icon={<HistoryOutlined />} onClick={() => openHistory(kind)}>History</Button>
          {canManage && <Button size="small" type="primary" ghost icon={<PlusOutlined />} onClick={() => openEntry(kind, 'MANUAL_IN')}>Add</Button>}
          {canManage && <Button size="small" icon={<SlidersOutlined />} onClick={() => openEntry(kind, 'ADJUSTMENT')}>Adjust</Button>}
        </Space>
      ),
    },
  ];

  const typeColor = { RETURN_IN: 'green', MANUAL_IN: 'blue', ADJUSTMENT: 'orange', PULL_OUT: 'red' };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <Title level={2} className="!mb-0"><DatabaseOutlined className="mr-2" />Ready Stock</Title>
        <Text type="secondary">Finished units on hand, per product kind. Company-wide across teams.</Text>
      </div>

      <Input.Search
        placeholder="Search by product type, fabric type, or color"
        allowClear
        style={{ maxWidth: 420, marginBottom: 16 }}
        onSearch={(v) => { setSearch(v); fetchStock(v); }}
      />

      <Table rowKey="id" columns={columns} dataSource={kinds} loading={loading} pagination={{ pageSize: 15 }} />

      <Modal
        title={`${entryType === 'ADJUSTMENT' ? 'Adjust' : 'Add'} stock`}
        open={entryOpen}
        onOk={submitEntry}
        confirmLoading={saving}
        onCancel={() => setEntryOpen(false)}
        okText={entryType === 'ADJUSTMENT' ? 'Apply adjustment' : 'Add to stock'}
        destroyOnClose
      >
        {entryKind && (
          <Text type="secondary">
            {entryKind.productType} · {entryKind.fabricType} · {entryKind.fabricColor} — on hand {entryKind.onHand}
          </Text>
        )}
        <Form form={form} layout="vertical" className="mt-3">
          <Form.Item
            name="quantity"
            label={entryType === 'ADJUSTMENT' ? 'Adjustment (use a negative number to remove)' : 'Quantity to add'}
            rules={[{ required: true, message: 'Enter a quantity' }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="reason" label="Reason (optional)">
            <Input placeholder="e.g. stock-take correction, damaged, ..." />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={historyKind ? `History — ${historyKind.productType} / ${historyKind.fabricType} / ${historyKind.fabricColor}` : 'History'}
        open={!!historyKind}
        onClose={() => setHistoryKind(null)}
        width={480}
      >
        <Table
          rowKey="id"
          size="small"
          pagination={false}
          dataSource={movements}
          columns={[
            { title: 'Type', dataIndex: 'type', render: (t) => <Tag color={typeColor[t]}>{t}</Tag> },
            { title: 'Qty', dataIndex: 'quantity', align: 'right', render: (q) => <span className={q < 0 ? 'text-red-500' : 'text-emerald-600'}>{q > 0 ? `+${q}` : q}</span> },
            { title: 'By', dataIndex: 'user' },
            { title: 'When', dataIndex: 'createdAt', render: (d) => d ? new Date(d).toLocaleDateString() : '' },
          ]}
        />
      </Drawer>
    </div>
  );
};

export default ReadyStock;
