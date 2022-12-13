import React, {useState} from 'react';
import {Button, Card, Col, Form, Input, Row, Select, Upload} from "antd";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";
import axiosClient from "../axios-client.js";
import {InboxOutlined} from "@ant-design/icons";
import {colors} from "../utils/Colors.js";

const UserForm = () => {
  const { Dragger } = Upload;
  const { Option } = Select;

  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);


  const [divisionLoading, setDivisionLoading] = useState(false);
  const [districtLoading, setDistrictLoading] = useState(false);


  const [uploaded, setUploaded] = useState(false);
  const [imageData, setImageData] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();


  const draggerProps = {
    name: 'userImage',
    accept: "image/*",
    multiple: false,
    action: `${import.meta.env.VITE_API_BASE_URL}/api/files/upload`,
    maxCount: 1,
    onChange(info) {
      const { status } = info.file;
      if (status === 'uploading') {
        setLoading(true);
      }
      if (status === 'done') {
        setLoading(false);
        setUploaded(true);
        setImageData(info.file.response);
        toast.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        toast.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
    },
  };

  const getDivisions = async () => {
    setDivisionLoading(true);
    const divisions = await axiosClient.get(`/getDivisions`);
    return divisions.data;
  }
  const getDistricts = async (id) => {
    setDistrictLoading(true);

    const districts = await axiosClient.get(`/getDistrictsByDivision?divisionId=${id}`);
    return districts.data;
  }

  const onDivisionFocus = async () => {
    let divisionsData = [];
    try {
      if (divisions.length === 0) {
        divisionsData = await getDivisions();
        setDivisionLoading(false);
        setDivisions(divisionsData);
      }

    } catch (error) {
    }
  }
  const onDivisionSelect = async (value) => {
    try {
      const districtsData = await getDistricts(value)
      setDistricts(districtsData);
      setDistrictLoading(false);
    } catch (error) {
    }
  }

  const onFinish = async (data) => {
    try {
      setLoading(true);
      let userData = { ...data, image: { ...imageData } }
      const response = await axiosClient.post(`/users/store`, userData);
      setLoading(false);
      toast.success(response.data.message);
      navigate("/users");
    } catch (error) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      toast.error(message);

    }

  }
  return (
    <Card title="Create new user" className="shadow" bodyStyle={{ borderRadius: "10px" }}>
      <Form
        name="normal_login"
        className="login-form"
        layout='vertical'
        initialValues={{
          remember: true,
        }}
        onFinish={onFinish}
      >
        <Row gutter={24}>
          <Col xs={24} md={12} lg={6}>
            <Form.Item
              name="name"
              label="Name"
              rules={[
                {
                  required: true,
                  message: 'Please input your Name!',
                },
              ]}
            >
              <Input placeholder="Name" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={6}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                {
                  required: true,
                  message: 'Please input your Email!',
                },
                {
                  type: "email",
                  message: "Enter a valid Email"
                }
              ]}
            >
              <Input placeholder="Email" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={6}>
            <Form.Item
              name="password"
              label="Password"
              rules={[
                {
                  required: true,
                  message: 'Please input your Password!',
                },
                {
                  min: 6,
                  message: "Length minimum 6"
                }
              ]}
            >
              <Input.Password placeholder="******" />
            </Form.Item>

          </Col>
          <Col xs={24} md={12} lg={6}>
            <Form.Item
              name="cpassword"
              label="Confirm Password"
              rules={[
                {
                  required: true,
                  message: 'Please confirm your password!',
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }

                    return Promise.reject(new Error('The two passwords that you entered do not match!'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="******" />
            </Form.Item>

          </Col>
          <Col xs={24} md={12} lg={6}>
            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[
                {
                  required: true,
                  message: 'Please input your phone number!',
                },
              ]}
            >
              <Input placeholder="Phone Number" />
            </Form.Item>

          </Col>
          <Col xs={24} md={12} lg={6}>
            <Form.Item
              name="nid"
              label="NID Number"
              rules={[
                {
                  required: true,
                  message: 'Please input your NID number!',
                },

              ]}
            >
              <Input placeholder="NID Number" />
            </Form.Item>
          </Col>


          <Col xs={24} md={12} lg={6}>
            <Form.Item
              name="division"
              label="Division"
              rules={[
                {
                  required: true,
                  message: 'Please select division!',
                },

              ]}>
              <Select loading={divisionLoading} onFocus={onDivisionFocus} onSelect={onDivisionSelect}>
                {divisions.map(data => {
                  return <Option value={data.id} key={data.id}>{data.name}</Option>
                })}

              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={6}>
            <Form.Item
              name="district"
              label="District"
              rules={[
                {
                  required: true,
                  message: 'Please select district!',
                },

              ]}>
              <Select loading={districtLoading}>
                {districts.map(data => {
                  return <Option value={data.id} key={data.id}>{data.name}</Option>
                })}

              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={24} lg={24}>
            <Form.Item
              name="address"
              label="Address"
              rules={[
                {
                  required: true,
                  message: 'Please input your address!',
                },
              ]}
            >
              <Input.TextArea placeholder="House, road, area...." />
            </Form.Item>
          </Col>


        </Row>
        <Form.Item>
          <Dragger {...draggerProps} disabled={uploaded}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ color: colors.secondaryDark }} />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">
              Support for a single or bulk upload. Strictly prohibit from uploading company data or other
              band files
            </p>
          </Dragger>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
};

export default UserForm;
