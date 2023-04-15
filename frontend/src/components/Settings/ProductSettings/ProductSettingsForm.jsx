import React, {useState} from 'react';
import {Button, Form, Input, Modal} from "antd";
import {toast} from "react-toastify";
import useAxiosClient from "../../../axios-client.js";

const ProductSettingsForm = (props) => {

    const {openForm, setOpenForm, fetch, title, settings, form, productSettingsId, setProductSettingsId} = props;

    const [loading, setLoading] = useState(false);
    const axiosClient = useAxiosClient();
    const handleCancel = () => {
        setOpenForm(false);
    }

    const saveProductSettings = async (data) => {
        try {
            setLoading(true);
            const response = await axiosClient.post(`/settings/${settings}/store`, data);
            return response.data;

        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            toast.error(message);
            setLoading(false);
        }
    };
    const updateProductSettings = async (data) => {

        try {
            setLoading(true);
            const response = await axiosClient.put(`/settings/${settings}/update/${productSettingsId}`, data);
            return response.data;

        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            toast.error(message);
            setLoading(false);
        }
    };
    const onFinish = async (data) => {
        let res;
        if (!productSettingsId) {
            res = await saveProductSettings(data);
            setProductSettingsId(null)
        } else {
            res = await updateProductSettings(data);

        }
        setLoading(false);
        toast.success(res.message);
        setOpenForm(false)
        form.resetFields();
        fetch();
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
                    <Input placeholder={`Color`}/>
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
