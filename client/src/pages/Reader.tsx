import { Scanner, IDetectedBarcode } from '@yudiel/react-qr-scanner';
import { ReactElement, useCallback, useEffect, useState } from 'react';
import '../styles/reader.css';
import { BACKEND_ENDPOINT, FARE_ADULT, FARE_CHILDREN, NOT_GET_ON_ID } from '../const';
import Ticket from '../types/Ticket';
import User from '../types/User';
import { useSearchParams } from 'react-router-dom';
import { QRFormat } from '../components/QRCode';
import { apiCancel, apiCharge, apiCreateChargeHistory, apiCreateHistory, apiGetOn, apiPay } from '../api';
import { Admin } from '../types/Admin';

type ReaderStatus =
  | 'getOn'
  | 'getOff'
  | 'standby'
  | 'standby-getOn'
  | 'standby-getOff'
  | 'isReading'
  | 'error'
  | 'no_balance'
  | 'no_id'
  | 'cancel'
  | 'already_on';
type ReaderMode = 'get-on' | 'get-off' | 'get-on-off';

const ReaderPage = () => {
  const [scanResult, setScanResult] = useState({ format: '', rawValue: '' });
  const [paid, setPaid] = useState<number | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [lastUUID, setLastUUID] = useState<string | null>(null);
  const [headerText, setHeaderText] = useState<string>('兼用');
  const [headerCss, setHeaderCss] = useState<string>('text-blue-400');
  const [currentStatus, setCurrentStatus] = useState<ReaderStatus>('standby');
  const [currentMode, setCurrentMode] = useState<ReaderMode>('get-on-off');
  const [readHistory, setReadHistory] = useState<string[]>([]);

  const [id6, setId6] = useState<number>(10000);

  const [params] = useSearchParams();

  useEffect(() => {
    async function fetchAdmin() {
      const res = await fetch(`${BACKEND_ENDPOINT}/api/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = (await res.json()) as Admin;
        setId6(data.id6);
        console.log('管理システム接続: ', data.id6);
      } else {
        console.log('管理システム接続失敗');
      }
    }

    fetchAdmin();
  }, []);

  const tableTopPaid = useCallback(
    () => (
      <tr className="">
        <td className="reader-left">
          <p className="reader-text reader-text-left">{'精算額'}</p>
        </td>
        <td className="reader-right">
          <p className="reader-text reader-text-right">
            {paid}
            <span className="text-2xl">{'円'}</span>
          </p>
        </td>
      </tr>
    ),
    [paid]
  );

  const tableTopNumber = useCallback(
    () => (
      <tr className="h-[100px]">
        <td className="reader-left border-r-[1px] border-gray-500">
          <p className="reader-text reader-text-left">{'整理券No.'}</p>
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
      <tr className="bg-blue-400 h-[100px]">
        <td className="reader-left border-r-[1px] border-gray-500">
          <p className="reader-text reader-text-left">{'残額'}</p>
        </td>
        <td className="reader-right">
          <p className="reader-text reader-text-right">
            {balance}
            <span className="text-2xl">{'円'}</span>
          </p>
        </td>
      </tr>
    ),
    [balance]
  );

  // const tableBottomLimit = useCallback(
  //   () => (
  //     <tr>
  //       <td className="reader-left border-r-[1px] border-gray-500">
  //         <p className="reader-text reader-text-left">{'有効期限'}</p>
  //       </td>
  //       <td className="reader-right">
  //         <p className="reader-text reader-text-right">
  //           {'2025'}
  //           <span className="text-2xl">{'年'}</span>11<span className="text-2xl">{'月'}</span>4<span className="text-2xl">{'日'}</span>
  //         </p>
  //       </td>
  //     </tr>
  //   ),
  //   []
  // );

  const tableBottomWelcome = useCallback(
    () => (
      <tr className="bg-gray-600 h-[100px]">
        <td className="reader-left" colSpan={2}>
          <p className="reader-text text-center text-2xl text-green-500">{'QRコードをかざしてください。'}</p>
        </td>
      </tr>
    ),
    []
  );

  const tableBottomWait = useCallback(
    () => (
      <tr className="bg-green-400 h-[100px]">
        <td className="reader-left" colSpan={2}>
          <p className="reader-text text-center text-2xl text-gray-800">{'しばらくお待ち下さい。'}</p>
        </td>
      </tr>
    ),
    []
  );

  const tableBottomPleaseCharge = useCallback(
    () => (
      <tr className="bg-green-400 h-[100px]">
        <td className="reader-left" colSpan={2}>
          <p className="reader-text text-center text-2xl text-gray-800">{'チャージしてください。'}</p>
        </td>
      </tr>
    ),
    []
  );

  const tableBottomAutoCharge = useCallback(
    () => (
      <tr className="bg-green-400 h-[100px]">
        <td className="reader-left" colSpan={2}>
          <p className="reader-text text-center text-2xl text-gray-800">{'オートチャージします。'}</p>
        </td>
      </tr>
    ),
    []
  );

  const tableBottomCancel = useCallback(
    () => (
      <tr className="bg-green-400 h-[100px]">
        <td className="reader-left" colSpan={2}>
          <p className="reader-text text-center text-2xl text-gray-800">{'乗車情報を取り消しました。'}</p>
        </td>
      </tr>
    ),
    []
  );

  const tableNullRow = useCallback(
    () => (
      <tr className="h-[100px]">
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

  const tableNoBalance = useCallback(
    () => (
      <tr className="bg-red-800 h-[100px]">
        <td className="reader-left" colSpan={2}>
          <p className="reader-text text-center text-2xl text-gray-800">{'残高不足です。'}</p>
        </td>
      </tr>
    ),
    []
  );

  const tableAlreadyGotOn = useCallback(
    () => (
      <tr className="bg-red-800 h-[100px]">
        <td className="reader-left" colSpan={2}>
          <p className="reader-text text-center text-2xl text-gray-800">{'乗車処理済みです。'}</p>
        </td>
      </tr>
    ),
    []
  );

  const tableIdNotSet = useCallback(
    () => (
      <tr className="bg-red-800 h-[100px]">
        <td className="reader-left" colSpan={2}>
          <p className="reader-text text-center text-2xl text-gray-800">{'整理券No.が未指定です。'}</p>
        </td>
      </tr>
    ),
    []
  );

  const tableError = useCallback(
    () => (
      <tr className="bg-red-800 h-[100px]">
        <td className="reader-left" colSpan={2}>
          <p className="reader-text text-center text-2xl text-gray-800">{'エラーが発生しました。'}</p>
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
        break;
      case 'getOff':
        setHeaderText('SF利用');
        setHeaderCss('bg-blue-400 text-white');
        setTableTop(tableTopPaid);
        setTableMiddle(tableMiddleBalance);
        setTableBottom(tableNullRow);
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
        setTableMiddle(tableNullRow);
        setTableBottom(tableError);
        break;
      case 'cancel':
        setTableMiddle(tableNullRow);
        setTableBottom(tableBottomCancel);
        break;
      case 'no_balance':
        setTableMiddle(tableNullRow);
        setTableBottom(tableNoBalance);
        break;
      case 'no_id':
        setTableMiddle(tableNullRow);
        setTableBottom(tableIdNotSet);
        break;
      case 'already_on':
        setTableMiddle(tableNullRow);
        setTableBottom(tableAlreadyGotOn);
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
    // tableBottomLimit,
    tableBottomWait,
    tableBottomWelcome,
    tableMiddleBalance,
    tableTopNumber,
    tableTopPaid,
    tableBottomCancel,
    tableNullRow,
    tableNoBalance,
    tableIdNotSet,
    tableAlreadyGotOn,
    tableError
  ]);

  const handleScan = async () => {
    const current_stop_id = Number.parseInt(params.get('stop_id') ?? '0');
    const type_id = Number.parseInt(params.get('type_id') ?? '0');
    const company_id = Number.parseInt(params.get('company_id') ?? '0');

    console.log('現在: ', current_stop_id);

    if (current_stop_id === -2) {
      setCurrentStatus('no_id');
      return;
    }

    const payloadConfig = {
      id6: id6
    };

    const resConfig = await fetch(`${BACKEND_ENDPOINT}/getAdmin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payloadConfig)
    });

    if (resConfig.ok) {
      const configData = (await resConfig.json()) as Admin;
      console.log('大人人数: ', configData.adult_num);
      console.log('子供人数: ', configData.children_num);
      console.log('乗車キャンセル: ', configData.is_cancel);
      console.log('乗車開始電停ID: ', configData.start_id);
      console.log('乗車終了電停ID: ', configData.end_id);
      console.log('運賃直接入力: ', configData.fare_direct);
      console.log('管理システム接続 設定更新');

      const result = scanResult.rawValue;
      try {
        const qr_data = JSON.parse(result) as QRFormat;

        const payload = {
          uuid: qr_data.data
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

            const user = (await res2.json()) as User;
            if (res2.ok) {
              if (user.last_get_on_id === current_stop_id) {
                setCurrentStatus('already_on');
                return;
              }

              console.log("乗車電停: ", user.last_get_on_id);
              if (user.last_get_on_id === NOT_GET_ON_ID) {
                console.log('乗車処理 開始');

                const getOnResult = await apiGetOn(user, current_stop_id);
                if (getOnResult) {
                  setBalance(user.balance);
                  setCurrentStatus('getOn');

                  if (user.balance < 1000) {
                    if (user.enable_auto_charge) {
                      if (user.balance < user.auto_charge_balance) {
                        setTableBottom(tableBottomAutoCharge);
                        apiCharge(user, 1000, false, current_stop_id, null);
                        apiCreateChargeHistory(user, 1000, user.balance + 1000, 2);
                      }
                    } else {
                      setTableBottom(tableBottomPleaseCharge);
                    }
                  } else {
                    setTableBottom(tableNullRow);
                  }
                } else {
                  setCurrentStatus('error');
                }
              } else {
                console.log('降車処理 開始');

                if (configData.is_cancel) {
                  apiCancel(user);
                  setCurrentStatus('cancel');
                } else {
                  let adult_num = 1;
                  let children_num = 0;
                  if (configData.adult_num) {
                    adult_num = configData.adult_num;
                  }
                  if (configData.children_num) {
                    children_num = configData.children_num;
                  }

                  let fare = FARE_ADULT * adult_num + FARE_CHILDREN * children_num;
                  if (configData.fare_direct) {
                    fare = configData.fare_direct;
                  }

                  const zan = user.balance - fare;
                  if (zan < 0) {
                    setCurrentStatus('no_balance');
                  } else {
                    setBalance(zan);
                    setPaid(fare);

                    const fare_result = await apiPay(user, zan);
                    if (fare_result) {
                      setCurrentStatus('getOff');

                      let start = null;
                      let end = current_stop_id;
                      if (configData.start_id) {
                        start = configData.start_id;
                      }
                      if (configData.end_id) {
                        end = configData.end_id;
                      }

                      apiCreateHistory(user, start, end, fare, zan, type_id, company_id);
                    } else {
                      setCurrentStatus('error');
                    }
                  }
                }
              }
            }
          }
        }
      } catch {
        setCurrentStatus('error');
      }
    } else {
      console.log('管理システム接続失敗');
    }

    const payload = {
      id6: id6,
      adult_num: null,
      children_num: null,
      is_cancel: null,
      start_id: null,
      end_id: null,
      fare_direct: null
    };

    const res = await fetch(`${BACKEND_ENDPOINT}/updateAdmin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      console.log('送信しました');
    } else {
      console.log('送信失敗');
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
    <div className="bg-black flex flex-row overflow-y-hidden">
      <div className="m-auto h-screen w-screen max-w-[400px] flex flex-col">
        <p className={headerCss + ' pl-1 font-bold shrink'}>{headerText}</p>
        <div className="bg-gray-700 grow min-h-[400px]">
          <table className="text-white w-full h-full">
            <tbody className="max-h-[400px]">
              {tableTop}
              {tableMiddle}
              {tableBottom}
              <tr className="h-[100px]">
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
        <div className="bg-white flex items-center justify-center">
          <img src="/logo.png" alt="LOGO" className="w-[30%] m-[20px]" />
        </div>
        <div className="bg-gray-900">
          <Scanner
            onScan={(detectedCodes: IDetectedBarcode[]) => {
              if (detectedCodes.length > 0) {
                setScanResult({
                  format: detectedCodes[0].format,
                  rawValue: detectedCodes[0].rawValue
                });

                switch (scanResult.rawValue) {
                  case lastUUID:
                    console.log('UUIDが最後に読み取ったものと同一です。処理を中断します。');
                    return;
                  case null:
                    console.log('UUIDがnullです。処理を中断します。');
                    return;
                  case undefined:
                    console.log('UUIDがundefinedです。処理を中断します。');
                    return;
                  case '':
                    console.log('UUIDが空です。処理を中断します。');
                    return;
                  default:
                    break;
                }

                if (readHistory.includes(scanResult.rawValue)) {
                  console.log('UUIDが有効と判断されましたが、履歴に含まれていました。処理を中断します。');
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
                  console.log('最終UUID履歴を削除');
                  setLastUUID(null);
                }, 3000);

                setCurrentStatus('isReading');
                handleScan();
              }
            }}
            formats={['qr_code', 'micro_qr_code']}
            allowMultiple
            scanDelay={2000}
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

      <div className="fixed bottom-0 right-0">
        <p className="text-white text-right">{id6}</p>
        {/* <p
          className="text-black cursor-pointer bg-white text-center hover:bg-blue-300"
          onClick={() => {
            fetchAdmin();
          }}>
          {'更新'}
        </p> */}
      </div>
    </div>
  );
};

export default ReaderPage;
