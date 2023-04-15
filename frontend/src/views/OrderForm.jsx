import React, {useEffect, useState} from 'react';
import {Button, Card, Divider, Form} from "antd";
import {useLocation, useNavigate} from "react-router-dom";
import OrderTypeFrom from "../components/Order/OrderTypeFrom";
import OrderProductForm from "../components/Order/OrderProductForm";
import OrderCustomerForm from "../components/Order/OrderCustomerForm";
import {colors} from "../utils/Colors";
import DeliveryFrom from "../components/Order/DeliveryFrom";
import useAxiosClient from "../axios-client";
import {toast} from "react-toastify";
import {useStateContext} from "../contexts/ContextProvider";
import {OrderTypeEnum} from "../utils/enums/OrderTypeEnum";
import {useMarketplaces} from "../hooks/useMarketplaces";
import {useMerchants} from "../hooks/useMerchants";
import {useProductColors} from "../hooks/useProductColors";
import {useProductFabrics} from "../hooks/useProductFabrics";
import {useProductTypes} from "../hooks/useProductTypes";
import {useDivisions} from "../hooks/useDivisions";
import {useDistricts} from "../hooks/useDistricts";
import {useUpazilas} from "../hooks/useUpazilas";

const OrderForm = () => {
  const axiosClient = useAxiosClient();
  const {state} = useLocation();
  const navigate = useNavigate()
  const {user} = useStateContext();
  const [orderForm] = Form.useForm();
  const [files, setFiles] = useState([]);
  const {orderType} = state ? state : {};

  const {marketplaces} = useMarketplaces();
  const {merchants} = useMerchants();

  const {productColors} = useProductColors();
  const {productFabrics} = useProductFabrics();
  const {productTypes} = useProductTypes();



  useEffect(() => {
    if (!state) {
      navigate('/orders')
    }
  }, [state, navigate]);


  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [selectedDivision, setSelectedDivision] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  const {divisions, divisionLoading} = useDivisions();
  const {districts, districtLoading} = useDistricts(selectedDivision);
  const {upazilas, upazilaLoading} = useUpazilas(selectedDistrict);

  const onDivisionSelect = (data) => {
    orderForm.setFieldValue('district', null);
    orderForm.setFieldValue('upazila', null);
    setSelectedDivision(data);
    setSelectedDistrict(null);
  }
  const onDistrictSelect = (data) => {
    orderForm.setFieldValue('upazila', null);
    setSelectedDistrict(data);
  }

  const uploadFile = async (file) => {
    try {
      const response =  await axiosClient.post('/files/uploadProductImage', file);

      return response.data;
    } catch(error)  {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      toast.error(message);
    }

  }
  const isFormDataEmpty = (formData) => {
    const iterator = formData.entries();
    return iterator.next().done;
  }

  const onFinish = async (data) => {
    setLoading(true);
    const formData = new FormData();
    data.images.forEach((file) => {
      if (file.status === 'error'){
        return;
      }
      formData.append('images[]', file.originFileObj);
    });
    let images =[];
    if (!isFormDataEmpty(formData)) {
      images = await uploadFile(formData);
    }
    let amount = 0;
    data.products.forEach(product => {
      amount += product.price;
    })

    const orderData = {
      ...data,
      images: images,
      createdBy: user.id,
      orderType,
      amount
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

  return (
    <Card title="CREATE NEW ORDER" className="shadow" bodyStyle={{borderRadius: "10px", padding: "20px"}}>
      <Form
        name="order_form"
        form={orderForm}
        className="order-form"
        layout='vertical'
        initialValues={{
          isMerchant: false,
        }}
        onFinish={onFinish}
      >
        <OrderTypeFrom orderForm={orderForm} orderType={state.orderType} data = {state.orderType === OrderTypeEnum.MERCHANT ? merchants : marketplaces}/>
        <Divider style={{color: colors.primary}}>Product Info</Divider>
        <OrderProductForm
          productTypes={productTypes}
          productColors={productColors}
          productFabrics={productFabrics}
          orderForm={orderForm}
          setUploading={setUploading}
          setFiles={setFiles}
          files={files}/>
        {orderType === 1 ?
          <>
            <Divider style={{color: colors.primary}}>Customer Info</Divider>
            <OrderCustomerForm
              divisions={divisions}
              districts={districts}
              upazilas={upazilas}
              divisionLoading={divisionLoading}
              districtLoading={districtLoading}
              upazilaLoading={upazilaLoading}
              onDivisionSelect={onDivisionSelect}
              onDistrictSelect={onDistrictSelect}
              orderForm={orderForm}/>
          </>
          : null}
        <Divider style={{color: colors.primary}}>Delivery & Billing</Divider>
        <DeliveryFrom/>
        <Form.Item style={{float: 'right'}}>
          <Button type="primary" htmlType="submit" loading={loading} disabled={uploading}>
            Submit Order
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default OrderForm;
