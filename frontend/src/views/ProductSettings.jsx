import React from 'react';
import { Row, Space } from "antd";
import ProductSettingsItem from "../components/Settings/ProductSettings/ProductSettingsItem.jsx";
import {useProductColors} from "../hooks/useProductColors.jsx";
import {useProductFabrics} from "../hooks/useProductFabrics.jsx";
import {useProductTypes} from "../hooks/useProductTypes.jsx";
import {useDeliveryChannels} from "../hooks/useDeliveryChannels.jsx";
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
                <ProductSettingsItem settingsType={{title: "Color", key: "colors"}} data={productColors}
                                     loading={productColorLoading} fetch={fetchProductColors}/>
                <ProductSettingsItem settingsType={{title: "Fabric", key: "fabrics"}} data={productFabrics}
                                     loading={productFabricsLoading} fetch={fetchProductFabrics}/>
                <ProductSettingsItem settingsType={{title: "Product Type", key: "productTypes"}} data={productTypes}
                                     loading={productTypesLoading} fetch={fetchProductTypes}/>
                <ProductSettingsItem settingsType={{title: "Delivery Channel", key: "deliveryChannels"}} data={deliveryChannels}
                                     loading={deliveryChannelsLoading} fetch={fetchDeliveryChannels}/>
            </Row>
        </Space>
    )
}

export default ProductSettings;
