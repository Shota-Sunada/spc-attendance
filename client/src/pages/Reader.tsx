import { Scanner, IDetectedBarcode } from '@yudiel/react-qr-scanner';
import { useState } from 'react';

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
    <>
      <div className="m-auto h-screen w-screen max-w-[400px] flex flex-col">
        <p className="bg-blue-400 text-white font-bold shrink">乗降兼用</p>
        <div className="bg-gray-500 grow">
          <table className="text-white w-full h-full">
            <tbody className="">
              <tr className="">
                <td className="p-1 text-start">精算額</td>
                <td className='p-1 text-end after:content-["円"]'>1,000</td>
              </tr>
              <tr>
                <td className="p-1 text-start ">残高</td>
                <td className='p-1 text-end after:content-["円"]'></td>
              </tr>
              <tr>
                <td className="p-1 text-start">
                  定期券
                  <br />
                  有効期限
                </td>
                <td className="p-1 text-end">2025年11月4日</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="bg-black border-2 shrink">
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
    </>
  );
};

export default ReaderPage;
