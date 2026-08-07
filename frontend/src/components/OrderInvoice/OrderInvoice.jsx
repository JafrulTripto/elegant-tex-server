import React from 'react';
import { Page, View, Text, Image, Document, StyleSheet, Font } from '@react-pdf/renderer';
import dayjs from "dayjs";
import RobotoRegular from "../../assets/fonts/Roboto/Roboto-Regular.ttf";
import RobotoBold from "../../assets/fonts/Roboto/Roboto-Bold.ttf";
import RobotoLight from "../../assets/fonts/Roboto/Roboto-Light.ttf";
import ETLogo from "../../assets/images/elegant_tex_logo.jpg";
import { OrderTypeEnum } from "../../utils/enums/OrderTypeEnum";
import { OrderStatusEnum } from "../../utils/enums/OrderStatusEnum";
import InvoiceQR from "./InvoiceQR";
import { orderDeepLink } from "../../utils/orderQr";

Font.register({
  family: 'Roboto', fonts: [
    { src: RobotoRegular },
    { src: RobotoBold, fontWeight: 700 },
    { src: RobotoLight, fontStyle: 'italic' },
  ]
});

const money = (n) => 'Tk ' + Math.round(Number(n) || 0).toLocaleString('en-US');
const fmtDate = (d) => (d ? dayjs(d).format('DD MMMM YYYY') : '—');

const C = { text: '#1a1a1a', muted: '#6b6b6b', line: '#ececec', lineStrong: '#d8d8d8', headBg: '#f2f2f2' };

// Sizes are in points (react-pdf's default unit), tuned to A4 density.
const s = StyleSheet.create({
  page: { fontFamily: 'Roboto', color: C.text, fontSize: 9.5, lineHeight: 1.4, paddingVertical: 38, paddingHorizontal: 42 },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  brandRow: { flexDirection: 'row' },
  logo: { width: 54, height: 54, borderRadius: 7, marginRight: 11 },
  brandName: { fontSize: 12.5, fontWeight: 700, letterSpacing: 0.5 },
  brandMuted: { fontSize: 8.5, color: C.muted, marginTop: 2 },

  invoiceTitle: { fontSize: 20, fontWeight: 700, letterSpacing: 1, marginBottom: 7, textAlign: 'right' },
  metaRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 2 },
  metaLabel: { width: 88, textAlign: 'right', paddingRight: 14, fontSize: 9, color: C.muted, fontWeight: 700 },
  metaValue: { width: 108, textAlign: 'right', fontSize: 9 },

  rule: { height: 2, backgroundColor: C.text, marginTop: 16 },

  sectionHead: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: C.lineStrong },

  infoRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.line, paddingVertical: 5 },
  infoLabel: { width: 120, color: C.muted, fontWeight: 700 },
  infoValue: { flex: 1 },

  th: { paddingVertical: 6, paddingHorizontal: 7, fontSize: 8.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3 },
  td: { paddingVertical: 6, paddingHorizontal: 7, fontSize: 9 },

  payRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3.5 },

  imgCell: { height: 110, marginBottom: 8, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: C.line },
  footer: { textAlign: 'right', fontSize: 9, fontStyle: 'italic', color: '#8a8a8a', borderTopWidth: 1, borderTopColor: C.line, paddingTop: 10, marginTop: 14 },
});

const COL = { product: '18%', fabric: '18%', desc: '40%', qty: '10%', price: '14%' };

const SectionHead = ({ children, style }) => <Text style={[s.sectionHead, style]}>{children}</Text>;

const OrderInvoice = ({ order }) => {
  const statusLabel = OrderStatusEnum.find(x => x.value === order.status)?.label || '';
  const isMarketplace = order.orderType === OrderTypeEnum.MARKETPLACE;
  const products = order.products || [];
  const images = order.images || [];
  const addr = order.customer?.address;
  const fullAddress = addr
    ? [addr.address, addr.upazila?.name, addr.district?.name, addr.division?.name].filter(Boolean).join(', ')
    : '';

  const meta = [
    { label: 'Order no.', value: `#${order.id}`, bold: true },
    { label: 'Ordered By', value: order.orderable?.name || '—' },
    { label: 'Order Issued', value: fmtDate(order.createdAt) },
    { label: 'Status', value: statusLabel, bold: true },
  ];

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.headerRow}>
          <View style={s.brandRow}>
            <Image src={ETLogo} style={s.logo} />
            <View style={{ paddingTop: 2 }}>
              <Text style={s.brandName}>Elegant Tex</Text>
              <Text style={s.brandMuted}>House 52, Lane 2, Block C, Ave No. 5, Dhaka 1216</Text>
              <Text style={s.brandMuted}>+8801896224057 · bd.eleganttex@gmail.com</Text>
            </View>
          </View>
          <View style={{ alignItems: 'center', paddingTop: 2, marginHorizontal: 22 }}>
            <InvoiceQR value={orderDeepLink(order.id)} size={60} />
            <Text style={{ fontSize: 6.5, color: '#8a8a8a', marginTop: 3 }}>Scan to update status</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.invoiceTitle}>INVOICE</Text>
            {meta.map((m, i) => (
              <View key={i} style={s.metaRow}>
                <Text style={s.metaLabel}>{m.label}</Text>
                <Text style={[s.metaValue, m.bold && { fontWeight: 700 }]}>{m.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.rule} />

        {/* Customer / Merchant */}
        <View style={{ marginTop: 16 }}>
          {isMarketplace ? (
            <>
              <SectionHead>Customer Information</SectionHead>
              <View style={s.infoRow}>
                <Text style={s.infoLabel}>Customer Name</Text>
                <Text style={s.infoValue}>{order.customer?.name}</Text>
              </View>
              <View style={s.infoRow}>
                <Text style={s.infoLabel}>Phone</Text>
                <Text style={s.infoValue}>{[addr?.phone, order.customer?.altPhone].filter(Boolean).join(', ')}</Text>
              </View>
              <View style={[s.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={s.infoLabel}>Address</Text>
                <Text style={s.infoValue}>{fullAddress}</Text>
              </View>
            </>
          ) : (
            <>
              <SectionHead>Merchant Information</SectionHead>
              <View style={s.infoRow}>
                <Text style={s.infoLabel}>Merchant</Text>
                <Text style={s.infoValue}>{order.orderable?.name}</Text>
              </View>
              <View style={[s.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={s.infoLabel}>Reference No.</Text>
                <Text style={s.infoValue}>{order.merchantRef}</Text>
              </View>
            </>
          )}
        </View>

        {/* Products */}
        <View style={{ marginTop: 16 }}>
          <SectionHead>Product Information</SectionHead>
          <View style={{ flexDirection: 'row', backgroundColor: C.headBg, marginTop: 8 }}>
            <Text style={[s.th, { width: COL.product }]}>Product</Text>
            <Text style={[s.th, { width: COL.fabric }]}>Fabric</Text>
            <Text style={[s.th, { width: COL.desc }]}>Description</Text>
            <Text style={[s.th, { width: COL.qty, textAlign: 'center' }]}>Qty</Text>
            <Text style={[s.th, { width: COL.price, textAlign: 'right' }]}>Price</Text>
          </View>
          {products.map((p, i) => (
            <View key={p.id || i} wrap={false} style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.line }}>
              <Text style={[s.td, { width: COL.product }]}>{p.productType?.name}</Text>
              <Text style={[s.td, { width: COL.fabric }]}>{[p.fabrics?.name, p.fabricType?.name].filter(Boolean).join(' · ') || 'N/A'}</Text>
              <Text style={[s.td, { width: COL.desc }]}>{p.description}</Text>
              <Text style={[s.td, { width: COL.qty, textAlign: 'center' }]}>{p.unit} pc</Text>
              <Text style={[s.td, { width: COL.price, textAlign: 'right' }]}>{money(p.price)}</Text>
            </View>
          ))}
        </View>

        {/* Delivery + Payment — kept together on one page */}
        <View wrap={false} style={{ flexDirection: 'row', marginTop: 16 }}>
          <View style={{ flex: 1, marginRight: 36 }}>
            <SectionHead>Delivery Information</SectionHead>
            <View style={s.infoRow}>
              <Text style={[s.infoLabel, { width: 100 }]}>Delivery Date</Text>
              <Text style={s.infoValue}>{fmtDate(order.deliveryDate)}</Text>
            </View>
            <View style={[s.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={[s.infoLabel, { width: 100 }]}>Delivery Channel</Text>
              <Text style={s.infoValue}>{order.deliveryChannel?.name || '—'}</Text>
            </View>
          </View>
          <View style={{ width: 230 }}>
            <SectionHead>Payment Information</SectionHead>
            <View style={s.payRow}>
              <Text style={{ color: C.muted }}>Payment Subtotal</Text>
              <Text>{money(order.payment?.amount)}</Text>
            </View>
            <View style={s.payRow}>
              <Text style={{ color: C.muted }}>Delivery Charge</Text>
              <Text>{money(order.payment?.deliveryCharge)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 6, marginTop: 2, borderTopWidth: 1.5, borderTopColor: C.text }}>
              <Text style={{ fontWeight: 700 }}>Total Amount</Text>
              <Text style={{ fontWeight: 700, fontSize: 12 }}>{money(order.payment?.totalAmount)}</Text>
            </View>
          </View>
        </View>

        {/* Order images — wrap into rows and flow across pages for large counts */}
        {images.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <SectionHead style={{ marginBottom: 8 }}>Order Images</SectionHead>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {images.map((img, i) => (
                <View key={img.id || i} wrap={false} style={[s.imgCell, { width: '31.5%', marginRight: (i % 3 === 2) ? 0 : '2.75%' }]}>
                  <Image src={`${process.env.REACT_APP_API_BASE_URL}/files/upload/${img.id}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </View>
              ))}
            </View>
          </View>
        )}

        <Text style={s.footer}>Thank you for your order.</Text>
      </Page>
    </Document>
  );
};

export default OrderInvoice;
