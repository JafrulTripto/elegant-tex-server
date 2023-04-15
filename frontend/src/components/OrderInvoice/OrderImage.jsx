import React from 'react';
import { Image, View, Text, StyleSheet } from "@react-pdf/renderer";
import OrderItemHeader from "./OrderItemHeader";

const OrderImage = ({images}) => {

  const styles = StyleSheet.create({
    text: {
      fontSize: "12px",
      fontWeight:"bold",
      color: "#E74646"
    },
  });

  return (
    <View>
      <OrderItemHeader title="Order Images"/>
      {images.length > 0 ? <View style={{flexDirection: "row"}}>
        {images.map(image => {
          return (
            <Image src={`${process.env.REACT_APP_API_BASE_URL}/files/upload/${image.id}`} key={image.id}
                   style={{height: "100px", width: "100px", paddingRight: 5}}/>
          )
        })}
      </View> : <View>
        <Text style={styles.text}>No order images found.</Text>
      </View>
      }
    </View>

  );
};

export default OrderImage;
