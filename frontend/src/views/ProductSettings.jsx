import React from 'react';
import { Tabs, Typography } from "antd";
import ProductSettingsItem from "../components/Settings/ProductSettings/ProductSettingsItem.jsx";
import { useProductTypes } from "../hooks/useProductTypes.jsx";
import { useDeliveryChannels } from "../hooks/useDeliveryChannels.jsx";
import FabricsSettings from "../components/Settings/ProductSettings/FabricsSettings";
import { AppstoreOutlined, BuildOutlined, RocketOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const ProductSettings = () => {

    const { productTypes, productTypesLoading, fetchProductTypes } = useProductTypes();
    const { deliveryChannels, deliveryChannelsLoading, fetchDeliveryChannels } = useDeliveryChannels();

    const items = [
        {
            key: '1',
            label: (
                <span className="flex items-center gap-2 px-2">
                    <AppstoreOutlined />
                    Fabric Library
                </span>
            ),
            children: <FabricsSettings />,
        },
        {
            key: '2',
            label: (
                <span className="flex items-center gap-2 px-2">
                    <BuildOutlined />
                    Product Types
                </span>
            ),
            children: (
                <ProductSettingsItem
                    settingsType={{ title: "Product Types", key: "productTypes", description: "Define categories for products" }}
                    data={productTypes}
                    loading={productTypesLoading}
                    fetch={fetchProductTypes}
                />
            ),
        },
        {
            key: '3',
            label: (
                <span className="flex items-center gap-2 px-2">
                    <RocketOutlined />
                    Delivery Channels
                </span>
            ),
            children: (
                <ProductSettingsItem
                    settingsType={{ title: "Delivery Channels", key: "deliveryChannels", description: "Manage available delivery methods" }}
                    data={deliveryChannels}
                    loading={deliveryChannelsLoading}
                    fetch={fetchDeliveryChannels}
                />
            ),
        },
    ];

    return (
        <div className="animate-fade-in">
            <div className="mb-6">
                <Title level={2} className="!mb-0">Product Settings</Title>
                <Text type="secondary">Manage product attributes, fabrics, and configurations</Text>
            </div>

            <Tabs
                defaultActiveKey="1"
                items={items}
                className="product-settings-tabs"
                size="large"
                tabBarStyle={{ marginBottom: 24 }}
            />
        </div>
    )
}

export default ProductSettings;
