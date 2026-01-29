import React, { useEffect, useState } from 'react';
import { Button, Card, Divider, Form } from "antd";
import OrderTypeFrom from "../components/Order/OrderTypeFrom";
import { colors } from "../utils/Colors";
import OrderProductForm from "../components/Order/OrderProductForm";
import OrderCustomerForm from "../components/Order/OrderCustomerForm";
import DeliveryFrom from "../components/Order/DeliveryFrom";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import useAxiosClient from "../axios-client";
import { toast } from "react-toastify";
import Loading from "../components/Util/Loading";
import { useMerchants } from "../hooks/useMerchants";
import { useMarketplaces } from "../hooks/useMarketplaces";
import { OrderTypeEnum } from "../utils/enums/OrderTypeEnum";
import * as dayjs from 'dayjs'
import { useProductTypes } from "../hooks/useProductTypes";
import { useDistricts } from "../hooks/useDistricts";
import { useUpazilas } from "../hooks/useUpazilas";
import { useDivisions } from "../hooks/useDivisions";
import { useFabrics } from "../hooks/useFabrics";
import { extractOrderNumber } from "../components/Util/OrderNumberFormatter";

const EditOrderFrom = () => {

  const axiosClient = useAxiosClient();

  const navigate = useNavigate()
  const [updateOrderForm] = Form.useForm();
  const { state } = useLocation();
  const { id } = useParams(); // Get ID from URL

  // orderId logic: URL param > state > null
  const orderId = id ? extractOrderNumber(id) : state?.order?.id;

  const [files, setFiles] = useState([]);
  const [removedFiles, setRemovedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [order, setOrder] = useState({});
  const [orderLoading, setOrderLoading] = useState(true);

  const { marketplaces } = useMarketplaces();
  const { merchants } = useMerchants();


  const { productTypes } = useProductTypes();
  const { fabrics, loadMore, hasMore, fabricsLoading, fetchFabrics, setFabrics } = useFabrics();


  const [selectedDivision, setSelectedDivision] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  const { divisions, divisionLoading } = useDivisions();
  const { districts, districtLoading } = useDistricts(selectedDivision);
  const { upazilas, upazilaLoading } = useUpazilas(selectedDistrict);

  // ... (select handlers skipped, same as before)
  const onDivisionSelect = (data) => {
    updateOrderForm.setFieldValue('district', null);
    updateOrderForm.setFieldValue('upazila', null);
    setSelectedDivision(data);
    setSelectedDistrict(null);
  }
  const onDistrictSelect = (data) => {
    updateOrderForm.setFieldValue('upazila', null);
    setSelectedDistrict(data);
  }

  // ... (setNewValues logic same as before, no changes needed inside function)
  function setNewValues(ord) {

    if (ord.orderType === 1) {
      setSelectedDivision(+ord.customer.address.division.value);
      setSelectedDistrict(+ord.customer.address.district.value)
      return {
        marketplace: ord.orderable.id,
        name: ord.customer.name,
        division: +ord.customer.address.division.value,
        district: +ord.customer.address.district.value,
        upazila: +ord.customer.address.upazila.value,
        address: ord.customer.address.address,
        facebookId: ord.customer.facebook,
        phone: ord.customer.address.phone,
        altPhone: ord.customer.altPhone,
        deliveryCharge: ord.payment.deliveryCharge,
        deliveryDate: dayjs(ord.deliveryDate, "YYYY-MM-DD"),
        deliveryChannel: +ord.deliveryChannel.value,
        products: ord.products.map((product) => {
          return {
            productDescription: product.description,
            quantity: product.unit,
            price: product.price,
            productType: product.productType.value,
            fabrics: product.fabrics.value
          }
        }),


      }
    }
    return {
      merchant: ord.orderable.id,
      deliveryCharge: ord.payment.deliveryCharge,
      deliveryDate: dayjs(ord.deliveryDate, "YYYY-MM-DD"),
      deliveryChannel: +ord.deliveryChannel.value,
      products: ord.products.map((product) => {
        return {
          productDescription: product.description,
          quantity: product.unit,
          price: product.price,
          productType: product.productType.value,
          fabrics: product.fabrics.value
        }
      }),

    }
  }

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) {
        return;
      }
      try {
        setOrderLoading(true)
        const result = await axiosClient.get(`/orders/getOrder/${orderId}`);
        setOrder({ ...result.data.data })
        const o = result.data.data;

        const newValues = setNewValues(o);

        // Pre-fill fabrics list with existing order fabrics to display names correctly
        const existingFabrics = o.products.map(p => ({
          id: p.fabrics.value,
          name: p.fabrics.name,
          image: { id: p.fabrics.image } // Structure expected by OrderProductForm
        }));

        setFabrics(prev => {
          const combined = [...prev];
          existingFabrics.forEach(ef => {
            if (!combined.find(f => f.id === ef.id)) {
              combined.push(ef);
            }
          });
          return combined;
        });

        const imageWithUrl = o.images.map((image) => {
          return {
            ...image,
            url: `${process.env.REACT_APP_API_BASE_URL}/files/upload/${image.id}`
          }
        });
        setFiles(imageWithUrl);
        updateOrderForm.setFieldsValue(newValues);
        setOrderLoading(false)
      } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        toast.error(message);
        setOrderLoading(false);
      }
    }

    fetchOrder();
  }, [axiosClient, navigate, orderId, updateOrderForm, setFabrics]) // Added setFabrics dependency

  if (orderLoading) { // Simplistic loading check
    return <Loading layout={'default'} />
  }

  // ... (upload logic same)
  const uploadFile = async (files) => {
    try {
      const response = await axiosClient.post('/files/uploadProductImage', files);
      return response.data;
    } catch (error) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      toast.error(message);
    }

  }
  const isFormDataEmpty = (formData) => {
    const iterator = formData.entries();
    return iterator.next().done;
  }

  const removeImages = async (imagePath) => {
    const data = {
      imagePath: imagePath
    }
    try {
      const response = await axiosClient.post('/files/delete', data);

      return response.data;
    } catch (error) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      toast.error(message);
    }
  }

  const onFinish = async (data) => {
    setLoading(true);
    const formData = new FormData();
    const alreadyUploaded = [];
    let images = [];
    let uploadedImages = [];

    // Safety check for images
    if (data.images) {
      data.images.forEach((file) => {
        if (file.status === 'error') {
          return;
        }
        if (file.originFileObj) {
          formData.append('images[]', file.originFileObj);
        } else {
          alreadyUploaded.push(file)
        }
      });
    }

    if (!isFormDataEmpty(formData)) {
      uploadedImages = [...await uploadFile(formData)];
    }
    if (removedFiles.length !== 0) {
      removedFiles.forEach(file => {
        if (file.path) {
          removeImages(file.path);
        }
      })
    }
    images = [...alreadyUploaded, ...uploadedImages];

    const orderData = {
      ...data,
      images: images,
      createdBy: order.createdBy,
      orderType: order.orderType,
      amount: order.payment.amount
    }

    try {
      const response = await axiosClient.put(`/orders/update/${order.id}`, orderData);
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
    <Card title="UPDATE ORDER" className="shadow" bodyStyle={{ borderRadius: "10px", padding: "20px" }}>
      <Form
        name="update_order_form"
        form={updateOrderForm}
        className="order-form"
        layout='vertical'
        initialValues={{
          isMerchant: false,
        }}
        onFinish={onFinish}
      >
        <OrderTypeFrom orderForm={updateOrderForm} orderType={order.orderType}
          data={order.orderType === OrderTypeEnum.MERCHANT ? merchants : marketplaces} />
        <Divider>Product Info</Divider>
        <OrderProductForm
          productTypes={productTypes}
          fabrics={fabrics}
          loadMore={loadMore}
          hasMore={hasMore}
          fabricsLoading={fabricsLoading}
          fetchFabrics={fetchFabrics}
          orderForm={updateOrderForm}
          setUploading={setUploading}
          setFiles={setFiles}
          setRemovedFiles={setRemovedFiles}
          removedFiles={removedFiles}
          files={files} />
        {order.orderType === 1 ?
          <>
            <Divider>Customer Info</Divider>
            <OrderCustomerForm
              divisions={divisions}
              districts={districts}
              upazilas={upazilas}
              divisionLoading={divisionLoading}
              districtLoading={districtLoading}
              upazilaLoading={upazilaLoading}
              onDivisionSelect={onDivisionSelect}
              onDistrictSelect={onDistrictSelect}
              orderForm={updateOrderForm}
            />
          </>
          : null}
        <Divider>Delivery & Billing</Divider>
        <DeliveryFrom />
        <Form.Item style={{ float: 'right' }}>
          <Button type="primary" htmlType="submit" loading={loading} disabled={uploading}>
            Update Order
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default EditOrderFrom;
