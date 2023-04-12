import React, {useEffect, useState} from 'react'
import {Card, message, Upload} from 'antd';
import {useLocation, useNavigate} from "react-router-dom";
import {Col, Form, Input, Row, Select, Divider, InputNumber, DatePicker, Button,} from 'antd';
import {InboxOutlined, PlusOutlined, MinusOutlined} from '@ant-design/icons'
import moment from "moment";
import useAxiosClient from "../axios-client.js";
import {useStateContext} from "../contexts/ContextProvider.jsx";
import {toast} from "react-toastify";
import {OrderTypeEnum} from "../utils/enums/OrderTypeEnum.js";
import {colors} from "../utils/Colors.js";
import {useDeliveryChannels} from "../hooks/useDeliveryChannels";


const OrderFrom = () => {

  const axiosClient = useAxiosClient();
  const {state} = useLocation();
  const navigate = useNavigate()


  useEffect(() => {
    if (!state) {
      navigate('/orders')
    }
    return () => {

    }
  }, [])


  const {Option} = Select;
  const {Dragger} = Upload;

  const {user} = useStateContext();
  const {deliveryChannels} = useDeliveryChannels();
  const {orderType} = state;

  const [merchantsLoading, setMerchantsLoading] = useState(false);
  const [merchants, setMerchants] = useState([]);

  const [marketplaceLoading, setMarketplaceLoading] = useState(false);
  const [marketplaces, setMarketplaces] = useState([]);

  const [productTypes, setProductTypes] = useState([]);
  const [productTypeLoading, setProductTypeLoading] = useState(false);

  const [productColors, setProductColors] = useState([]);
  const [productColorsLoading, setProductColorsLoading] = useState(false);

  const [productFabrics, setProductFabrics] = useState([]);
  const [productFabricLoading, setProductFabricsLoading] = useState(false);


  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);

  const [divisionLoading, setDivisionLoading] = useState(false);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [upazilaLoading, setUpazilaLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const draggerProps = {
    name: "orderImage",
    accept: "image/*",
    multiple: true,
    listType:"picture",
    action: `${process.env.REACT_APP_API_BASE_URL}/files/uploadProductImage`,
    maxCount: 5,
    onChange(info) {
      const {status} = info.file;
      if (status === 'uploading') {
        setLoading(true);
      }
      if (status === 'done') {
        setLoading(false);
        setFiles(info.fileList);
        toast.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        toast.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
    },
    beforeUpload(file) {
      const fileSize = file.size / 1024 / 1024; // Convert size to MB
      if (fileSize > 4) {
        file.status = 'error';
        message.error('File size must be smaller than 5MB');
        return false; // Prevent upload
      }
      return true; // Proceed with upload
    },
    onRemove(removedFile) {

      //removeFile(removedFile)
      const imagePath = {
        imagePath: removedFile.response.path
      }
      axiosClient.post(`/files/delete`, imagePath).then((response) => {
        toast.success(response.data.message);
        const updatedFilesList = files.filter((file) => file.uid !== removedFile.uid);
        setFiles(updatedFilesList);
      }).catch((error) => {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        toast.error(message);
      })


    }
  };


  const disabledDate = (current) => {
    // Can not select days before today and today
    return current && current < moment().endOf('day');
  }

  // *** API Calls to get the data ***

  const getProductColors = async () => {
    setProductColorsLoading(true);
    const response = await axiosClient.get(`/settings/colors/index`);
    return response.data.data;
  }
  const getProductTypes = async () => {
    setProductTypeLoading(true);
    const response = await axiosClient.get(`/settings/productTypes/index`);
    return response.data.data;
  }

  const getProductFabrics = async () => {
    setProductFabricsLoading(true);
    const response = await axiosClient.get(`/settings/fabrics/index`);
    return response.data.data;
  }

  const getDivisions = async () => {
    setDivisionLoading(true);
    const divisions = await axiosClient.get(`/getDivisions`);
    return divisions.data;
  }
  const getDistricts = async (id) => {
    setDistrictLoading(true);

    const upazilas = await axiosClient.get(`/getDistrictsByDivision?divisionId=${id}`);
    return upazilas.data;
  }
  const getUpazilas = async (id) => {
    setUpazilaLoading(true);

    const districts = await axiosClient.get(`/getUpazilasByDistrict?districtId=${id}`);
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
  const onDistrictSelect = async (value) => {
    try {
      const districtsData = await getUpazilas(value)
      setUpazilas(districtsData);
      setUpazilaLoading(false);
    } catch (error) {
    }
  }
  const getMerchants = async () => {
    setMerchantsLoading(true);
    const merchants = await axiosClient.get(`/merchants/getMerchants`);
    return merchants.data.data;
  }

  const getUserMarketplaces = async () => {
    setMarketplaceLoading(true);
    const response = await axiosClient.get(`/settings/marketplace/getUserMarketplaces?userID=${user.id}`);
    return response.data;
  }

  // End of API call

  const onMerchantsFocus = async () => {
    let merchantsData = [];
    try {
      if (merchants.length === 0) {
        merchantsData = await getMerchants();
        setMerchantsLoading(false);
        setMerchants(merchantsData);
      }

    } catch (error) {
    }
  }

  const onProductTypeFocus = async () => {
    let productTypesData = [];
    try {
      if (productTypes.length === 0) {
        productTypesData = await getProductTypes();
        setProductTypeLoading(false);
        setProductTypes(productTypesData);
      }

    } catch (error) {
    }
  }

  const onUserMarketplaceFocus = async () => {
    let userMarketplaceData = [];
    try {
      if (marketplaces.length === 0) {
        userMarketplaceData = await getUserMarketplaces();
        setMarketplaceLoading(false);
        setMarketplaces(userMarketplaceData);
      }

    } catch (error) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      toast.error(message);
    }
  }

  const onProductColorFocus = async () => {
    let productColorsData = [];
    try {
      if (productColors.length === 0) {
        productColorsData = await getProductColors();
        setProductColorsLoading(false);
        setProductColors(productColorsData);
      }

    } catch (error) {
    }
  }
  const onProductFabricsFocus = async () => {
    let data = [];
    try {
      if (productFabrics.length === 0) {
        data = await getProductFabrics();
        setProductFabricsLoading(false);
        setProductFabrics(data);
      }

    } catch (error) {
    }
  }
  const onFinish = async (data) => {

    setLoading(true);
    const filesData = files.map((file) => {
      return file.response;
    })

    const orderData = {
      ...data,
      images: filesData,
      createdBy: user.id,
      orderType
    }
    try {
      const response = await axiosClient.post(`/orders/store`, orderData)
      toast.success(response.data.message);
      setLoading(false);
      navigate('/orders');
    } catch (error) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      toast.error(message);
      setLoading(false);
    }

  }

  const renderMerchantInfo =  (
    <>
      <Divider style={{color: colors.primary}}>Merchant Info</Divider>
      <Row gutter={24}>
        <Col xs={24} md={12} lg={6}>
          <Form.Item
            name="merchant"
            label="Merchant"
            rules={[
              {
                required: true,
                message: 'Please input customer name!',
              },
            ]}
          >
            <Select loading={merchantsLoading} onFocus={onMerchantsFocus}>
              {merchants.map(data => {
                return <Option value={data.id} key={data.id}>{data.name}</Option>
              })}
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </>
  )

  const renderCustomerInfo = (
    <>
      <Divider style={{color: colors.primary}}>Customer Info</Divider>
      <Row gutter={24}>
        <Col xs={24} md={12} lg={6}>
          <Form.Item
            name="name"
            label="Customer Name"
            rules={[
              {
                required: true,
                message: 'Please input customer name!',
              },
            ]}
          >
            <Input placeholder="Name"/>
          </Form.Item>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Form.Item
            name="facebookId"
            label="Facebook id"
            rules={[
              {
                required: true,
                message: 'Please input facebook id!',
              },
            ]}
          >
            <Input placeholder="Facebook id"/>
          </Form.Item>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[
              {
                required: true,
                message: 'Please input phone number!',
              },
            ]}
          >
            <Input placeholder="Phone Number"/>
          </Form.Item>

        </Col>
        <Col xs={24} md={12} lg={6}>
          <Form.Item
            name="altPhone"
            label="Alernative Phone Number"
            rules={[
              {
                required: true,
                message: 'Please input Alernative phone number!',
              },
            ]}
          >
            <Input placeholder="Alernative Phone Number"/>
          </Form.Item>

        </Col>
        <Col xs={24} md={12} lg={12}>
          <Form.Item
            name="address"
            label="Address"
            rules={[
              {
                required: true,
                message: 'Please input address!',
              },
            ]}
          >
            <Input.TextArea placeholder="House, road, area...." rows={1}/>
          </Form.Item>
        </Col>
        <Col xs={24} md={12} lg={4}>
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
        <Col xs={24} md={12} lg={4}>
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
        <Col xs={24} md={12} lg={4}>
          <Form.Item
            name="upazila"
            label="Upazila / Thana"
            rules={[
              {
                required: true,
                message: 'Please select district!',
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
    </>

  )
  return (
    <Card title="CREATE NEW ORDER" className="shadow" bodyStyle={{borderRadius: "10px", padding: "20px"}}>
      <Form
        name="normal_login"
        className="login-form"
        layout='vertical'
        initialValues={{
          isMerchant: false,
        }}
        onFinish={onFinish}
      >
        <Row gutter={24}>
          {orderType === OrderTypeEnum.MARKETPLACE ? <Col xs={24} md={12} lg={5}>
            <Form.Item
              name="marketplace"
              label="Marketplace"
              rules={[
                {
                  required: true,
                  message: 'Please select marketplace!',
                },

              ]}>
              <Select loading={marketplaceLoading} onFocus={onUserMarketplaceFocus}>
                {marketplaces.map(data => {
                  return <Option value={data.id} key={data.id}>{data.name}</Option>
                })}
              </Select>
            </Form.Item>
          </Col> : null}
        </Row>

        <Divider style={{color: colors.primary}}>Product Info</Divider>

        <Row>
          <Col xs={24} md={12} lg={16} className="pr-4">
            <Form.List name="products" initialValue={[{
              productType: null,
              productColor: null,
              productFabric: null,
              productDescription: null
            }]}>
              {(fields, {add, remove}) => (
                <>
                  {fields.map(({key, name, ...restField}) => (

                    <Row gutter={24} key={key}>
                      <Col xs={24} md={12} lg={6}>
                        <Form.Item

                          name={[name, 'productType']}
                          label="Product Type"
                          rules={[
                            {
                              required: true,
                              message: 'Please select product type!',
                            },

                          ]}>
                          <Select loading={productTypeLoading} onFocus={onProductTypeFocus}>
                            {productTypes.map(data => {
                              return <Option value={data.id} key={data.id}>{data.name}</Option>
                            })}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12} lg={6}>
                        <Form.Item
                          name={[name, 'productColor']}
                          label="Product Color"
                          rules={[
                            {
                              required: true,
                              message: 'Please select product color!',
                            },

                          ]}>
                          <Select loading={productColorsLoading} onFocus={onProductColorFocus}>
                            {productColors.map(data => {
                              return <Option value={data.id} key={data.id}>{data.name}</Option>
                            })}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12} lg={6}>
                        <Form.Item
                          name={[name, 'productFabric']}
                          label="Product Fabric"
                          rules={[
                            {
                              required: true,
                              message: 'Please select product fabric!',
                            },

                          ]}>
                          <Select loading={productFabricLoading} onFocus={onProductFabricsFocus}>
                            {productFabrics.map(data => {
                              return <Option value={data.id} key={data.id}>{data.name}</Option>
                            })}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12} lg={6}>
                        <Form.Item
                          name={[name, "count"]}
                          label="Count"
                          rules={[
                            {
                              required: true,
                              message: 'Please enter product count!',
                            },

                          ]}>
                          <InputNumber
                            min={1}
                            style={{width: "100%"}}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={24} lg={24}>
                        <Form.Item
                          name={[name, 'productDescription']}
                          label="Product description"
                          rules={[
                            {
                              required: true,
                              message: 'Please input product description!',
                            },
                          ]}
                        >
                          <Input.TextArea rows={2} placeholder="Additional product information ..."/>
                        </Form.Item>
                      </Col>
                    </Row>))}

                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12} lg={12}>
                      <Form.Item>
                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined/>}>
                          Add Another Product
                        </Button>

                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12} lg={12}>
                      <Form.Item>
                        <Button type="dashed" danger onClick={() => fields.length > 1 ? remove(fields.length - 1) : null}
                                disabled={fields.length <= 1} block icon={<MinusOutlined/>}>
                          Remove Last Product
                        </Button>
                      </Form.Item>
                    </Col>
                  </Row>
                </>)}
            </Form.List>
          </Col>
          <Col xs={24} md={12} lg={8} className="pt-8">
            <Form.Item>
              <Dragger {...draggerProps}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined style={{color: colors.secondaryDark}}/>
                </p>
                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                <p className="ant-upload-hint">
                  Support for a single or bulk upload. Strictly prohibit from uploading company data or other
                  band files
                </p>
                <p className="ant-upload-hint font-bold" style={{color:"#E74646"}}>
                  Maximum file size must be less then 5 mb.
                </p>
              </Dragger>
            </Form.Item>
          </Col>
        </Row>

        {orderType === OrderTypeEnum.MARKETPLACE ? renderCustomerInfo : renderMerchantInfo}
        <Divider style={{color: colors.primary}}>Delivery & Billing</Divider>
        <Row gutter={24}>
          <Col xs={24} md={12} lg={6}>
            <Form.Item
              name="deliveryChannel"
              label="Delivery Channel"
              rules={[
                {
                  required: true,
                  message: 'Please select delivery channel!',
                },

              ]}>
              <Select>
                {deliveryChannels.map(data => {
                  return <Option value={data.name} key={data.id}>{data.name}</Option>
                })}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={6}>
            <Form.Item
              name="deliveryDate"
              label="Delivery Date"
              rules={[
                {
                  required: true,
                  message: 'Please input delivery Date!',
                },

              ]}>
              <DatePicker disabledDate={disabledDate} style={{width: "100%"}}/>
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={6}>
            <Form.Item
              name="amount"
              label="Amount (BDT)"
              rules={[
                {
                  required: true,
                  message: 'Please enter amount!',
                },

              ]}>
              <InputNumber
                min={1}
                style={{width: "100%"}}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12} lg={6}>
            <Form.Item
              name="deliveryCharge"
              label="Delivery Charge (BDT)"
              rules={[
                {
                  required: true,
                  message: 'Please input valid delivery charge!',
                },

              ]}>
              <InputNumber
                min={1}
                style={{width: "100%"}}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item style={{float: 'right'}}>
          <Button type="primary" htmlType="submit" loading={loading}>
            Submit Order
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default OrderFrom;
