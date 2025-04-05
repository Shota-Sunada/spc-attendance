import { Scanner, IDetectedBarcode } from '@yudiel/react-qr-scanner';
import { useState } from 'react';
import '../styles/reader.css';

const ReaderPage = () => {
  const [scanResult, setScanResult] = useState({ format: '', rawValue: '' });

  const handleScan = (results: IDetectedBarcode[]) => {
    if (results.length > 0) {
      setScanResult({
        format: results[0].format,
        rawValue: results[0].rawValue
      });
    }
  };

  const customTracker = (detectedCodes: IDetectedBarcode[], ctx: CanvasRenderingContext2D) => {
    detectedCodes.forEach((code) => {
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 3;
      ctx.strokeRect(code.boundingBox.x, code.boundingBox.y, code.boundingBox.width, code.boundingBox.height);
    });
  };

  return (
    <div className="bg-black">
      <div className="m-auto h-screen w-screen max-w-[400px] flex flex-col">
        <p className="text-blue-400 font-bold shrink">乗降兼用</p>
        <div className="bg-gray-500 grow">
          <table className="text-white w-full h-full">
            <tbody className="">
              <tr className="">
                <td className="reader-left">
                  <p className="reader-text reader-text-left">精算額</p>
                </td>
                <td className="reader-right">
                  <p className="reader-text reader-text-right">
                    1000<span className="text-2xl">円</span>
                  </p>
                </td>
              </tr>
              <tr className="bg-blue-400">
                <td className="reader-left">
                  <p className="reader-text reader-text-left">残高</p>
                </td>
                <td className="reader-right">
                  <p className="reader-text reader-text-right">
                    <span className="text-2xl">円</span>
                  </p>
                </td>
              </tr>
              <tr>
                <td className="reader-left">
                  <p className="reader-text reader-text-left">有効期限</p>
                </td>
                <td className="reader-right">
                  <p className="reader-text reader-text-right">
                    2025<span className="text-2xl">年</span>11<span className="text-2xl">月</span>4<span className="text-2xl">日</span>
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="h-[8%] bg-white"></div>
        <div className="bg-gray-900 shrink">
          <Scanner
            onScan={handleScan}
            formats={['qr_code', 'micro_qr_code']}
            allowMultiple
            components={{
              tracker: customTracker,
              audio: true,
              onOff: false,
              zoom: false,
              finder: false,
              torch: false
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ReaderPage;
