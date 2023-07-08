import React from 'react';
import {View, Text, StyleSheet} from "@react-pdf/renderer";

const InvoiceProductTable = ({ products }) => {

  const styles = StyleSheet.create({
    table: {
      display: "table",
      width: "auto",
      borderStyle: "solid",
      borderColor:"#bfbfbf",
    },
    tableRow: {
      margin: "auto",
      flexDirection: "row"
    },
    tableCol: {
      width: "14%",
      borderColor:"#bfbfbf",
      borderStyle: "solid",

    },
    tableCell: {
      margin: "auto",
      marginTop: 5,
      marginBottom: 5,
      paddingLeft:5,
      paddingRight:5,
      fontSize: 10
    },
    tableHeadRow: {
      margin: "auto",
      flexDirection: "row",
      backgroundColor:"#daddd8",
      color:"#2b2d42"
    },
    tableHeadCol: {
      width: "14%",
      borderStyle: "solid",
      borderColor:"#bfbfbf",
    },
    tableHeadCell: {
      margin: "auto",
      marginTop: 8,
      marginBottom:8,
      fontSize: 12,
      fontWeight: 'bold'
    }
  });
  return (
    <View style={styles.table}>
      <View style={styles.tableHeadRow}>
        <View style={styles.tableHeadCol}>
          <Text style={styles.tableHeadCell}>Product</Text>
        </View>
        <View style={styles.tableHeadCol}>
          <Text style={styles.tableHeadCell}>Fabric</Text>
        </View>
        <View style={[styles.tableHeadCol, {width:"30%"}]}>
          <Text style={styles.tableHeadCell}>Description</Text>
        </View>
        <View style={styles.tableHeadCol}>
          <Text style={styles.tableHeadCell}>Quantity</Text>
        </View>
        <View style={styles.tableHeadCol}>
          <Text style={styles.tableHeadCell}>Price</Text>
        </View>
      </View>
      {products.map(product => {
        return(
          <View style={styles.tableRow} key={product.id}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{product.productType.name}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{product.fabrics.name}</Text>
            </View>
            {/*<View style={styles.tableCol}>*/}
            {/*  <Text style={styles.tableCell}>{product.productFabric.name}</Text>*/}
            {/*</View>*/}
            <View style={[styles.tableCol, {width:"30%"}]}>
              <Text style={styles.tableCell}>{product.description}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{product.unit} pc.</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{product.price} tk</Text>
            </View>
          </View>
        )
      })}
    </View>
  );
};

export default InvoiceProductTable;
