import React from 'react';
import { StyleSheet, Text, View } from "@react-pdf/renderer";
import dayjs from "dayjs";

const OrderDeliveryDetails = (props) => {

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
      <View style={styles.tableHeadRow}>
        <View style={styles.leftCol}>
          <Text style={styles.tableHeadCell}>Delivery Date</Text>
        </View>
        <View style={styles.rightCol}>
          <Text style={styles.tableHeadCell}>{dayjs(props.deliveryDate).format('DD MMMM YYYY')}</Text>
        </View>
      </View>
      <View style={styles.tableHeadRow}>
        <View style={styles.leftCol}>
          <Text style={styles.tableHeadCell}>Delivery Channel</Text>
        </View>
        <View style={styles.rightCol}>
          <Text style={styles.tableHeadCell}>{props.deliveryChannel}</Text>
        </View>
      </View>
    </View>
  );
};

export default OrderDeliveryDetails;
