import { Scanner, IDetectedBarcode } from '@yudiel/react-qr-scanner';
import { ReactElement, useEffect, useState } from 'react';
import '../styles/reader.css';
import { BACKEND_ENDPOINT } from '../const';
import Ticket from '../types/Ticket';
import User from '../types/User';

type ReaderStatus = {
  status: 'getOn' | 'getOff' | 'standby' | 'standby-getOn' | 'standby-getOff';
  mode: 'getOn' | 'getOff' | 'getOnOff';
  is_reading: false;
};

const ReaderPage = () => {
  const [scanResult, setScanResult] = useState({ format: '', rawValue: '' });
  const [paid, setPaid] = useState<number | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [lastUUID, setLastUUID] = useState<string | null>(null);
  const [headerText, setHeaderText] = useState<string>('兼用');
  const [headerCss, setHeaderCss] = useState<string>('text-blue-400');

  const tableTopPaid = (
    <tr className="">
      <td className="reader-left">
        <p className="reader-text reader-text-left">精算額</p>
      </td>
      <td className="reader-right">
        <p className="reader-text reader-text-right">
          {paid}
          <span className="text-2xl">円</span>
        </p>
      </td>
    </tr>
  );

  const tableTopNumber = (
    <tr className="">
      <td className="reader-left">
        <p className="reader-text reader-text-left">整理券No.</p>
      </td>
      <td className="reader-right">
        <p className="reader-text reader-text-right">{0}</p>
      </td>
    </tr>
  );

  const tableMiddleBalance = (
    <tr className="bg-blue-400">
      <td className="reader-left">
        <p className="reader-text reader-text-left">残額</p>
      </td>
      <td className="reader-right">
        <p className="reader-text reader-text-right">
          {balance}
          <span className="text-2xl">円</span>
        </p>
      </td>
    </tr>
  );

  const tableBottomLimit = (
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
  );

  const tableBottomWelcome = (
    <tr>
      {/* <td className="reader-left">
        <p className="reader-text reader-text-left">有効期限</p>
      </td>
      <td className="reader-right">
        <p className="reader-text reader-text-right">
          2025<span className="text-2xl">年</span>11<span className="text-2xl">月</span>4<span className="text-2xl">日</span>
        </p>
      </td> */}
    </tr>
  );

  const tableNullRow = (
    <tr>
      <td className="reader-left">
        <p className="reader-text reader-text-left">{'　'}</p>
      </td>
      <td className="reader-right">
        <p className="reader-text reader-text-right">{'　'}</p>
      </td>
    </tr>
  );

  const [tableTop, setTableTop] = useState<ReactElement>(tableTopNumber);
  const [tableMiddle, setTableMiddle] = useState<ReactElement>(tableMiddleBalance);
  const [tableBottom, setTableBottom] = useState<ReactElement>(tableBottomLimit);

  const currentStatus: ReaderStatus = {
    status: 'standby',
    mode: 'getOnOff',
    is_reading: false
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLastUUID(null);
    }, 2000);

    return () => clearTimeout(timer);
  }, [lastUUID]);

  const handleScan = async (results: IDetectedBarcode[]) => {
    if (results.length > 0) {
      setScanResult({
        format: results[0].format,
        rawValue: results[0].rawValue
      });

      if (lastUUID == scanResult.rawValue) return;

      setLastUUID(scanResult.rawValue);
      const payload = {
        uuid: scanResult.rawValue
      };

      console.log(scanResult.rawValue);

      const res = await fetch(`${BACKEND_ENDPOINT}/useTicket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = (await res.json()) as Ticket;
      if (res.ok) {
        console.log('hi!');
        const payload2 = {
          id: data.user_id
        };
        const res2 = await fetch(`${BACKEND_ENDPOINT}/api/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload2)
        });

        const data2 = (await res2.json()) as User;
        if (res2.ok) {
          setBalance(data2.balance);

          currentStatus.status = 'getOn';
          updateDisplay();
        }
      }
    }
  };

  const customTracker = (detectedCodes: IDetectedBarcode[], ctx: CanvasRenderingContext2D) => {
    detectedCodes.forEach((code) => {
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 3;
      ctx.strokeRect(code.boundingBox.x, code.boundingBox.y, code.boundingBox.width, code.boundingBox.height);
    });
  };

  const updateDisplay = () => {
    switch (currentStatus.status) {
      case 'getOn':
        setHeaderText('乗車');
        setHeaderCss('bg-blue-400 text-white');
        setTableTop(tableTopNumber);
        setTableMiddle(tableMiddleBalance);
        setTableBottom(tableNullRow);
        break;
      case 'getOff':
        setHeaderText('降車');
        setHeaderCss('bg-blue-400 text-white');
        setTableTop(tableTopPaid);
        setTableMiddle(tableMiddleBalance);
        setTableBottom(tableBottomLimit);
        break;
      case 'standby':
        setHeaderText('兼用');
        setHeaderCss('text-blue-400');
        setTableTop(tableTopNumber);
        setTableMiddle(tableNullRow);
        setTableBottom(tableBottomWelcome);
        break;
      case 'standby-getOn':
        setHeaderText('乗車専用');
        setHeaderCss('text-blue-400');
        setTableTop(tableTopNumber);
        setTableMiddle(tableNullRow);
        setTableBottom(tableBottomWelcome);
        break;
      case 'standby-getOff':
        setHeaderText('降車専用');
        setHeaderCss('text-blue-400');
        setTableTop(tableTopNumber);
        setTableMiddle(tableNullRow);
        setTableBottom(tableBottomWelcome);
        break;
      default:
        setHeaderText('ヘッダー取得エラー');
        setHeaderCss('bg-blue-400 text-white');
        setTableTop(tableNullRow);
        setTableMiddle(tableNullRow);
        setTableBottom(tableNullRow);
        break;
    }
  };

  return (
    <div className="bg-black">
      <div className="m-auto h-screen w-screen max-w-[400px] flex flex-col">
        <p className={headerCss + ' pl-1 font-bold shrink'}>{headerText}</p>
        <div className="bg-gray-500 grow">
          <table className="text-white w-full h-full">
            <tbody className="">
              {tableTop}
              {tableMiddle}
              {tableBottom}
            </tbody>
          </table>
        </div>
        <div className="h-[8%] bg-white"></div>
        <div className="bg-gray-900 shrink">
          <Scanner
            onScan={handleScan}
            formats={['qr_code', 'micro_qr_code']}
            allowMultiple
            // paused={isReaderPaused}
            components={{
              tracker: customTracker,
              audio: false,
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
