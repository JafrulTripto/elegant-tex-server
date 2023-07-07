import React from 'react';
import { Row, Space } from "antd";
import ProductSettingsItem from "../components/Settings/ProductSettings/ProductSettingsItem.jsx";
import {useProductColors} from "../hooks/useProductColors.jsx";
import {useProductFabrics} from "../hooks/useProductFabrics.jsx";
import {useProductTypes} from "../hooks/useProductTypes.jsx";
import {useDeliveryChannels} from "../hooks/useDeliveryChannels.jsx";
import MaterialSettings from "../components/Settings/ProductSettings/MaterialSettings";
const ProductSettings = () => {

    const {productColors, productColorLoading, fetchProductColors} = useProductColors();
    const {productFabrics, productFabricsLoading, fetchProductFabrics} = useProductFabrics();
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
                <MaterialSettings/>
                <ProductSettingsItem settingsType={{title: "Delivery Channel", key: "deliveryChannels"}} data={deliveryChannels}
                                     loading={deliveryChannelsLoading} fetch={fetchDeliveryChannels}/>
                <ProductSettingsItem settingsType={{title: "Product Type", key: "productTypes"}} data={productTypes}
                                     loading={productTypesLoading} fetch={fetchProductTypes}/>
            </Row>
        </Space>
    )
}

export default ProductSettings;
