import React, {useState} from 'react';
import {Avatar, Button, Col, Form, Image, Input, message, Modal, Space, Table, Upload} from "antd";
import {DeleteOutlined, EditOutlined, PlusOutlined, UploadOutlined, UserOutlined} from "@ant-design/icons";
import {toast} from "react-toastify";
import useAxiosClient from "../../../axios-client";
import {useFabrics} from "../../../hooks/useFabrics";

const FabricsSettings = () => {

    const [form] = Form.useForm();
    const [modal, contextHolder] = Modal.useModal();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const axiosClient = useAxiosClient();
    const {fabrics, fetchFabrics, fabricsLoading} = useFabrics();

    const [isUploadDisabled, setIsUploadDisabled] = useState(false);

    const [openForm, setOpenForm] = useState(false);



    const handleEditProductSettings = (record) => {
        setOpenForm(true);
        form.setFieldsValue({
            name: record.name
        })
    }

    const confirmDeleteItem = async (record) => {
        try {
            const data = await axiosClient.delete(`/settings/fabrics/delete/${record.id}`);
            toast.warning(data.data.message);
            await fetchFabrics()

        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            toast.error(message);
        }

    }

    const renderFabricsImage = (image) => {
        if (image) {
            const imagePath = `${process.env.REACT_APP_API_BASE_URL}/files/upload/${image.id}`
            return (
                <Image
                    style={{borderRadius:"5px"}}
                    src={imagePath}
                    width={50}
                    height={50}
                />

            )
        }
        return <Avatar size={{xs: 24, sm: 32, md: 32}} icon={<UserOutlined/>}/>

    }

    const handleDeleteFabrics = (record) => {
        modal.confirm({
            title: "Are you sure?",
            content: 'Do you really want delete this record? This process cannot be undone.',
            onOk: () => confirmDeleteItem(record),
        })
    }

    const columns = [
        {
            title: 'Name',
            key: 'name',
            dataIndex: 'name',
            width: "40%"
        },
        {
            title: 'Preview',
            dataIndex: 'image',
            key: 'image',
            width: "40%",
            render: renderFabricsImage
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
                            onClick={() => handleDeleteFabrics(record)}/>
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
                            <h2 className="text-xl mb-0 font-semibold text-blueGray-800">Fabrics</h2>
                        </div>
                    </div>

                </div>
                <div className="pt-2 px-2">
                    <Button type="primary" onClick={() => setOpenForm(true)}
                            icon={<PlusOutlined/>}>Add Fabrics
                    </Button>
                </div>
            </div>
        );
    }
    const handleCancel = () => {
        setOpenForm(false);
        form.resetFields();
    }

    const onFinish = async (data) => {
        try {
            setSaving(true);
            const response = await axiosClient.post(`/settings/fabrics/store`, data);
            setSaving(false);
            toast.success(response.data.message);
            form.resetFields(); // Reset the form fields
            handleCancel();
            fetchFabrics();
        } catch (error) {
            console.log(error);
        }
    }

    const props = {
        name: "fabricsImage",
        action: `${process.env.REACT_APP_API_BASE_URL}/files/uploadFabricsImage`,
        beforeUpload: (file) => {
            const maxSize = 2 * 1024 * 1024; // 2MB

            const isPNG = file.type === 'image/png';
            const isJPG = file.type === 'image/jpeg';

            if (!isPNG && !isJPG) {
                message.error(`${file.type} is not a PNG or JPG file`);
            }
            if (file.size > maxSize) {
                message.error(`File size exceeds the limit of 2MB`);
                return false;
            }
            return isPNG || isJPG || Upload.LIST_IGNORE;
        },
        onChange: (info) => {
            if (info.file.status === 'done') {
                setIsUploadDisabled(true); // Disable the upload button
            }
        },
    };


    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.file.response;
    }

    return (
        <>
            <Col xs={24} md={12} lg={12}>
                <Table loading={fabricsLoading}
                       pagination={{
                           pageSize: 5
                       }}
                       rowKey="id"
                       size="middle"
                       columns={columns}
                       title={() => tableHeader()}
                       dataSource={fabrics}/>
            </Col>

            <Modal
                title={`Add New Fabrics`}
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
                        label="Fabric"
                        rules={[
                            {
                                required: true,
                                message: `Please input fabric name!!!`,
                            },
                        ]}
                    >
                        <Input placeholder={`Fabric name`}/>
                    </Form.Item>
                    <Form.Item
                        name="fabricsImage"
                        label="Upload Fabric Image"
                        valuePropName="file"
                        getValueFromEvent={normFile}
                        extra="Max size 2MB"
                        rules={[
                            {
                                required: true,
                                message: `Please upload fabric image!!!`,
                            },
                        ]}
                    >
                        <Upload {...props} disabled={isUploadDisabled}>
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
            {contextHolder}
        </>

    );
};

export default FabricsSettings;
