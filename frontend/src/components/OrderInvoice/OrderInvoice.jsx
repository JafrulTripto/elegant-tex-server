import React from 'react';
import {Page, Text, View, Image, Document, StyleSheet, Font} from '@react-pdf/renderer';
import InvoiceProductTable from "./InvoiceProductTable";
import RobotoRegular from "../../assets/fonts/Roboto/Roboto-Regular.ttf";
import RobotoBold from "../../assets/fonts/Roboto/Roboto-Bold.ttf";
import RobotoLight from "../../assets/fonts/Roboto/Roboto-Light.ttf";
import InvoiceHeader from "./InvoiceHeader";
import PaymentDetails from "./PaymentDetails";
import OrderImage from "./OrderImage";
import OrderDeliveryDetails from "./OrderDeliveryDetails";
import CustomerDetails from "./CustomerDetails";
import OrderItemHeader from "./OrderItemHeader";
import {OrderTypeEnum} from "../../utils/enums/OrderTypeEnum";

Font.register({
  family: 'Roboto', fonts: [
    {src: RobotoRegular}, // font-style: normal, font-weight: normal
    {src: RobotoBold},
    {src: RobotoLight, fontStyle: 'italic', fontWeight: 700},
  ]
});
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    backgroundColor: '#ffffff',
    color: "#0d1321"
  },
  section: {
    margin: 20,
    padding: 20,
    flexGrow: 1
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 10
  },
  text: {
    fontSize: "12px"
  },
  productTable: {
    padding: "10px 0"
  }
});

const OrderInvoice = ({order}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <InvoiceHeader order={order}/>
          {order.orderType === OrderTypeEnum.MARKETPLACE ? <CustomerDetails customer={order.customer}/> : null}
          <View style={styles.productTable}>
            <OrderItemHeader title="Prodcut Information"/>
            <InvoiceProductTable products={order.products}/>
          </View>

         <OrderImage images={order.images}/>
          <View style={{padding:"10px 0"}}>
            <PaymentDetails paymentDetails={order.payment}/>
          </View>
          <View>
            <OrderItemHeader title="Delivery Information"/>
            <OrderDeliveryDetails deliveryChannel={order.deliveryChannel.name} deliveryDate={order.deliveryDate}/>
          </View>
        </View>

      </Page>
    </Document>
  );
}

export default OrderInvoice;
