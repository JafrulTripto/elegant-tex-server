import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import InvoiceQR from './InvoiceQR';
import { orderDeepLink } from '../../utils/orderQr';
import './registerInvoiceFonts';

// A compact scannable sticker (ADR 0005) — the QR plus the order number and party,
// sized for a label printer. Separate from the full invoice so staff can reprint a
// code without the whole document.
const st = StyleSheet.create({
  page: { fontFamily: 'CourierPrime', paddingVertical: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center' },
  meta: { marginLeft: 12, flex: 1 },
  id: { fontSize: 17, fontWeight: 700 },
  party: { fontFamily: 'HindSiliguri', fontSize: 9, color: '#555555', marginTop: 3 },
  hint: { fontSize: 7, color: '#888888', marginTop: 5 },
});

const OrderQrLabel = ({ order }) => (
  <Document>
    <Page size={{ width: 226, height: 120 }} style={st.page}>
      <InvoiceQR value={orderDeepLink(order.id)} size={94} />
      <View style={st.meta}>
        <Text style={st.id}>#{order.id}</Text>
        <Text style={st.party}>{order.orderable?.name || order.customer?.name || ''}</Text>
        <Text style={st.hint}>Scan to update status</Text>
      </View>
    </Page>
  </Document>
);

export default OrderQrLabel;
