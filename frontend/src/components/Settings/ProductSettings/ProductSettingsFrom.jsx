import React, {useState} from 'react';
import { Modal, Form, Input, Button } from 'antd';
import axios from 'axios';
import { toast } from 'react-toastify';
import axiosClient from "../../../axios-client.js";

const ProductSettingsForm = (props) => {

  const {open, handleClose, element, fetchFunc} = props;
  const [isLoading, setIsLoading] = useState(false)
  const [form] = Form.useForm();

  const handleCancel = () => {
    form.resetFields();
    handleClose()
  };

  const onFinish = async (data) => {
    try {
      setIsLoading(true);
      const response = await axiosClient.post(`/settings/${element.key}s/store`, data);
      setIsLoading(false);
      toast.success(response.data.message);
      handleClose()
      form.resetFields();
      element.fetchFunc();
      //getRoles();
    } catch (error) {
      toast.error(error.response.statusText);
    }
  }
  const modalTitle = `Add new ${element.element}`;


  return (
    <Modal
      title= {modalTitle.toUpperCase()}
      open={open}
      okText="Submit"
      okType='submit'
      footer={null}
      onCancel={handleCancel}>
      <Form
        form={form}
        name={element.key+"_form"}
        className="login-form"
        layout='vertical'
        initialValues={{
          remember: true,
        }}
        onFinish={onFinish}
      >
        <Form.Item
          name="name"
          label={`${element.element}`}
          rules={[
            {
              required: true,
              message: `Please input ${element.key}!!!`,
            },
          ]}
        >
          <Input placeholder={`${element.element}`} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ProductSettingsForm;
