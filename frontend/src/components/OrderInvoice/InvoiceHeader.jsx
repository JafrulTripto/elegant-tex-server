import React from 'react';
import {StyleSheet, View, Text, Image} from "@react-pdf/renderer";
import ETLogo from "../../assets/images/elegant_tex_logo.jpg"
import dayjs from "dayjs";
import {formatOrderNumber} from "../Util/OrderNumberFormatter";

const InvoiceHeader = ({order}) => {

  const styles = StyleSheet.create({
    flex: {
      display: "flex",
      flexDirection:"row",
      justifyContent:"space-between"
    },
    logo: {
      height: 80,
      width: 80
    },
    orderInfoLabel: {
      paddingRight:20,
      fontWeight:500,
      color:"#979dac"
    }
  })
  return (
    <View style={styles.flex}>
      <View>
        <Image style={styles.logo} src={ETLogo}/>
      </View>
      <View>
        <View style={{fontWeight:700, paddingBottom:15}}>
          <Text>INVOICE</Text>
        </View>
        <View style={[styles.flex, {fontSize:10}]}>
          <View style={styles.orderInfoLabel}>
            <Text>Order no.</Text>
            <Text>Ordered By</Text>
            <Text>Order Issued</Text>
            <Text>Status</Text>
          </View>
          <View>
            <Text>{formatOrderNumber(order.id)}</Text>
            <Text>{order.orderable.name}</Text>
            <Text>{dayjs(order.createdAt).format('DD MMMM YYYY')}</Text>
            <Text style={{fontWeight: 500}}>{order.status}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default InvoiceHeader;
