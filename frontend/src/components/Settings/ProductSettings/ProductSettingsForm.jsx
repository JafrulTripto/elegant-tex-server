import React, { useState} from 'react';
import {Button, Form, Input, Modal} from "antd";
import {toast} from "react-toastify";
import useAxiosClient from "../../../axios-client.js";

const ProductSettingsForm = (props) => {

    const {openForm, setOpenForm, fetch, title, settings} = props;
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const axiosClient = useAxiosClient();
    const handleCancel = () => {
        setOpenForm(false);
    }

    const onFinish = async (data) => {
        try {
            setLoading(true);
            const response = await axiosClient.post(`/settings/${settings}/store`, data);
            setLoading(false);
            toast.success(response.data.message);
            setOpenForm(false)
            form.resetFields();
            fetch();
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            toast.error(message);
            setLoading(false);
        }
    }

    return (
        <Modal
            title={`Add New ${title}`}
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
                    label={title}
                    rules={[
                        {
                            required: true,
                            message: `Please input Color!!!`,
                        },
                    ]}
                >
                    <Input placeholder={`Color`} />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ProductSettingsForm;
