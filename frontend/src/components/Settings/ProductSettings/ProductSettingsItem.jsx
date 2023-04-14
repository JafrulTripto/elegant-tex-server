import React, { useState} from 'react';
import {Button, Col, Form, Modal, Space, Table} from "antd";
import {DeleteOutlined, EditOutlined, PlusOutlined} from "@ant-design/icons";
import ProductSettingsForm from "./ProductSettingsForm.jsx";
import {toast} from "react-toastify";
import useAxiosClient from "../../../axios-client.js";

const ProductSettingsItem = (props) => {
    const {settingsType, data, loading, fetch} = props;
    const [openForm, setOpenForm] = useState(false);
    const [productSettingsId, setProductSettingsId] = useState(null);
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
            content: 'Do you realy want delete this record? This process cannot be undone.',
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

    const columns = [
        {
            title: 'Name',
            key: 'name',
            dataIndex: 'name',
            width: "80%"
        },
        {
            title: 'Action',
            key: 'action',
            width: "20%",
            render: (text, record, index) => (
                <Space size="middle">
                    <Button className='edit-btn' icon={<EditOutlined/>} size={"small"}
                            onClick={() => handleEditProductSettings(record)}/>

                    <Button type="primary" danger icon={<DeleteOutlined/>} size={"small"}
                            onClick={() => handleDeleteProductSettings(record)}/>
                </Space>

            ),
        },
    ];
    const tableHeader = (productSettingsList) => {

        return (
            <div className="flex justify-between">
                <div className="rounded-t mb-0 bg-transparent">
                    <div className="flex flex-wrap items-center">
                        <div className="relative w-full max-w-full flex-grow flex-1">
                            <h6 className="uppercase mb-1 text-xs font-semibold text-blueGray-500">Settings</h6>
                            <h2 className="text-xl mb-0 font-semibold text-blueGray-800">{settingsType.title}</h2>
                        </div>
                    </div>

                </div>
                <div className="pt-2 px-2">
                    <Button type="primary" onClick={() => setOpenForm(true)}
                            icon={<PlusOutlined/>}>Add {settingsType.title}
                    </Button>
                </div>
            </div>
        );
    }

    return (
      <>
          <Col xs={24} md={12} lg={12}>
              <Table loading={loading}
                     pagination={{
                         pageSize: 5
                     }}
                     rowKey={"id"}
                     size="small"
                     columns={columns}
                     title={() => tableHeader(settingsType)}
                     dataSource={data}/>
          </Col>
          <ProductSettingsForm
              form={form}
              openForm={openForm}
              setOpenForm={setOpenForm}
              fetch={fetch}
              productSettingsId={productSettingsId}
              setProductSettingsId={setProductSettingsId}
              title={settingsType.title}
              settings={settingsType.key}/>
          {contextHolder}
      </>




    );
};

export default ProductSettingsItem;
