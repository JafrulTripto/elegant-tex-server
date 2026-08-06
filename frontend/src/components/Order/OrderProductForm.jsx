import React from 'react';
import { Avatar, Button, Col, Form, Input, InputNumber, Row, Select, Upload } from "antd";
import { InboxOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";

const fmtBDT = (n) => `৳${(Math.round(Number(n) || 0)).toLocaleString('en-US')}`;

const OrderProductForm = (props) => {

    const { Option } = Select;
    const { Dragger } = Upload;
    const { files, loadMore, hasMore, fabricsLoading, orderForm } = props;

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

    // Live per-card subtotals.
    const productsWatch = Form.useWatch('products', orderForm);

    const handlePopupScroll = (e) => {
        const { target } = e;
        if (!fabricsLoading && hasMore && target.scrollTop + target.offsetHeight >= target.scrollHeight - 10) {
            loadMore();
        }
    };

    const draggerProps = {
        name: "orderImage",
        accept: "image/*",
        multiple: true,
        listType: "picture",
        maxCount: 7,
        onRemove: (file) => {
            const index = props.files.indexOf(file);
            const newFileList = props.files.slice();
            newFileList.splice(index, 1);
            props.setFiles(newFileList);
            if (props.removedFiles) {
                props.setRemovedFiles([...props.removedFiles, file]);
            }
        },
        beforeUpload(file) {
            const fileSize = file.size / 1024 / 1024; // Convert size to MB
            if (fileSize > 5) {
                file.status = 'error';
                toast.error('File size must be smaller than 5MB');
                return false; // Prevent upload
            }
            props.setFiles([...files, file]);
            return false;
        },
        files
    };
    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e.filter(file => file.size <= MAX_FILE_SIZE);
        }
        return e?.fileList.filter(file => file.size <= MAX_FILE_SIZE);
    };

    return (
        <>
            <Form.List name="products" initialValue={[{
                productType: null,
                fabrics: null,
                fabricType: null,
                productDescription: null
            }]}>
                {(fields, { add, remove }) => (
                    <div className="flex flex-col gap-3">
                        {fields.map(({ key, name }) => {
                            const p = productsWatch?.[name] || {};
                            const subtotal = (Number(p.quantity) || 0) * (Number(p.price) || 0);
                            return (
                                <div key={key} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[12.5px] font-bold text-slate-500 dark:text-slate-400">Product {name + 1}</span>
                                        <span className="text-[13px] font-bold text-slate-800 dark:text-white">Subtotal: {fmtBDT(subtotal)}</span>
                                    </div>
                                    <Row gutter={16}>
                                        <Col xs={24} md={12} lg={8}>
                                            <Form.Item name={[name, 'productType']} label="Product Type"
                                                rules={[{ required: true, message: 'Please select product type!' }]}>
                                                <Select>
                                                    {props.productTypes.map(data => (
                                                        <Option value={data.id} key={data.id}>{data.name}</Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={12} lg={8}>
                                            <Form.Item name={[name, 'fabrics']} label="Fabric Color"
                                                rules={[{ required: true, message: 'Please select fabric color!' }]}>
                                                <Select
                                                    showSearch
                                                    defaultActiveFirstOption={false}
                                                    filterOption={false}
                                                    onSearch={(value) => {
                                                        if (window.searchTimeout) clearTimeout(window.searchTimeout);
                                                        window.searchTimeout = setTimeout(() => props.fetchFabrics(1, value), 800);
                                                    }}
                                                    onPopupScroll={handlePopupScroll}
                                                >
                                                    {props.fabrics.map(data => (
                                                        <Option title={data.name} value={data.id} key={data.id}>
                                                            <span>
                                                                <Avatar shape="square" src={`${process.env.REACT_APP_API_BASE_URL}/files/upload/${data.image.id}`} />
                                                                <span style={{ marginLeft: '10px' }}>{data.name}</span>
                                                            </span>
                                                        </Option>
                                                    ))}
                                                    {fabricsLoading && (
                                                        <Option value="loading" disabled>
                                                            <div style={{ textAlign: 'center', padding: '10px' }}>Loading...</div>
                                                        </Option>
                                                    )}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={12} lg={8}>
                                            <Form.Item name={[name, 'fabricType']} label="Fabric Type"
                                                rules={[{ required: true, message: 'Please select fabric type!' }]}>
                                                <Select>
                                                    {props.fabricTypes.map(data => (
                                                        <Option value={data.id} key={data.id}>{data.name}</Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={12} lg={6}>
                                            <Form.Item name={[name, "quantity"]} label="Quantity"
                                                rules={[{ required: true, message: 'Please enter quantity!' }]}>
                                                <InputNumber min={1} style={{ width: "100%" }} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={12} lg={6}>
                                            <Form.Item name={[name, "price"]} label="Unit price"
                                                rules={[{ required: true, message: 'Please enter price!' }]}>
                                                <InputNumber min={0} placeholder="0" style={{ width: "100%" }} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} lg={12}>
                                            <Form.Item name={[name, 'productDescription']} label="Description"
                                                rules={[{ required: true, message: 'Please input product description!' }]}>
                                                <Input.TextArea rows={1} placeholder="Additional product details..." />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <div className="flex justify-end">
                                        <Button size="small" danger type="text" icon={<MinusOutlined />}
                                            disabled={fields.length <= 1}
                                            onClick={() => fields.length > 1 && remove(name)}>
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                        <Button type="dashed" block icon={<PlusOutlined />} onClick={() => add()}
                            style={{ height: 42, fontWeight: 600 }}>
                            Add another product
                        </Button>
                    </div>
                )}
            </Form.List>

            <div className="h-px bg-slate-200 dark:bg-slate-700 my-3" />
            <div className="text-sm font-bold text-slate-800 dark:text-white mb-2">Order images</div>
            <Form.Item name="images" initialValue={files} valuePropName="fileList" getValueFromEvent={normFile} noStyle>
                <Dragger {...draggerProps} fileList={files}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined className="text-blue-700 dark:text-blue-400" />
                    </p>
                    <p className="ant-upload-text">Click or drag images here to upload</p>
                    <p className="ant-upload-hint mb-1">Single or bulk upload — JPG or PNG, up to 5MB each.</p>
                </Dragger>
            </Form.Item>
        </>
    );
};

export default OrderProductForm;
