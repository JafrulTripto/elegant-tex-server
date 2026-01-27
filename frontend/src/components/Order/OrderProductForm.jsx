import React from 'react';
import { Avatar, Button, Col, Form, Input, InputNumber, Row, Select, Upload } from "antd";
import { InboxOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { colors } from "../../utils/Colors";
import { toast } from "react-toastify";

const OrderProductForm = (props) => {

    const { Option } = Select;
    const { Dragger } = Upload;
    const { files, loadMore, hasMore, fabricsLoading } = props;

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

    const handlePopupScroll = (e) => {
        const { target } = e;
        if (
            !fabricsLoading &&
            hasMore &&
            target.scrollTop + target.offsetHeight >= target.scrollHeight - 10
        ) {
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
    const filterOptionFunction = (input, option) => {
        return (option?.title ?? '').toLowerCase().includes(input.toLowerCase())
    };
    return (
        <Row>
            <Col xs={24} md={12} lg={16} className="pr-4">
                <Form.List name="products" initialValue={[{
                    productType: null,
                    fabrics: null,
                    productDescription: null
                }]}>
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (

                                <Row gutter={24} key={key}>
                                    <Col xs={24} md={12} lg={8}>
                                        <Form.Item
                                            name={[name, 'productType']}
                                            label="Product Type"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: 'Please select product type!',
                                                },

                                            ]}>
                                            <Select size="large">
                                                {props.productTypes.map(data => {
                                                    return <Option value={data.id} key={data.id}>{data.name}</Option>
                                                })}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12} lg={8}>
                                        <Form.Item
                                            name={[name, 'fabrics']}
                                            label="Fabric"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: 'Please select fabric!',
                                                },

                                            ]}>
                                            <Select
                                                size="large"
                                                showSearch
                                                defaultActiveFirstOption={false}
                                                filterOption={false}
                                                onSearch={(value) => {
                                                    // Simple debounce
                                                    if (window.searchTimeout) clearTimeout(window.searchTimeout);
                                                    window.searchTimeout = setTimeout(() => {
                                                        props.fetchFabrics(1, value);
                                                    }, 800);
                                                }}
                                                onPopupScroll={handlePopupScroll}
                                            >
                                                {props.fabrics.map(data => {
                                                    return <Option title={data.name} value={data.id} key={data.id}>
                                                        <span>
                                                            <Avatar shape="square" src={`${process.env.REACT_APP_API_BASE_URL}/files/upload/${data.image.id}`} />
                                                            <span style={{ marginLeft: '10px' }}>{data.name}</span>
                                                        </span>
                                                    </Option>
                                                })}
                                                {fabricsLoading && (
                                                    <Option value="loading" disabled>
                                                        <div style={{ textAlign: 'center', padding: '10px' }}>Loading...</div>
                                                    </Option>
                                                )}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12} lg={4}>
                                        <Form.Item
                                            name={[name, "quantity"]}
                                            label="Quantity"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: 'Please enter product count!',
                                                },

                                            ]}>
                                            <InputNumber
                                                size="large"
                                                min={0}
                                                style={{ width: "100%" }}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12} lg={4}>
                                        <Form.Item
                                            name={[name, "price"]}
                                            label="Price"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: 'Please enter product price!',
                                                },

                                            ]}>
                                            <InputNumber
                                                size="large"
                                                min={0}
                                                style={{ width: "100%" }}
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
                                            <Input.TextArea rows={2} placeholder="Additional product information ..." />
                                        </Form.Item>
                                    </Col>

                                    <Col xs={24} md={24} lg={24}>
                                        <Row gutter={[16, 16]}>
                                            <Col xs={24} md={12} lg={12}>
                                                <Form.Item>
                                                    <Button type="dashed" onClick={() => add()} block
                                                        icon={<PlusOutlined />}>
                                                        Add Product
                                                    </Button>

                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} md={12} lg={12}>
                                                <Form.Item>
                                                    <Button type="dashed" danger
                                                        onClick={() => fields.length > 1 ? remove(key) : null}
                                                        disabled={fields.length <= 1} block icon={<MinusOutlined />}>
                                                        Remove Product
                                                    </Button>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>))}


                        </>)}
                </Form.List>
            </Col>
            <Col xs={24} md={12} lg={8} className="pt-8">
                <Form.Item
                    name="images"
                    initialValue={files}
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                >
                    <Dragger {...draggerProps} fileList={files}>
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined className="text-blue-700 dark:text-blue-400" />
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
            </Col>
        </Row>
    );
};

export default OrderProductForm;
