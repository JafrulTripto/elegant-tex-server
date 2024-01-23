import React from 'react';
import { Image, View, Text, StyleSheet } from "@react-pdf/renderer";
import OrderItemHeader from "./OrderItemHeader";

const OrderImage = ({ images }) => {
  const styles = StyleSheet.create({
    container: {
      flexDirection: "column",
    },
    imageRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "flex-start",
    },
    imageWrapper: {
      width: "33.33%", // Each image takes 1/3 of the container width
      marginBottom: 10,
    },
    image: {
      width: "100%",
      height: "auto", // Maintain aspect ratio
      maxHeight: "150px",
      maxWidth: "150px",
    },
    text: {
      fontSize: "12px",
      fontWeight: "bold",
      color: "#E74646",
    },
  });

  return (
    <View style={styles.container}>
      <OrderItemHeader title="Order Images" />
      {images.length > 0 ? (
        <View style={styles.imageRow}>
          {images.map((image) => (
            <View key={image.id} style={styles.imageWrapper}>
              <Image
                src={`${process.env.REACT_APP_API_BASE_URL}/files/upload/${image.id}`}
                style={styles.image}
              />
            </View>
          ))}
        </View>
      ) : (
        <View>
          <Text style={styles.text}>No order images found.</Text>
        </View>
      )}
    </View>
  );
};

export default OrderImage;
