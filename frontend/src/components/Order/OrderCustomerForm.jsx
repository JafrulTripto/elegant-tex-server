import React, { useState, useRef, useCallback } from "react";
import { Col, Form, Input, Row, Select, Tag, AutoComplete, Avatar } from "antd";
import {
  SearchOutlined,
  CheckCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import useAxiosClient from "../../axios-client";
import { toast } from "react-toastify";

const OrderCustomerForm = (props) => {
  const { Option } = Select;
  const axiosClient = useAxiosClient();

  const {
    districts,
    districtLoading,
    upazilas,
    upazilaLoading,
    divisionLoading,
    divisions,
    orderForm,
    onDivisionSelect,
    onDistrictSelect,
    onCustomerFound,
  } = props;

  const [searching, setSearching] = useState(false);
  const [customerFound, setCustomerFound] = useState(null);
  const [fieldsDisabled, setFieldsDisabled] = useState(false);
  const [autocompleteOptions, setAutocompleteOptions] = useState([]);
  const searchTimeout = useRef(null);

  const handleSearch = useCallback(
    (query) => {
      // Clear previous timeout
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }

      // Reset state when query is too short
      if (!query || query.trim().length < 3) {
        setAutocompleteOptions([]);
        setCustomerFound(null);
        setFieldsDisabled(false);
        return;
      }

      searchTimeout.current = setTimeout(async () => {
        setSearching(true);
        try {
          const res = await axiosClient.get(
            `/customers/searchByPhone?phone=${encodeURIComponent(query.trim())}`,
          );
          const customers = res.data;

          setAutocompleteOptions(
            customers.map((c) => ({
              value: String(c.id),
              label: (
                <div className="flex items-center gap-3 py-1">
                  <Avatar
                    size="small"
                    icon={<UserOutlined />}
                    style={{
                      backgroundColor: "#fde3cf",
                      color: "#f56a00",
                      flexShrink: 0,
                    }}
                  />
                  <div className="flex flex-col leading-tight min-w-0">
                    <span className="font-medium text-sm truncate">
                      {c.name}
                    </span>
                    <span className="text-xs text-gray-400">{c.phone}</span>
                  </div>
                </div>
              ),
              customer: c,
            })),
          );
        } catch (error) {
          const message =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString();
          toast.error(message);
        } finally {
          setSearching(false);
        }
      }, 400);
    },
    [axiosClient],
  );

  const handleSelect = useCallback(
    (value, option) => {
      const c = option.customer;
      if (!c) return;

      setCustomerFound(true);
      setFieldsDisabled(true);

      const divisionId = c.division?.value;
      const districtId = c.district?.value;
      const upazilaId = c.upazila?.value ?? null;

      // Trigger cascade loading for district and upazila dropdowns
      if (onDivisionSelect) onDivisionSelect(divisionId);
      if (onDistrictSelect) onDistrictSelect(districtId);

      orderForm.setFieldsValue({
        phone: c.phone,
        name: c.name,
        facebookId: c.facebook,
        altPhone: c.altPhone,
        address: c.address,
        division: divisionId,
        district: districtId,
        upazila: upazilaId,
      });
    },
    [onDivisionSelect, onDistrictSelect, orderForm],
  );

  return (
    <div>
      {/* Phone Search — matching md={8} width like name/facebook/altPhone */}
      <Row gutter={24} className="mb-2">
        <Col xs={24} md={8}>
          <Form.Item
            name="phone"
            label={
              <span>
                Phone Number{" "}
                <span className="text-gray-400 font-normal">
                  (Search existing customer)
                </span>
              </span>
            }
            rules={[
              {
                required: true,
                message: "Please input phone number!",
              },
            ]}
          >
            <AutoComplete
              options={autocompleteOptions}
              onSearch={handleSearch}
              onSelect={handleSelect}
              notFoundContent={
                searching ? (
                  <div className="text-center py-2 text-gray-400">
                    Searching...
                  </div>
                ) : undefined
              }
            >
              <Input
                placeholder="Type phone number to search..."
                prefix={
                  searching ? (
                    <span className="ant-spin-container">
                      <span className="ant-spin ant-spin-sm">
                        <i className="ant-spin-dot-item" />
                      </span>
                    </span>
                  ) : (
                    <SearchOutlined className="text-gray-400" />
                  )
                }
              />
            </AutoComplete>
          </Form.Item>
        </Col>
        <Col xs={24} md={16} className="flex items-end pb-1">
          {customerFound === true && (
            <Tag
              icon={<CheckCircleOutlined />}
              color="success"
              className="mb-2 px-3 py-1 text-sm"
            >
              Existing customer — auto-filled
            </Tag>
          )}
        </Col>
      </Row>

      {/* Customer Detail Fields */}
      <Row gutter={24}>
        <Col xs={24} md={8}>
          <Form.Item
            name="name"
            label="Customer Name"
            rules={[{ required: true, message: "Please input customer name!" }]}
          >
            <Input placeholder="Name" disabled={fieldsDisabled} />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            name="facebookId"
            label="Facebook id"
            rules={[{ required: true, message: "Please input facebook id!" }]}
          >
            <Input placeholder="Facebook id" disabled={fieldsDisabled} />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            name="altPhone"
            label="Alternative Phone Number"
            rules={[
              {
                required: true,
                message: "Please input alternative phone number!",
              },
            ]}
          >
            <Input placeholder="Alternative Phone Number" disabled={fieldsDisabled} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: "Please input address!" }]}
          >
            <Input.TextArea placeholder="House, road, area...." rows={1} disabled={fieldsDisabled} />
          </Form.Item>
        </Col>
        <Col xs={24} md={4}>
          <Form.Item
            name="division"
            label="Division"
            rules={[{ required: true, message: "Please select division!" }]}
          >
            <Select loading={divisionLoading} onSelect={onDivisionSelect} disabled={fieldsDisabled}>
              {divisions.map((data) => (
                <Option value={data.id} key={data.id}>
                  {data.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} md={4}>
          <Form.Item
            name="district"
            label="District"
            rules={[{ required: true, message: "Please select district!" }]}
          >
            <Select loading={districtLoading} onSelect={onDistrictSelect} disabled={fieldsDisabled}>
              {districts.map((data) => (
                <Option value={data.id} key={data.id}>
                  {data.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} md={4}>
          <Form.Item
            name="upazila"
            label="Upazila / Thana"
            rules={[{ required: true, message: "Please select upazila!" }]}
          >
            <Select loading={upazilaLoading} disabled={fieldsDisabled}>
              {upazilas.map((data) => (
                <Option value={data.id} key={data.id}>
                  {data.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};

export default OrderCustomerForm;
