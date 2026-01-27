import React from 'react';
import { StyleSheet, Text, View } from "@react-pdf/renderer";
import OrderItemHeader from "./OrderItemHeader";

const CustomerDetails = ({ customer }) => {
  const styles = StyleSheet.create({
    table: {
      display: "table",
      width: "auto",
      borderStyle: "solid",
      borderColor: "#bfbfbf",
      borderWidth: 0,
      borderBottomWidth: 1,
      marginBottom: 10
    },
    tableHeadRow: {
      flexDirection: "row",
      color: "#2b2d42",
      borderBottomColor: "#ededed",
      borderBottomWidth: 1,
      alignItems: 'center',
      minHeight: 24,
    },
    leftCol: {
      fontWeight: "bold",
      width: "25%",
      color: "#6b7280",
      paddingLeft: 5
    },
    rightCol: {
      width: "75%",
      paddingRight: 5
    },
    tableHeadCell: {
      textAlign: "left",
      margin: 4,
      fontSize: 10,
    },
    valueCell: {
      textAlign: "left",
      margin: 4,
      fontSize: 10,
      color: "#111827"
    }
  })

  if (!customer) return null;

  const address = customer.address || {};
  const primaryPhone = address.phone || customer.phone || 'N/A';
  const altPhone = customer.altPhone ? `, ${customer.altPhone}` : '';

  const fullAddress = [
    address.address,
    address.upazila?.name,
    address.district?.name,
    address.division?.name
  ].filter(Boolean).join(', ');

  return (
    <View style={styles.table}>
      <OrderItemHeader title="Customer Information" />
      <View style={styles.tableHeadRow}>
        <View style={styles.leftCol}>
          <Text style={styles.tableHeadCell}>Customer Name</Text>
        </View>
        <View style={styles.rightCol}>
          <Text style={styles.valueCell}>{customer.name}</Text>
        </View>
      </View>
      <View style={styles.tableHeadRow}>
        <View style={styles.leftCol}>
          <Text style={styles.tableHeadCell}>Phone</Text>
        </View>
        <View style={styles.rightCol}>
          <Text style={styles.valueCell}>{primaryPhone}{altPhone}</Text>
        </View>
      </View>
      <View style={styles.tableHeadRow}>
        <View style={styles.leftCol}>
          <Text style={styles.tableHeadCell}>Address</Text>
        </View>
        <View style={styles.rightCol}>
          <Text style={styles.valueCell}>{fullAddress}</Text>
        </View>
      </View>
    </View>
  );
};

export default CustomerDetails;
