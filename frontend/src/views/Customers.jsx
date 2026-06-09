import React, { useCallback, useEffect, useState } from 'react';
import { Button, Card, Col, Input, Row, Space, Table, theme } from "antd";
import { DownloadOutlined, UserOutlined } from "@ant-design/icons";
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import useAxiosClient from "../axios-client";

function Customers() {
    const axiosClient = useAxiosClient();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchText, setSearchText] = useState('');
    const [downloading, setDownloading] = useState(false);
    const { token } = theme.useToken();

    const fetchCustomers = useCallback(async (page = 1, search = searchText) => {
        setLoading(true);
        try {
            let link = `/customers/index?page=${page}`;
            if (search) link += `&search=${search}`;
            
            const response = await axiosClient.get(link);
            setLoading(false);
            const customerData = response.data.data.map((data) => {
                return { ...data, key: data.id }
            });
            setCustomers(customerData);
            setTotal(response.data.total);
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Error fetching customers');
            setLoading(false);
        }
    }, [axiosClient, searchText]);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleSearch = (value) => {
        setSearchText(value);
        setPage(1);
        fetchCustomers(1, value);
    };

    const handleTableChange = (pagination) => {
        setPage(pagination.current);
        setPageSize(pagination.pageSize);
        fetchCustomers(pagination.current, searchText);
    };

    const downloadExcel = async () => {
        setDownloading(true);
        try {
            const link = `/customers/export${searchText ? `?search=${searchText}` : ''}`;
            const response = await axiosClient.get(link, { responseType: 'blob' });
            
            // Create a blob URL and trigger download
            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "customers.xlsx";
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            toast.success("File downloaded successfully.");
        } catch (error) {
            console.error("Download Error:", error);
            toast.error(error?.message || 'Error downloading file');
        } finally {
            setDownloading(false);
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <Space><UserOutlined/> <span style={{ fontWeight: 600, color: token.colorTextHeading }}>{text}</span></Space>
        },
        {
            title: 'Phone',
            dataIndex: 'address',
            key: 'phone',
            render: (address, record) => address?.phone || record.alt_phone || <span style={{ color: token.colorTextDescription }}>N/A</span>
        },
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
            render: (address) => {
                if (!address) return <span style={{ color: token.colorTextDescription }}>N/A</span>;
                const parts = [
                    address.address, 
                    address.upazila?.name || address.upazila, 
                    address.district?.name || address.district, 
                    address.division?.name || address.division
                ].filter(Boolean);
                return parts.join(', ');
            }
        },
        {
            title: 'Facebook ID',
            dataIndex: 'facebook_id',
            key: 'facebook_id',
            render: (text) => text || <span style={{ color: token.colorTextDescription }}>N/A</span>
        }
    ];

    return (
        <Space
            direction="vertical"
            size="middle"
            style={{ display: 'flex' }}
        >
            <Card bordered={false} className='shadow-sm hover:shadow-md transition-shadow duration-300'>
                <Row justify='space-between' align="middle" gutter={[16, 16]}>
                    <Col>
                        <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: token.colorTextHeading, margin: 0 }}>Customers</h1>
                    </Col>
                    <Col>
                        <Space>
                            <Input.Search
                                placeholder="Search customers..."
                                onSearch={handleSearch}
                                style={{ width: 250 }}
                                allowClear
                            />
                            <Button 
                                type="primary" 
                                icon={<DownloadOutlined />} 
                                loading={downloading}
                                onClick={downloadExcel}
                                style={{ backgroundColor: downloading ? undefined : '#107c41', borderColor: downloading ? undefined : '#107c41' }}
                            >
                                Export to Excel
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>
            <Card bordered={false} className='shadow-sm'>
                <Table
                    dataSource={customers}
                    columns={columns}
                    loading={loading}
                    scroll={{ x: 600 }}
                    size={'middle'}
                    onChange={handleTableChange}
                    pagination={{
                        current: page,
                        pageSize: pageSize,
                        total: total,
                        showSizeChanger: true,
                    }}
                />
            </Card>
        </Space>
    )
}

export default Customers;
