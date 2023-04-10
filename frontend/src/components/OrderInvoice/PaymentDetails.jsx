import React from 'react';
import {StyleSheet, Text, View} from "@react-pdf/renderer";
import OrderItemHeader from "./OrderItemHeader";

const PaymentDetails = ({paymentDetails}) => {
  const styles = StyleSheet.create({
    table: {
      display: "table",
      width: "auto",

    },
    tableHeadRow: {
      flexDirection: "row",
      color: "#2b2d42",
    },
    leftCol: {
      width: "80%",

    },
    rightCol: {
      width: "20%",

    },
    tableHeadCell: {
      textAlign:"right",
      margin: 5,
      fontSize: 12,
    }
  })
  return (
    <View style={styles.table}>
      <OrderItemHeader title="Payment Information"/>
      <View style={styles.tableHeadRow}>
        <View style={styles.leftCol}>
          <Text style={styles.tableHeadCell}>Payment Subtotal</Text>
        </View>
        <View style={styles.rightCol}>
          <Text style={styles.tableHeadCell}>{paymentDetails.amount} tk</Text>
        </View>
      </View>
      <View style={styles.tableHeadRow}>
        <View style={styles.leftCol}>
          <Text style={styles.tableHeadCell}>Delivery Charge</Text>
        </View>
        <View style={styles.rightCol}>
          <Text style={styles.tableHeadCell}>{paymentDetails.deliveryCharge} tk</Text>
        </View>
      </View>
      <View style={styles.tableHeadRow}>
        <View style={styles.leftCol}>
          <Text style={[styles.tableHeadCell, {fontWeight:"bold"}]}>Total Amount</Text>
        </View>
        <View style={styles.rightCol}>
          <Text style={[styles.tableHeadCell,  {fontWeight:"bold"}]}>{paymentDetails.totalAmount} tk</Text>
        </View>
      </View>
    </View>
  );
};

export default PaymentDetails;
