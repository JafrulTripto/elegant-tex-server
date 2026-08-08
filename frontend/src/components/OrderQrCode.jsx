import React from 'react';
import QRCode from 'qrcode';

/**
 * Renders a QR code as inline SVG for the DOM (the DOM counterpart to
 * OrderInvoice/InvoiceQR, which targets react-pdf). Fully synchronous — no async
 * data URL. Always drawn dark-on-white so it scans regardless of the app theme.
 */
const OrderQrCode = ({ value, size = 128, quiet = 2 }) => {
  let modules;
  try {
    modules = QRCode.create(value, { errorCorrectionLevel: 'M' }).modules;
  } catch (e) {
    return null;
  }
  const count = modules.size;
  const total = count + quiet * 2; // quiet zone in module units
  const rects = [];
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (modules.data[r * count + c]) {
        rects.push(<rect key={`${r}-${c}`} x={c + quiet} y={r + quiet} width={1} height={1} fill="#0f172a" />);
      }
    }
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${total} ${total}`}
      shapeRendering="crispEdges"
      style={{ background: '#fff', borderRadius: 8, display: 'block' }}>
      {rects}
    </svg>
  );
};

export default OrderQrCode;
