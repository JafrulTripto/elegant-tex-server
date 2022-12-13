import React, {useEffect, useState} from 'react';
import {Button, Card, Col, List, Modal, Row, Space, Typography} from "antd";
import axiosClient from "../axios-client.js";
import {toast} from "react-toastify";
import {PlusOutlined} from "@ant-design/icons";
import ProductSettingsForm from "../components/Settings/ProductSettings/ProductSettingsFrom";
import {colors} from "../utils/Colors.js";

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
  }
]

const ProductSettings = () => {
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
    return () => {

    }
  }, [])
  const handleProductSettingsFetch = (element) => {
    if (element === 'fabric') {
      return getProductFabrics;
    } else if (element === 'color') {
      return getProductColors;
    } else  {
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


  const rolesListHeader = (productSettingsList) => {

    return (<Row>
      <Col xl={16} md={12} sm={12}><Title type='secondary' level={3}>{productSettingsList.element}</Title></Col>
      <Col xl={8} md={12} sm={12} type="flex" align="end">
        <Button type="primary" onClick={() => handleOnClickButton(productSettingsList)}
                icon={<PlusOutlined/>}>Add {productSettingsList.element}</Button>
      </Col>
    </Row>)
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
        {/* <AddNewItemLayout buttonText="Add Role" onClickButton={handleOnClickButton} /> */}
        <Row gutter={[12, 12]}>
          {
            productSettingsListsData.map((productSettingsList) => {

              return <Col xs={24} md={12} lg={12} key={productSettingsList.key}>
                <Card className='shadow'>
                  <List
                    style={{height: 350}}
                    header={rolesListHeader(productSettingsList)}
                    bordered
                    loading={productSettingsList.isDataLoading}
                    size={"small"}
                    dataSource={productSettingsList.data}
                    renderItem={(item) => (
                      <List.Item key={item.id}
                                 onClick={() => assignUserRole(item.name)}
                                 actions={[
                                   [
                                     <Button key="edit" type='link' size='small'
                                             onClick={() => editRole(item)}>Edit</Button>,
                                     <Button key="delete" type='text' size='small' danger
                                             onClick={() => handleDeleteRole(item.id)}>Delete</Button>
                                   ]
                                 ]}>
                        <Button type="link" style={{color: colors.secondary}}>{item.name}</Button>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            })
          }

          <Col xs={24} md={16} lg={16}>

          </Col>
          <Col xs={24} md={24} lg={24}>

          </Col>
        </Row>
      </Space>
      <ProductSettingsForm element={productSettingElement} open={isModalOpen} handleClose={handleCancel}/>
    </>)
};

export default ProductSettings;
