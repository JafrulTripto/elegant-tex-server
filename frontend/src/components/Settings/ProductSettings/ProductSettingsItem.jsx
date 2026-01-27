import React, { useState } from 'react';
import { Button, Card, Form, Input, List, Modal, Typography, Space, Tooltip } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import ProductSettingsForm from "./ProductSettingsForm.jsx";
import { toast } from "react-toastify";
import useAxiosClient from "../../../axios-client.js";

const { Text } = Typography;

const ProductSettingsItem = (props) => {
    const { settingsType, data, loading, fetch } = props;
    const [openForm, setOpenForm] = useState(false);
    const [productSettingsId, setProductSettingsId] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [modal, contextHolder] = Modal.useModal();
    const axiosClient = useAxiosClient();
    const [form] = Form.useForm();

    const handleEditProductSettings = (record) => {
        setOpenForm(true);
        form.setFieldsValue({
            name: record.name
        })
        setProductSettingsId(record.id);
    }

    const handleDeleteProductSettings = (record) => {
        modal.confirm({
            title: "Are you sure?",
            content: 'Do you really want delete this record? This process cannot be undone.',
            okType: 'danger',
            onOk: () => confirmDeleteItem(record),
        })
    }

    const confirmDeleteItem = async (record) => {
        try {
            const response = await axiosClient.delete(`/settings/${settingsType.key}/delete/${record.id}`);
            toast.success(response.data.message);
            fetch();
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            toast.error(message);
        }
    }

    // Filter data based on search
    const filteredData = data?.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
    ) || [];

    return (
        <div className="max-w-4xl mx-auto">
            <Card
                className="shadow-sm !bg-white dark:!bg-slate-800 border-slate-200 dark:border-slate-700"
                title={
                    <div className="flex justify-between items-center py-2">
                        <div className="flex flex-col">
                            <span className="text-lg font-semibold text-slate-700 dark:text-slate-200">{settingsType.title}</span>
                            <span className="text-xs text-slate-400 font-normal">{settingsType.description || "Manage settings entries"}</span>
                        </div>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                            setProductSettingsId(null);
                            form.resetFields();
                            setOpenForm(true);
                        }}>
                            Add New
                        </Button>
                    </div>
                }
                bodyStyle={{ padding: '0px' }}
            >
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                    <Input
                        placeholder={`Search ${settingsType.title}...`}
                        prefix={<SearchOutlined className="text-slate-400" />}
                        onChange={(e) => setSearchText(e.target.value)}
                        allowClear
                        size="large"
                        className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-400 focus:border-blue-500 transition-all"
                    />
                </div>

                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <List
                        loading={loading}
                        itemLayout="horizontal"
                        dataSource={filteredData}
                        locale={{ emptyText: <div className="py-16 text-center text-slate-400">No items found</div> }}
                        renderItem={(item) => (
                            <List.Item
                                className="group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors px-6 py-4 border-b border-slate-100 dark:border-slate-700 last:border-0"
                                actions={[
                                    <Button
                                        key="edit"
                                        type="text"
                                        size="small"
                                        icon={<EditOutlined />}
                                        className="text-slate-400 hover:text-blue-500 opacity-60 group-hover:opacity-100 transition-all duration-300"
                                        onClick={() => handleEditProductSettings(item)}
                                    >
                                        Edit
                                    </Button>,
                                    <Button
                                        key="delete"
                                        type="text"
                                        size="small"
                                        danger
                                        icon={<DeleteOutlined />}
                                        className="text-slate-400 hover:text-red-500 opacity-60 group-hover:opacity-100 transition-all duration-300"
                                        onClick={() => handleDeleteProductSettings(item)}
                                    >
                                        Delete
                                    </Button>
                                ]}
                            >
                                <List.Item.Meta
                                    title={
                                        <Text className="text-base font-medium text-slate-700 dark:text-slate-200 pl-2 border-l-4 border-transparent group-hover:border-blue-500 transition-all duration-300">
                                            {item.name}
                                        </Text>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                </div>
            </Card>

            <ProductSettingsForm
                form={form}
                openForm={openForm}
                setOpenForm={setOpenForm}
                fetch={fetch}
                productSettingsId={productSettingsId}
                setProductSettingsId={setProductSettingsId}
                title={settingsType.title}
                settings={settingsType.key}
            />
            {contextHolder}
        </div>
    );
};

export default ProductSettingsItem;
