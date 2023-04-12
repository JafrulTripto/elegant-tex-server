import React from 'react';
import {StyleSheet, Text, View} from "@react-pdf/renderer";
import OrderItemHeader from "./OrderItemHeader";

const CustomerDetails = ({customer}) => {
  const styles = StyleSheet.create({
    table: {
      display: "table",
      width: "auto",
      borderStyle: "solid",
      borderColor: "#bfbfbf",

    },
    tableHeadRow: {
      flexDirection: "row",
      color: "#2b2d42",
    },
    leftCol: {
      fontWeight:"bold",
      width: "20%",
      color:"#979dac"
    },
    rightCol: {
      width: "75%",
    },
    tableHeadCell: {
      textAlign:"left",
      margin: 3,
      fontSize: 12,

    }
  })
  return (
    <View style={styles.table}>
      <OrderItemHeader title="Customer Infromation"/>
      <View style={styles.tableHeadRow}>
        <View style={styles.leftCol}>
          <Text style={styles.tableHeadCell}>Customer Name</Text>
        </View>
        <View style={styles.rightCol}>
          <Text style={styles.tableHeadCell}>{customer.name}</Text>
        </View>
      </View>
      <View style={styles.tableHeadRow}>
        <View style={styles.leftCol}>
          <Text style={styles.tableHeadCell}>Phone</Text>
        </View>
        <View style={styles.rightCol}>
          <Text style={styles.tableHeadCell}>{customer.address.phone}, {customer.altPhone}</Text>
        </View>
      </View>
      <View style={styles.tableHeadRow}>
        <View style={styles.leftCol}>
          <Text style={styles.tableHeadCell}>Address</Text>
        </View>
        <View style={styles.rightCol}>
          <Text style={styles.tableHeadCell}>{customer.address.address}, {customer.address.upazila.name}, {customer.address.district.name}, {customer.address.division.name}</Text>
        </View>
      </View>
    </View>
  );
};

export default CustomerDetails;
