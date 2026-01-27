import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Input, Row, Select, Upload } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import useAxiosClient from "../axios-client.js";
import { InboxOutlined } from "@ant-design/icons";
import { colors } from "../utils/Colors.js";

const UserForm = () => {

  const axiosClient = useAxiosClient();
  const { Dragger } = Upload;
  const { Option } = Select;
  const { state } = useLocation();

  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);


  const [divisionLoading, setDivisionLoading] = useState(false);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [upazilaLoading, setUpazilaLoading] = useState(false);


  const [uploaded, setUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageData, setImageData] = useState({});
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();
  const navigate = useNavigate();

  const isEdit = !!state?.user;

  useEffect(() => {
    // Pre-fetch divisions for edit mode or initial load
    getDivisions().then(data => setDivisions(data));

    if (isEdit) {
      const { user } = state;
      // Populate form
      form.setFieldsValue({
        firstName: user.firstname,
        lastName: user.lastname,
        email: user.email,
        nid: user.nid,
        // Address might be null
        address: user.address?.address,
        phone: user.address?.phone,
        division: user.address?.division?.value ? Number(user.address.division.value) : null,
        district: user.address?.district?.value ? Number(user.address.district.value) : null,
        upazila: user.address?.upazila?.value ? Number(user.address.upazila.value) : null,
      });

      if (user.address?.division?.value) {
        const divisionId = Number(user.address.division.value);
        getDistricts(divisionId).then(data => setDistricts(data));
      }
      if (user.address?.district?.value) {
        const districtId = Number(user.address.district.value);
        getUpazilas(districtId).then(data => setUpazilas(data));
      }


      if (user.image) {
        setUploaded(true);
        setImageData(user.image);
        setFileList([{
          uid: user.image.id,
          name: 'Existing Image',
          status: 'done',
          url: `${process.env.REACT_APP_API_BASE_URL}/files/upload/${user.image.id}`
        }]);
      }
    }
  }, [state, form]);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

  const draggerProps = {
    name: 'userImage',
    accept: "image/*",
    listType: "picture",
    multiple: false,
    action: `${process.env.REACT_APP_API_BASE_URL}/files/upload`,
    maxCount: 1,
    onChange(info) {

      const { status } = info.file;
      setFileList(info.fileList.filter(file => file.size <= MAX_FILE_SIZE))
      if (status === 'uploading') {
        setUploading(true);
      }
      if (status === 'done') {
        setUploading(false);
        setUploaded(true);
        setImageData(info.file.response);
        toast.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        toast.error(`${info.file.name} file upload failed.`);
      }
    },
    beforeUpload(file) {
      const fileSize = file.size / 1024 / 1024; // Convert size to MB
      if (fileSize > 5) {
        file.status = "error"
        toast.error('File size must be smaller than 5MB');
        return false; // Prevent upload
      }
      return true; // Proceed with upload
    },
    onRemove() {
      setUploaded(false);
      setImageData({});
    }

  };

  const getDivisions = async () => {
    setDivisionLoading(true);
    const divisions = await axiosClient.get(`/getDivisions`);
    setDivisionLoading(false);
    return divisions.data;
  }
  const getDistricts = async (id) => {
    setDistrictLoading(true);

    const districts = await axiosClient.get(`/getDistrictsByDivision?divisionId=${id}`);
    setDistrictLoading(false);
    return districts.data;
  }
  const getUpazilas = async (id) => {
    setUpazilaLoading(true);

    const districts = await axiosClient.get(`/getUpazilasByDistrict?districtId=${id}`);
    setUpazilaLoading(false);
    return districts.data;
  }

  const onDistrictSelect = async (value) => {
    try {
      const districtsData = await getUpazilas(value)
      setUpazilas(districtsData);
      form.setFieldsValue({ upazila: null });
    } catch (error) {
    }
  }

  const onDivisionFocus = async () => {
    // Handled in useEffect or kept as is if needed for re-fetch
  }
  const onDivisionSelect = async (value) => {
    try {
      const districtsData = await getDistricts(value)
      setDistricts(districtsData);
      form.setFieldsValue({ district: null, upazila: null });
    } catch (error) {
    }
  }

  const onFinish = async (data) => {
    try {
      setLoading(true);
      let userData = { ...data, image: { ...imageData } }

      let response;
      if (isEdit) {
        response = await axiosClient.put(`/users/update/${state.user.id}`, userData);
      } else {
        response = await axiosClient.post(`/users/store`, userData);
      }

      setLoading(false);
      toast.success(response.data.message);
      navigate("/users");
    } catch (error) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      toast.error(message);
      setLoading(false)
    }

  }
  return (
    <Card title={isEdit ? "Edit User" : "Create new user"} className="shadow" bodyStyle={{ borderRadius: "10px" }}>
      <Form
        form={form}
        name="normal_login"
        className="login-form"
        layout='vertical'
        initialValues={{
          remember: true,
        }}
        onFinish={onFinish}
      >
        <Row gutter={24}>
          <Col xs={24} md={12} lg={isEdit ? 9 : 6}>
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[
                {
                  required: true,
                  message: 'Please input your first name!',
                },
              ]}
            >
              <Input placeholder="First Name" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={isEdit ? 9 : 6}>
            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[
                {
                  required: true,
                  message: 'Please input your last name!',
                },
              ]}
            >
              <Input placeholder="Last Name" />
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
          {!isEdit && (
            <Col xs={24} md={12} lg={6}>
              <Form.Item
                name="password"
                label="Password"
                rules={[
                  {
                    required: !isEdit,
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
          )}
        </Row>
        <Row gutter={24}>
          <Col lg={18}>
            <Row gutter={24}>
              {!isEdit && (
                <Col xs={24} md={12} lg={8}>
                  <Form.Item
                    name="cpassword"
                    label="Confirm Password"
                    rules={[
                      {
                        required: !isEdit,
                        message: 'Please confirm your password!',
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.resolve(); // If password field is empty in edit, cpassword can also be empty/ignored
                        },
                      }),
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (getFieldValue('password') && value !== getFieldValue('password')) {
                            return Promise.reject(new Error('The two passwords that you entered do not match!'));
                          }
                          return Promise.resolve();
                        }
                      })
                    ]}
                  >
                    <Input.Password placeholder="******" />
                  </Form.Item>

                </Col>
              )}
              <Col xs={24} md={12} lg={isEdit ? 12 : 8}>
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
              <Col xs={24} md={12} lg={isEdit ? 12 : 8}>
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
              <Col xs={24} md={12} lg={isEdit ? 12 : 8}>
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
              <Col xs={24} md={12} lg={isEdit ? 12 : 8}>
                <Form.Item
                  name="district"
                  label="District"
                  rules={[
                    {
                      required: true,
                      message: 'Please select district!',
                    },

                  ]}>
                  <Select loading={districtLoading} onSelect={onDistrictSelect}>
                    {districts.map(data => {
                      return <Option value={data.id} key={data.id}>{data.name}</Option>
                    })}

                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={isEdit ? 12 : 8}>
                <Form.Item
                  name="upazila"
                  label="Upazila/Thana"
                  rules={[
                    {
                      required: true,
                      message: 'Please select upazila/thana!',
                    },

                  ]}>
                  <Select loading={upazilaLoading}>
                    {upazilas.map(data => {
                      return <Option value={data.id} key={data.id}>{data.name}</Option>
                    })}

                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col lg={6}>
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
              <Input.TextArea rows={5} placeholder="House, road, area...." />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Dragger {...draggerProps} disabled={uploaded} fileList={fileList}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ color: colors.secondaryDark }} />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint mb-1">
              Support for a single or bulk upload. Strictly prohibit from uploading company data or other
              band files
            </p>
            <p className="ant-upload-hint font-bold" style={{ color: "#E74646" }}>
              Maximum file size must be less then 5 mb.
            </p>
          </Dragger>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} disabled={uploading}>
            {isEdit ? "Update" : "Submit"}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
};

export default UserForm;
