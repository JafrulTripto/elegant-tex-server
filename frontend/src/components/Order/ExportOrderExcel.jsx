import React, { Fragment, useState } from 'react';
import { Button, DatePicker, Modal } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExport } from "@fortawesome/free-solid-svg-icons";
import { colors } from "../../utils/Colors";
import { Radio, Space } from 'antd';
import useAxiosClient from "../../axios-client";
import { useStateContext } from "../../contexts/ContextProvider";
import { toast } from "react-toastify";
import * as XLSX from 'xlsx'; // Importing XLSX for Excel generation
import dayjs from 'dayjs'; // Using dayjs for date formatting
import isBetween from 'dayjs/plugin/isBetween';
import {OrderStatusEnum} from "../../utils/enums/OrderStatusEnum"; // Import for date comparison

dayjs.extend(isBetween); // Extend dayjs with the isBetween plugin

const ExportOrderExcel = (props) => {
  const axiosClient = useAxiosClient();
  const { RangePicker } = DatePicker;
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportExcelDates, setExportExcelDates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderType, setOrderType] = useState('marketplace');
  const { user } = useStateContext();

  const onChange = (e) => {
    setOrderType(e.target.value);
  };

  const exportOrderToExcel = () => {
    setIsExportModalOpen(true);
  };

  const submitExcelExport = async () => {
    if (!exportExcelDates) {
      toast.error("Please select a date range");
      return;
    }

    // Restrict date range to a maximum of 2 months
    const startDate = exportExcelDates[0];
    const endDate = exportExcelDates[1];

    if (endDate.diff(startDate, 'month') > 2) {
      toast.error("Please select a date range of up to 2 months.");
      return;
    }

    setLoading(true);
    const userId = user.id;
    const formattedStartDate = startDate.format("YYYY-MM-DD");
    const formattedEndDate = endDate.format("YYYY-MM-DD");

    let url = orderType === 'marketplace'
      ? `/orders/getMarketplaceOrders/${userId}?`
      : `/orders/getMerchantOrders?`;
    url += `orderDateStart=${formattedStartDate}&orderDateEnd=${formattedEndDate}&paginate=false`;

    try {
      const ordersResponse = await axiosClient.get(`${url}`);
      setLoading(false);
      const ordersData = ordersResponse.data.data;

      // Check if there are any orders to export
      if (ordersData.length === 0) {
        toast.error("No orders found for the selected date range.");
        return;
      }

      const formattedOrders = formatOrdersForExcel(ordersData); // Format the orders
      generateExcel(formattedOrders); // Generate and download Excel

      // Clear selected dates after export
      setExportExcelDates(null);
      setIsExportModalOpen(false);
    } catch (error) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      toast.error(message);
      setLoading(false);
    }
  };

  // Function to format order data for Excel export
  const formatOrdersForExcel = (orders) => {
    return orders.map(order => ({
      'Order ID': `ET-ORD-${order.id}`, // Format Order ID
      'Ordered By': order.orderedBy,
      'Created By': order.createdBy,
      'Status': getOrderStatusLabel(order.status), // Convert status using enum
      'Total Amount': order.totalAmount,
      'Created At': dayjs(order.createdAt).format("DD-MM-YYYY"), // Format date with dayjs
      'Delivery Date': dayjs(order.deliveryDate).format("DD-MM-YYYY") // Format date with dayjs
      // Exclude 'orderType' field
    }));
  };

  // Function to convert order status using OrderStatusEnum
  const getOrderStatusLabel = (statusValue) => {
    const status = OrderStatusEnum.find(s => s.value === statusValue);
    return status ? status.label : 'Unknown';
  };

  // Function to generate and download Excel file
  const generateExcel = (orders) => {
    const worksheet = XLSX.utils.json_to_sheet(orders);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    // Trigger file download
    XLSX.writeFile(workbook, `Orders_${orderType}_${exportExcelDates[0].format("YYYYMMDD")}-${exportExcelDates[1].format("YYYYMMDD")}.xlsx`);
  };

  const handleExportModalCancel = () => {
    setIsExportModalOpen(false);
  };

  // Disable dates after today
  const disabledDate = (current) => {
    return current && current > dayjs().endOf('day'); // Disable dates after today
  };

  return (
    <Fragment>
      <Button type="primary"
              onClick={() => exportOrderToExcel()}
              loading={loading}
              icon={<FontAwesomeIcon
                icon={faFileExport}
                style={{ paddingRight: "10px", color: colors.secondary }} />}>Export Excel
      </Button>

      <Modal title="Export orders (Excel)" width={350} okText="Export" open={isExportModalOpen} onOk={submitExcelExport} onCancel={handleExportModalCancel}>
        <Space direction="vertical" size={12}>
          <RangePicker
            format="DD/MM/YYYY"
            value={exportExcelDates}
            onChange={(dates) => setExportExcelDates(dates)}
            disabledDate={disabledDate} // Disable dates after today
          />
          <Radio.Group onChange={onChange} value={orderType}>
            <Space direction="horizontal">
              <Radio value={"marketplace"}>Marketplace</Radio>
              <Radio value={"merchant"}>Merchant</Radio>
            </Space>
          </Radio.Group>
        </Space>
      </Modal>
    </Fragment>
  );
};

export default ExportOrderExcel;
