import React, {useEffect, useState} from 'react';
import {Button, Card, Col, List, Modal, Row, Space, Table, Typography} from "antd";
import useAxiosClient from "../axios-client.js";
import {toast} from "react-toastify";
import {PlusOutlined} from "@ant-design/icons";
import ProductSettingsForm from "../components/Settings/ProductSettings/ProductSettingsFrom";
import {colors} from "../utils/Colors.js";
import {useDeliveryChannels} from "../hooks/useDeliveryChannels";

const productSettingsLists = [
  {
    key: 'color',
    element: 'Color',
    data: [],
    isDataLoading: false
  },
  {
    key: 'fabric',
    element: 'Fabric',
    data: [],
    isDataLoading: false
  },
  {
    key: 'productType',
    element: 'Product Type',
    data: [],
    isDataLoading: false
  },
  {
    key: 'deliveryChannel',
    element: 'Delivery Channel',
    data: [],
    isDataLoading: false
  }
]

const columns = [
  {
    title: 'Name',
    key: 'name',
    dataIndex: 'name',
    width: "75%"
  },
  {
    title: 'Action',
    key: 'action',
    width: "25%",
    render: (_, record) => (
      <Space size="middle">
        <a>Edit</a>
        <a>Delete</a>
      </Space>
    ),
  },
];

const ProductSettings = () => {
  const axiosClient = useAxiosClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productSettingsListsData, setProductSettingsListsData] = useState(productSettingsLists);
  const [isLoading, setIsLoading] = useState(false)
  const [roles, setRoles] = useState([]);
  const [role, setRole] = useState(null);
  const [productSettingElement, setProductSettingElement] = useState({});
  const {Title} = Typography;


  useEffect(() => {
    let newState = [...productSettingsListsData]
    setProductSettingsListsData(newState);
    getProductColors();
    getProductFabrics();
    getProductTypes();
    getDeliveryChannels();
    return () => {

    }
  }, [])
  const handleProductSettingsFetch = (element) => {
    if (element === 'fabric') {
      return getProductFabrics;
    } else if (element === 'color') {
      return getProductColors;
    } else if (element === 'deliveryChannel') {
      return getDeliveryChannels;
    } else {
      return getProductTypes;
    }
  }

  const handleOnClickButton = (el) => {
    setIsModalOpen(true);
    const data = {
      ...el, fetchFunc: handleProductSettingsFetch(el.key)
    }
    setProductSettingElement(data)

  }

  const getProductColors = async () => {

    let newState = [...productSettingsListsData]
    newState[0].isDataLoading = true;
    try {
      const response = await axiosClient.get(`/settings/colors/index`);

      newState[0].data = response.data.data;
      newState[0].isDataLoading = false;

      setProductSettingsListsData(newState)
    } catch (error) {
      toast.error(error.response.data.message);
      newState[0].isDataLoading = false;
      setProductSettingsListsData(newState);
    }

  }
  const getProductFabrics = async () => {
    let newState = [...productSettingsListsData]
    newState[1].isDataLoading = true;
    try {
      const response = await axiosClient.get(`/settings/fabrics/index`);

      newState[1].data = response.data.data;
      newState[1].isDataLoading = false;

      setProductSettingsListsData(newState)
    } catch (error) {
      toast.error(error.response.data.message);
      newState[1].isDataLoading = false;
      setProductSettingsListsData(newState);
    }

  }
  const getProductTypes = async () => {

    let newState = [...productSettingsListsData]
    newState[2].isDataLoading = true;
    try {
      const response = await axiosClient.get(`/settings/productTypes/index`);

      newState[2].data = response.data.data;
      newState[2].isDataLoading = false;

      setProductSettingsListsData(newState)
    } catch (error) {
      toast.error(error.response.data.message);
      newState[2].isDataLoading = false;
      setProductSettingsListsData(newState);
    }

  }
  const getDeliveryChannels = async () => {

    let newState = [...productSettingsListsData]
    newState[3].isDataLoading = true;
    try {
      const response = await axiosClient.get(`/settings/deliveryChannels/index`);

      newState[3].data = response.data.data;
      newState[3].isDataLoading = false;

      setProductSettingsListsData(newState)
    } catch (error) {
      toast.error(error.response.data.message);
      newState[3].isDataLoading = false;
      setProductSettingsListsData(newState);
    }

  }


  const handleCancel = () => {
    setIsModalOpen(false);
  };
  // const onFinish = async (data) => {
  //     try {
  //         setIsLoading(true);
  //         const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/settings/createRole`, data);
  //         setIsLoading(false);
  //         toast.success(response.data.message);
  //         setIsModalOpen(false);
  //         getRoles();
  //     } catch (error) {
  //         toast.error(error.response.statusText);
  //     }
  // }

  const editRole = (item) => {
  }
  const handleDeleteRole = (roleId) => {
    Modal.confirm({
      title: 'Are you sure want to delete this role?',
      okText: "Yes",
      okType: "danger",
      onOk: () => confirmDeleteRole(roleId)
    })
  }
  const confirmDeleteRole = (item) => {
    axiosClient.get(`/roles/deleteRole?roleId=${item}`).then(response => {
      toast.success(response.data);
      //getRoles();
    })
  }
  const assignUserRole = (item) => {
    setRole(item);
  }


  const tableHeader = (productSettingsList) => {

    return (
      <div className="flex justify-between">
        <div className="rounded-t mb-0 bg-transparent">
          <div className="flex flex-wrap items-center">
            <div className="relative w-full max-w-full flex-grow flex-1">
              <h6 className="uppercase mb-1 text-xs font-semibold text-blueGray-500">Settings</h6>
              <h2 className="text-xl mb-0 font-semibold text-blueGray-800">{productSettingsList.element}</h2></div>
          </div>

        </div>
        <div>
          <Button type="primary" onClick={() => handleOnClickButton(productSettingsList)}
                  icon={<PlusOutlined/>}>Add {productSettingsList.element}
          </Button>
        </div>
      </div>
    );
  }


  return (
    <>
      <Space
        direction="vertical"
        size="middle"
        style={{
          display: 'flex',
        }}
      >
        <Row gutter={[12, 12]}>
          {
            productSettingsListsData.map((productSettingsList) => {

              return <Col xs={24} md={12} lg={12} key={productSettingsList.key}>
                <Table loading={productSettingsList.isDataLoading}
                       pagination={{
                         pageSize: 5
                       }}
                       rowKey={"id"}
                       columns={columns}
                       title={() => tableHeader(productSettingsList)}
                       dataSource={productSettingsList.data}/>
              </Col>
            })
          }
        </Row>
      </Space>
      <ProductSettingsForm element={productSettingElement} open={isModalOpen} handleClose={handleCancel}/>
    </>)
};

export default ProductSettings;
