'use client';

import { QRCodeCanvas } from 'qrcode.react';

interface QRCodeProps {
  data: string;
}

export interface QRFormat {
  version: number;
  data: string;
}

export const QRCode = (props: QRCodeProps) => {
  return (
    <QRCodeCanvas
      value={props.data}
      size={256}
      bgColor={'#FFFFFF'}
      fgColor={'#000000'}
      level={'L'}
      imageSettings={{
        src: '/qr.png',
        x: undefined,
        y: undefined,
        height: 24,
        width: 24,
        excavate: true
      }}
    />
  );
};
