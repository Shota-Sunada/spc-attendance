import { Scanner, IDetectedBarcode } from '@yudiel/react-qr-scanner';
import { ReactElement, useCallback, useEffect, useState } from 'react';
import '../styles/reader.css';
import { BACKEND_ENDPOINT } from '../const';
import Ticket from '../types/Ticket';
import User from '../types/User';
import { useSearchParams } from 'react-router-dom';

type ReaderStatus = 'getOn' | 'getOff' | 'standby' | 'standby-getOn' | 'standby-getOff' | 'isReading' | 'error';
type ReaderMode = 'get-on' | 'get-off' | 'get-on-off';

const ReaderPage = () => {
  const [scanResult, setScanResult] = useState({ format: '', rawValue: '' });
  // const [paid, setPaid] = useState<number | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [lastUUID, setLastUUID] = useState<string | null>(null);
  const [headerText, setHeaderText] = useState<string>('兼用');
  const [headerCss, setHeaderCss] = useState<string>('text-blue-400');
  const [currentStatus, setCurrentStatus] = useState<ReaderStatus>('standby');
  const [currentMode, setCurrentMode] = useState<ReaderMode>('get-on-off');
  const [readHistory, setReadHistory] = useState<string[]>([]);

  const [params] = useSearchParams();

  const tableTopPaid = useCallback(
    () => (
      <tr className="">
        <td className="reader-left">
          <p className="reader-text reader-text-left">精算額</p>
        </td>
        <td className="reader-right">
          <p className="reader-text reader-text-right">
            {/* {paid} */}
            <span className="text-2xl">円</span>
          </p>
        </td>
      </tr>
    ),
    []
  );

  const tableTopNumber = useCallback(
    () => (
      <tr className="">
        <td className="reader-left border-r-[1px] border-gray-500">
          <p className="reader-text reader-text-left">整理券No.</p>
        </td>
        <td className="reader-right">
          <p className="reader-text reader-text-right">{params.get('stop_id') ?? '未指定'}</p>
        </td>
      </tr>
    ),
    [params]
  );

  const tableMiddleBalance = useCallback(
    () => (
      <tr className="bg-blue-400">
        <td className="reader-left border-r-[1px] border-gray-500">
          <p className="reader-text reader-text-left">残額</p>
        </td>
        <td className="reader-right">
          <p className="reader-text reader-text-right">
            {balance}
            <span className="text-2xl">円</span>
          </p>
        </td>
      </tr>
    ),
    [balance]
  );

  const tableBottomLimit = useCallback(
    () => (
      <tr>
        <td className="reader-left border-r-[1px] border-gray-500">
          <p className="reader-text reader-text-left">有効期限</p>
        </td>
        <td className="reader-right">
          <p className="reader-text reader-text-right">
            2025<span className="text-2xl">年</span>11<span className="text-2xl">月</span>4<span className="text-2xl">日</span>
          </p>
        </td>
      </tr>
    ),
    []
  );

  const tableBottomWelcome = useCallback(
    () => (
      <tr className="bg-gray-600">
        <td className="reader-left" colSpan={2}>
          <p className="reader-text text-center text-2xl text-green-500">QRコードをかざしてください。</p>
        </td>
      </tr>
    ),
    []
  );

  const tableBottomWait = useCallback(
    () => (
      <tr className="bg-green-400">
        <td className="reader-left" colSpan={2}>
          <p className="reader-text text-center text-2xl text-gray-800">しばらくお待ち下さい。</p>
        </td>
      </tr>
    ),
    []
  );

  const tableNullRow = useCallback(
    () => (
      <tr className="">
        <td className="reader-left border-r-[1px] border-gray-500">
          <p className="reader-text reader-text-left">{'　'}</p>
        </td>
        <td className="reader-right">
          <p className="reader-text reader-text-right">{'　'}</p>
        </td>
      </tr>
    ),
    []
  );

  const tableError = useCallback(
    () => (
      <tr className="bg-red-800">
        <td className="reader-left" colSpan={2}>
          <p className="reader-text text-center text-2xl text-gray-800">エラーが発生しました。</p>
        </td>
      </tr>
    ),
    []
  );

  const [tableTop, setTableTop] = useState<ReactElement>(tableTopNumber);
  const [tableMiddle, setTableMiddle] = useState<ReactElement>(tableNullRow);
  const [tableBottom, setTableBottom] = useState<ReactElement>(tableBottomWelcome);

  const updateDisplay = useCallback(() => {
    switch (currentStatus) {
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
      case 'isReading':
        setTableBottom(tableBottomWait);
        break;
      case 'error':
        setTableMiddle(tableError);
        setTableBottom(tableNullRow);
        break;
      default:
        setHeaderText('ヘッダー取得エラー');
        setHeaderCss('bg-blue-400 text-white');
        setTableTop(tableNullRow);
        setTableMiddle(tableNullRow);
        setTableBottom(tableNullRow);
        break;
    }
  }, [
    currentStatus,
    tableBottomLimit,
    tableBottomWait,
    tableBottomWelcome,
    tableMiddleBalance,
    tableTopNumber,
    tableTopPaid,
    tableNullRow,
    tableError
  ]);

  const handleScan = async () => {
    console.log('handle scan');

    const payload = {
      uuid: scanResult.rawValue
    };

    const res = await fetch(`${BACKEND_ENDPOINT}/useTicket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = (await res.json()) as Ticket;
    if (res.ok) {
      if (data == null) {
        setCurrentStatus('error');
      } else {
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

          setCurrentStatus('getOn');
        }
      }
    }

    setTimeout(() => {
      switch (currentMode) {
        default:
        case 'get-on-off':
          setCurrentStatus('standby');
          break;
        case 'get-on':
          setCurrentStatus('standby-getOn');
          break;
        case 'get-off':
          setCurrentStatus('standby-getOff');
          break;
      }
    }, 5000);
  };

  useEffect(() => {
    switch (currentMode) {
      default:
      case 'get-on-off':
        setCurrentStatus('standby');
        break;
      case 'get-on':
        setCurrentStatus('standby-getOn');
        break;
      case 'get-off':
        setCurrentStatus('standby-getOff');
        break;
    }
  }, [currentMode]);

  useEffect(() => {
    updateDisplay();
  }, [currentStatus, currentMode, updateDisplay]);

  useEffect(() => {
    const mode = params.get('mode') as ReaderMode;
    setCurrentMode(mode);
  }, [params]);

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
        <p className={headerCss + ' pl-1 font-bold shrink'}>{headerText}</p>
        <div className="bg-gray-700 grow">
          <table className="text-white w-full h-full">
            <tbody className="">
              {tableTop}
              {tableMiddle}
              {tableBottom}
              <tr className="">
                <td className="reader-left border-r-[1px] border-gray-500">
                  <p className="reader-text text-[5px]">{'　'}</p>
                </td>
                <td className="reader-right">
                  <p className="reader-text text-[5px]">{'　'}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="h-[8%] bg-white"></div>
        <div className="bg-gray-900 shrink">
          <Scanner
            onScan={(detectedCodes: IDetectedBarcode[]) => {
              if (detectedCodes.length > 0) {
                setScanResult({
                  format: detectedCodes[0].format,
                  rawValue: detectedCodes[0].rawValue
                });

                switch (scanResult.rawValue) {
                  case lastUUID:
                    console.log('The UUID is duplicated with the last one. Skip.');
                    return;
                  case null:
                    console.log('The UUID is null. Skip.');
                    return;
                  case undefined:
                    console.log('The UUID is undefined. Skip.');
                    return;
                  case '':
                    console.log('The UUID is empty. Skip.');
                    return;
                  default:
                    break;
                }

                if (readHistory.includes(scanResult.rawValue)) {
                  console.log('The UUID was not judged for valid, but its was contained in history. Skip.');
                  setCurrentStatus('error');

                  setTimeout(() => {
                    switch (currentMode) {
                      default:
                      case 'get-on-off':
                        setCurrentStatus('standby');
                        break;
                      case 'get-on':
                        setCurrentStatus('standby-getOn');
                        break;
                      case 'get-off':
                        setCurrentStatus('standby-getOff');
                        break;
                    }
                  }, 5000);
                  return;
                } else {
                  setReadHistory([...readHistory, scanResult.rawValue]);
                }

                setLastUUID(scanResult.rawValue);
                setTimeout(() => {
                  console.log('reset last uuid');
                  setLastUUID(null);
                }, 3000);

                setCurrentStatus('isReading');
                handleScan();
              }
            }}
            formats={['qr_code', 'micro_qr_code']}
            allowMultiple
            scanDelay={5000}
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
