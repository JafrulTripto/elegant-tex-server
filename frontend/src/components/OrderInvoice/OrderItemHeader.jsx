import React from 'react';
import { StyleSheet, Text, View } from "@react-pdf/renderer";

const OrderItemHeader = ({title}) => {
  const styles = StyleSheet.create({
    wrapper: {flexGrow:1, paddingTop:5, paddingBottom:10},
    border: {borderStyle:"solid", borderWidth:1,borderColor:"#979dac", borderLeftWidth:0, borderRightWidth:0},
    text: {fontWeight:600, textAlign:"left", margin: 5,fontSize: 12}
  });
  return (
    <View style={styles.wrapper}>
      <View style={styles.border}>
        <Text style={styles.text}>{title}</Text>
      </View>
    </View>
  );
};

export default OrderItemHeader;
