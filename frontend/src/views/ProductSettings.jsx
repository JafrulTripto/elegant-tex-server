import React from 'react';
import { Row, Space } from "antd";
import ProductSettingsItem from "../components/Settings/ProductSettings/ProductSettingsItem.jsx";
import {useProductTypes} from "../hooks/useProductTypes.jsx";
import {useDeliveryChannels} from "../hooks/useDeliveryChannels.jsx";
import FabricsSettings from "../components/Settings/ProductSettings/FabricsSettings";
const ProductSettings = () => {


    const {productTypes, productTypesLoading, fetchProductTypes} = useProductTypes();
    const {deliveryChannels, deliveryChannelsLoading, fetchDeliveryChannels} = useDeliveryChannels();

    return (
        <Space
            direction="vertical"
            size="middle"
            style={{
                display: 'flex',
            }}
        >
            <Row gutter={[12, 12]}>
                <FabricsSettings/>
                <ProductSettingsItem settingsType={{title: "Delivery Channel", key: "deliveryChannels"}} data={deliveryChannels}
                                     loading={deliveryChannelsLoading} fetch={fetchDeliveryChannels}/>
                <ProductSettingsItem settingsType={{title: "Product Type", key: "productTypes"}} data={productTypes}
                                     loading={productTypesLoading} fetch={fetchProductTypes}/>
            </Row>
        </Space>
    )
}

export default ProductSettings;
