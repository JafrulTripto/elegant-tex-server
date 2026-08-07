import React from 'react';
import { Svg, Rect } from '@react-pdf/renderer';
import QRCode from 'qrcode';

/**
 * Renders a QR code as vector rects inside a react-pdf <Svg> — fully synchronous
 * (no async data URL), so it drops straight into a PDF document. Used to stamp the
 * Order QR (ADR 0005) on the invoice and the scan label.
 */
const InvoiceQR = ({ value, size = 64, quiet = 2 }) => {
  let modules;
  try {
    modules = QRCode.create(value, { errorCorrectionLevel: 'M' }).modules;
  } catch (e) {
    return null;
  }
  const count = modules.size;
  const total = count + quiet * 2; // quiet zone (margin) in module units
  const cell = size / total;
  const rects = [];
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (modules.data[r * count + c]) {
        rects.push(
          <Rect key={`${r}-${c}`} x={(c + quiet) * cell} y={(r + quiet) * cell} width={cell} height={cell} fill="#000" />
        );
      }
    }
  }
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Rect x={0} y={0} width={size} height={size} fill="#fff" />
      {rects}
    </Svg>
  );
};

export default InvoiceQR;
