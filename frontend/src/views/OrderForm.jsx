import React, { useMemo, useState } from 'react';
import { Alert, Button, Col, Form, Input, Row, Select } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import OrderProductForm from "../components/Order/OrderProductForm";
import OrderCustomerForm from "../components/Order/OrderCustomerForm";
import DeliveryFrom from "../components/Order/DeliveryFrom";
import useAxiosClient from "../axios-client";
import { toast } from "react-toastify";
import { useStateContext } from "../contexts/ContextProvider";
import { OrderTypeEnum } from "../utils/enums/OrderTypeEnum";
import { useMarketplaces } from "../hooks/useMarketplaces";
import { useMerchants } from "../hooks/useMerchants";
import { useProductTypes } from "../hooks/useProductTypes";
import { useFabricTypes } from "../hooks/useFabricTypes";
import { useDivisions } from "../hooks/useDivisions";
import { useDistricts } from "../hooks/useDistricts";
import { useUpazilas } from "../hooks/useUpazilas";
import { useFabrics } from "../hooks/useFabrics";

const fmtBDT = (n) => `৳${(Math.round(Number(n) || 0)).toLocaleString('en-US')}`;

// A styled section card matching the redesign.
const SectionCard = ({ title, children }) => (
  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 flex flex-col gap-4">
    <div className="text-sm font-bold text-slate-800 dark:text-white">{title}</div>
    {children}
  </div>
);

const errorLabel = (name) => {
  if (Array.isArray(name) && name[0] === 'products') {
    return `Product ${Number(name[1]) + 1} — ${name[2]}`;
  }
  return Array.isArray(name) ? name.join(' › ') : String(name);
};

const OrderForm = () => {
  const axiosClient = useAxiosClient();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useStateContext();
  const [orderForm] = Form.useForm();
  const [files, setFiles] = useState([]);

  const [orderType, setOrderType] = useState(state?.orderType ?? OrderTypeEnum.MARKETPLACE);
  const isMarketplace = orderType === OrderTypeEnum.MARKETPLACE;

  const { marketplaces } = useMarketplaces();
  const { merchants } = useMerchants();
  const { productTypes } = useProductTypes();
  const { fabricTypes } = useFabricTypes();
  const { fabrics, loadMore, hasMore, fabricsLoading, fetchFabrics } = useFabrics();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorFields, setErrorFields] = useState([]);

  const [selectedDivision, setSelectedDivision] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  const { divisions, divisionLoading } = useDivisions();
  const { districts, districtLoading } = useDistricts(selectedDivision);
  const { upazilas, upazilaLoading } = useUpazilas(selectedDistrict);

  // Live totals for the Order Summary sidebar.
  const productsWatch = Form.useWatch('products', orderForm);
  const deliveryChargeWatch = Form.useWatch('deliveryCharge', orderForm);
  const { lineItems, orderAmount, grandTotal } = useMemo(() => {
    const items = (productsWatch || []).map((p, i) => {
      const qty = Number(p?.quantity) || 0;
      const price = Number(p?.price) || 0;
      const type = productTypes.find((t) => t.id === p?.productType)?.name;
      return { key: i, label: `${type || `Product ${i + 1}`} × ${qty}`, amount: qty * price };
    });
    const amount = items.reduce((sum, li) => sum + li.amount, 0);
    return { lineItems: items, orderAmount: amount, grandTotal: amount + (Number(deliveryChargeWatch) || 0) };
  }, [productsWatch, deliveryChargeWatch, productTypes]);

  const onDivisionSelect = (data) => {
    orderForm.setFieldValue('district', null);
    orderForm.setFieldValue('upazila', null);
    setSelectedDivision(data);
    setSelectedDistrict(null);
  };
  const onDistrictSelect = (data) => {
    orderForm.setFieldValue('upazila', null);
    setSelectedDistrict(data);
  };

  const uploadFile = async (file) => {
    try {
      const response = await axiosClient.post('/files/uploadProductImage', file);
      return response.data;
    } catch (error) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      toast.error(message);
    }
  };
  const isFormDataEmpty = (formData) => formData.entries().next().done;

  const onFinish = async (data) => {
    setLoading(true);
    setErrorFields([]);
    const formData = new FormData();
    (data.images || []).forEach((file) => {
      if (file.status === 'error') return;
      formData.append('images[]', file.originFileObj);
    });
    let images = [];
    if (!isFormDataEmpty(formData)) {
      images = await uploadFile(formData);
    }
    const orderData = { ...data, images, createdBy: user.id, orderType };
    try {
      const response = await axiosClient.post(`/orders/store`, orderData);
      toast.success(response.data.message);
      setLoading(false);
      navigate('/orders');
    } catch (error) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      toast.error(message);
      setLoading(false);
    }
  };

  const onFinishFailed = ({ errorFields: fields }) => {
    setErrorFields(fields || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const summary = (
    <div className="flex flex-col gap-3">
      <div className="text-sm font-bold text-slate-800 dark:text-white">Order summary</div>
      <div className="flex flex-col gap-1.5 max-h-44 overflow-y-auto">
        {lineItems.length ? lineItems.map((li) => (
          <div key={li.key} className="flex justify-between text-[12.5px] text-slate-500 dark:text-slate-400">
            <span className="truncate pr-2">{li.label}</span>
            <span>{fmtBDT(li.amount)}</span>
          </div>
        )) : <div className="text-[12.5px] text-slate-400">No products yet.</div>}
      </div>
      <div className="h-px bg-slate-200 dark:bg-slate-700" />
      <div className="flex justify-between text-[13px] text-slate-500 dark:text-slate-400"><span>Order amount</span><span>{fmtBDT(orderAmount)}</span></div>
      <div className="flex justify-between text-[13px] text-slate-500 dark:text-slate-400"><span>Delivery charge</span><span>{fmtBDT(deliveryChargeWatch)}</span></div>
      <div className="h-px bg-slate-200 dark:bg-slate-700" />
      <div className="flex justify-between text-base font-bold text-slate-800 dark:text-white"><span>Grand total</span><span>{fmtBDT(grandTotal)}</span></div>
      <Button type="primary" htmlType="submit" size="large" block loading={loading} disabled={uploading} className="mt-1.5">
        Create order
      </Button>
    </div>
  );

  return (
    <div className="animate-fade-in pb-24 lg:pb-0">
      <div className="text-[12.5px] text-slate-400 mb-3">
        Orders <span className="mx-1">/</span> <span className="text-slate-700 dark:text-slate-200 font-medium">Create Order</span>
      </div>
      <div className="text-[22px] font-bold text-slate-800 dark:text-white mb-4">Create New Order</div>

      {errorFields.length > 0 && (
        <Alert
          type="error"
          showIcon
          className="!mb-4 !rounded-xl"
          message={`Please fix ${errorFields.length} issue(s) below before submitting`}
          description={
            <ul className="list-disc pl-4 text-[12.5px]">
              {errorFields.slice(0, 8).map((f, i) => (
                <li key={i}>{errorLabel(f.name)} — {f.errors?.[0]}</li>
              ))}
            </ul>
          }
        />
      )}

      <Form
        name="order_form"
        form={orderForm}
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex-1 min-w-0 flex flex-col gap-4 w-full">
            <SectionCard title="Order type">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <Form.Item label={<span className="opacity-0 select-none">.</span>} colon={false} className="!mb-0">
                <div className="flex gap-1 p-1 rounded-[10px] bg-slate-100 dark:bg-slate-900 w-full sm:w-auto sm:min-w-[300px]">
                  {[
                    { title: 'Marketplace', value: OrderTypeEnum.MARKETPLACE },
                    { title: 'Merchant', value: OrderTypeEnum.MERCHANT },
                  ].map((opt) => (
                    <div
                      key={opt.value}
                      onClick={() => setOrderType(opt.value)}
                      className={`flex-1 text-center py-2 px-6 rounded-lg text-[13px] font-semibold cursor-pointer transition-colors ${
                        orderType === opt.value ? 'bg-primary text-white' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {opt.title}
                    </div>
                  ))}
                </div>
                </Form.Item>
                {isMarketplace && (
                  <Form.Item
                    name="marketplace"
                    label="Marketplace"
                    className="!mb-0 w-full sm:max-w-xs"
                    rules={[{ required: true, message: 'Please select a marketplace!' }]}
                  >
                    <Select placeholder="Select marketplace">
                      {marketplaces.map((m) => <Select.Option value={m.id} key={m.id}>{m.name}</Select.Option>)}
                    </Select>
                  </Form.Item>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Product info">
              <OrderProductForm
                productTypes={productTypes}
                fabricTypes={fabricTypes}
                fabrics={fabrics}
                loadMore={loadMore}
                hasMore={hasMore}
                fabricsLoading={fabricsLoading}
                fetchFabrics={fetchFabrics}
                orderForm={orderForm}
                setUploading={setUploading}
                setFiles={setFiles}
                files={files}
              />
            </SectionCard>

            {isMarketplace ? (
              <SectionCard title="Customer info">
                <OrderCustomerForm
                  divisions={divisions}
                  districts={districts}
                  upazilas={upazilas}
                  divisionLoading={divisionLoading}
                  districtLoading={districtLoading}
                  upazilaLoading={upazilaLoading}
                  onDivisionSelect={onDivisionSelect}
                  onDistrictSelect={onDistrictSelect}
                  orderForm={orderForm}
                />
              </SectionCard>
            ) : (
              <SectionCard title="Merchant info">
                <Row gutter={16} style={{ maxWidth: 560 }}>
                  <Col xs={24} md={12}>
                    <Form.Item name="merchant" label="Merchant"
                      rules={[{ required: true, message: 'Please select a merchant!' }]}>
                      <Select placeholder="Select merchant">
                        {merchants.map((m) => <Select.Option value={m.id} key={m.id}>{m.name}</Select.Option>)}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="merchantRef" label="Reference number"
                      rules={[{ required: true, message: 'Please enter a reference number!' }]}>
                      <Input placeholder="e.g. REF-2026-0142" />
                    </Form.Item>
                  </Col>
                </Row>
              </SectionCard>
            )}

            <SectionCard title="Delivery & billing">
              <DeliveryFrom />
            </SectionCard>
          </div>

          <div className="hidden lg:block w-[320px] flex-shrink-0 sticky top-20">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
              {summary}
            </div>
          </div>
        </div>

        {/* Mobile sticky total + submit bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-4 py-2.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400">Grand total</div>
            <div className="text-base font-bold text-slate-800 dark:text-white">{fmtBDT(grandTotal)}</div>
          </div>
          <Button type="primary" htmlType="submit" loading={loading} disabled={uploading}>Create order</Button>
        </div>
      </Form>
    </div>
  );
};

export default OrderForm;
