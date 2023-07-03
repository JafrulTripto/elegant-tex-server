import React, {useState} from 'react';
import {Button, Col, Form, Input, Modal, Space, Table, Upload} from "antd";
import {DeleteOutlined, EditOutlined, PlusOutlined, UploadOutlined} from "@ant-design/icons";
import {toast} from "react-toastify";
import ProductSettingsForm from "./ProductSettingsForm";

const MaterialSettings = () => {

    const [form] = Form.useForm();
    const [modal, contextHolder] = Modal.useModal();
    const [loading, setLoading] = useState(false);

    const [openForm, setOpenForm] = useState(false);

    const data = [
        {
            key: '1',
            name: 'Mike',
            age: 32,
            address: '10 Downing Street',
        },
        {
            key: '2',
            name: 'John',
            age: 42,
            address: '10 Downing Street',
        },
    ];


    const handleEditProductSettings = (record) => {
        setOpenForm(true);
        form.setFieldsValue({
            name: record.name
        })
    }

    const confirmDeleteItem = async (record) => {


    }

    const handleDeleteProductSettings = (record) => {
        modal.confirm({
            title: "Are you sure?",
            content: 'Do you realy want delete this record? This process cannot be undone.',
            onOk: () => confirmDeleteItem(record),
        })
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

    const tableHeader = () => {

        return (
            <div className="flex justify-between">
                <div className="rounded-t mb-0 bg-transparent">
                    <div className="flex flex-wrap items-center">
                        <div className="relative w-full max-w-full flex-grow flex-1">
                            <h6 className="uppercase mb-1 text-xs font-semibold text-blueGray-500">Settings</h6>
                            <h2 className="text-xl mb-0 font-semibold text-blueGray-800">Material</h2>
                        </div>
                    </div>

                </div>
                <div className="pt-2 px-2">
                    <Button type="primary" onClick={() => setOpenForm(true)}
                            icon={<PlusOutlined/>}>Add Material
                    </Button>
                </div>
            </div>
        );
    }
    const handleCancel = () => {
        setOpenForm(false);
    }

    const onFinish = async (data) => {
        console.log(data);
    }

    const props = {
        name: "materialImage",
        action: `${process.env.REACT_APP_API_BASE_URL}/files/uploadMaterialImage`,
        beforeUpload: (file) => {
            const isPNG = file.type === 'image/png';
            const isJPG = file.type === 'image/jpeg';

            if (!isPNG && !isJPG) {
                toast.error(`${file.type} is not a PNG or JPG file`);
            }
            return isPNG || isJPG || Upload.LIST_IGNORE;
        },
        onChange: (info) => {
            console.log(info.fileList);
        },
    };


    const normFile = (e) => {
        console.log('Upload event:', e);
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    }

    return (
        <>
            <Col xs={24} md={12} lg={12}>
                <Table loading={loading}
                       pagination={{
                           pageSize: 5
                       }}
                       rowKey={"key"}
                       size="small"
                       columns={columns}
                       title={() => tableHeader()}
                       dataSource={data}/>
            </Col>

            <Modal
                title={`Add New Material`}
                open={openForm}
                okText="Submit"
                okType='submit'
                footer={null}
                onCancel={handleCancel}>
                <Form
                    form={form}
                    name={"_form"}
                    className="login-form"
                    layout='vertical'
                    initialValues={{
                        remember: true,
                    }}
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="name"
                        label="Material"
                        rules={[
                            {
                                required: true,
                                message: `Please input material name!!!`,
                            },
                        ]}
                    >
                        <Input placeholder={`Color`}/>
                    </Form.Item>
                    <Form.Item
                        name="upload"
                        label="Upload Material Image"
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                        extra="Max size 250mb"
                    >
                        <Upload {...props}>
                            <Button icon={<UploadOutlined />}>Click to upload</Button>
                        </Upload>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>

    );
};

export default MaterialSettings;
