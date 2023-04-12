import React, {useState} from 'react'
import {Col, Form, Input, Row, Card, Upload, message, Button, Select} from 'antd';
import {InboxOutlined} from '@ant-design/icons'

import {toast} from 'react-toastify';
import {useNavigate} from "react-router-dom";
import useAxiosClient from "../axios-client";
import {colors} from "../utils/Colors";


function MerchantForm() {

  const axiosClient = useAxiosClient();
  const {Dragger} = Upload;
  const {Option} = Select;

  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);

  const [divisionLoading, setDivisionLoading] = useState(false);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [upazilaLoading, setUpazilaLoading] = useState(false);

  const [uploaded, setUploaded] = useState(false);
  const [imageData, setImageData] = useState({});
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [fileList, setFileList] = useState([]);


  const navigate = useNavigate();

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

  const draggerProps = {
    name: 'merchantImage',
    accept: "image/*",
    multiple: false,
    listType:"picture",
    action: `${process.env.REACT_APP_API_BASE_URL}/files/uploadMerchantImage`,
    maxCount: 1,
    onChange(info) {
      const {status} = info.file;
      setFileList(info.fileList.filter(file => file.size <= MAX_FILE_SIZE))
      if (status === 'uploading') {
        setImageLoading(true);
      }
      if (status === 'done') {
        setImageLoading(false);
        setUploaded(true);
        setImageData(info.file.response);
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
    },
    beforeUpload(file) {
      const fileSize = file.size / 1024 / 1024; // Convert size to MB
      if (fileSize > 5) {
        file.status = 'error';
        toast.error('File size must be smaller than 5MB');
        return false; // Prevent upload
      }
      return true; // Proceed with upload
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
  const getUpazilas = async (id) => {
    setUpazilaLoading(true);

    const districts = await axiosClient.get(`/getUpazilasByDistrict?districtId=${id}`);
    return districts.data;
  }

  const onDistrictSelect = async (value) => {
    try {
      const districtsData = await getUpazilas(value)
      setUpazilas(districtsData);
      setUpazilaLoading(false);
    } catch (error) {
    }
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
      let merchantData = {...data, image: {...imageData}}
      const response = await axiosClient.post(`/merchants/store`, merchantData);
      setLoading(false);
      toast.success(response.data.message);
      navigate("/Merchants");
    } catch (error) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      toast.error(message);
      setLoading(false);
    }

  }
  return (
    <Card title="CREATE NEW MERCHANT" bodyStyle={{borderRadius: "10px"}}>
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
              <Input placeholder="Name"/>
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
              <Input placeholder="Phone Number"/>
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
              <Input placeholder="NID Number"/>
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
              <Select loading={districtLoading} onSelect={onDistrictSelect}>
                {districts.map(data => {
                  return <Option value={data.id} key={data.id}>{data.name}</Option>
                })}

              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={6}>
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
          <Col xs={24} md={12} lg={12}>
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
              <Input.TextArea rows={1} placeholder="House, road, area...."/>
            </Form.Item>
          </Col>


        </Row>
        <Form.Item>
          <Dragger {...draggerProps} disabled={uploaded} fileList={fileList}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{color: colors.secondaryDark}}/>
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint mb-1">
              Support for a single or bulk upload. Strictly prohibit from uploading company data or other
              band files
            </p>
            <p className="ant-upload-hint font-bold" style={{color:"#E74646"}}>
              Maximum file size must be less then 5 mb.
            </p>
          </Dragger>
        </Form.Item>
        <Form.Item style={{float: 'right'}}>
          <Button type="primary" htmlType="submit" loading={loading} disabled={imageLoading}>
            Create Merchant
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default MerchantForm;
