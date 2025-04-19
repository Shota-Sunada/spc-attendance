import { ReactElement, useCallback, useEffect, useState } from 'react';
import QRCode from '../components/QRCode';
import User from '../types/User';
import { BACKEND_ENDPOINT } from '../const';
import Ticket from '../types/Ticket';
import { IoQrCode } from 'react-icons/io5';
import { TfiReload } from 'react-icons/tfi';
import UserHeader from '../components/UserHeader';
import CommuterTicketCard from '../components/CommuterTicketCard';

type UserPageProps = {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

const QR_MAX_TIMEOUT_SEC = 300;

const UserPage = (props: UserPageProps) => {
  const [qr, setQR] = useState<ReactElement | null>(null);
  const [count, setCount] = useState<number>(QR_MAX_TIMEOUT_SEC);
  const [isOpened, setIsOpened] = useState<boolean>(false);

  const onClick = () => {
    setIsOpened(true);
    createTicket();
  };

  const createTicket = useCallback(async () => {
    const payload = {
      user_id: props.user.id
    };

    const token = localStorage.getItem('token');

    const res = await fetch(`${BACKEND_ENDPOINT}/api/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = (await res.json()) as Ticket;
    if (res.ok) {
      GenerateQRCode(data.uuid);
    }
  }, [props.user.id]);

  function GenerateQRCode(data: string) {
    setCount(QR_MAX_TIMEOUT_SEC);

    setQR(
      <>
        <QRCode data={data} />
      </>
    );
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (count <= 0) {
        if (qr) {
          createTicket();
        }
      } else {
        setCount(count - 1);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [qr, count, createTicket]);

  const sec = count % 60;
  const min = (count - sec) / 60;

  return (
    <div className="h-[100%] bg-[#f7f4e5]">
      <UserHeader setUser={props.setUser} />
      {/* QRコード */}
      <div className="fixed bottom-[1vh] left-[50%] transform-[translateX(-50%)] bg-white p-[25px] rounded-2xl z-100">
        <div className="flex flex-col items-center justify-center">
          {isOpened ? (
            qr ? (
              <>
                <div className="flex flex-col items-center justify-center mb-[50%] ">
                  {qr}
                  <div className="m-[2vh] flex flex-row">
                    <p className="cursor-default text-[20px] flex items-center">{'有効期限'}</p>
                    <p className="cursor-default text-[20px] flex items-center font-bold ml-[10px]">
                      {min.toString().padStart(2, '0')}
                      {':'}
                      {sec.toString().padStart(2, '0')}
                    </p>
                    <div className="ml-[10px] border-blue-300 border-[10px] bg-blue-300 rounded-3xl cursor-pointer" onClick={createTicket}>
                      <TfiReload color="#008fc0" size={'15px'} />
                    </div>
                  </div>
                </div>
                <p
                  className="text-center py-[10px] px-[100px] border-[1px] rounded-2xl cursor-pointer"
                  onClick={() => {
                    setIsOpened(false);
                    setQR(null);
                  }}>
                  {'閉じる'}
                </p>
              </>
            ) : (
              <></>
            )
          ) : (
            <div
              onClick={onClick}
              className="bg-purple-900 border-[20px] border-purple-900 rounded-[100%] fixed bottom-[-30px] left-[50%] transform-[translateX(-50%)]">
              <IoQrCode className="pb-[10px]" color="white" size={'40px'} />
            </div>
          )}
        </div>
      </div>
      {/* メイン画面 */}
      <div className={isOpened ? 'blur-sm' : ''}>
        <div className="max-w-[360px] mx-auto">
          <p className="m-[10px] flex items-center justify-center font-medium">{'ホーム'}</p>
          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-row items-end justify-between">
              <p className="mb-[3px]">残高</p>
              <p
                className='text-4xl font-semibold text-[#462066] pl-[20px] after:content-["\5186"] after:text-[14px]'
                style={{ unicodeBidi: 'isolate' }}>
                {'1,350'}
              </p>
            </div>
            <p className="text-center m-[10px] py-[10px] w-[200px] rounded-2xl cursor-pointer text-white bg-[#219bce]">{'チャージする'}</p>
          </div>

          <div className="flex flex-col items-center justify-center mt-[20px]">
            <p className="m-[10px] flex items-center justify-center font-medium">定期券情報</p>
            <CommuterTicketCard
              isStudent={false}
              company="物理班電鉄"
              route_start_stop_id={1}
              route_end_stop_id={2}
              subtext="修道物理班 デモンストレーション"
              start_date="2025.04.24"
              end_date="2025.04.25"
            />
            <p className="text-center m-[10px] py-[10px] w-[200px] rounded-2xl cursor-pointer text-white bg-[#219bce]">{'定期券を購入する'}</p>
          </div>

          <div className="m-[10px] flex flex-col items-center justify-center">
            {/* <div className="flex flex-col items-center justify-center">
              <p className="font-bold">オートチャージ設定</p>
              <div className="flex m-[10px]">
                <p className="flex items-center m-[5px]">残高が</p>
                <input className="p-[5px] bg-white rounded-[6px]" type="number" min={1000} max={10000} placeholder="" />
                <p className="flex items-center m-[5px]">円 未満になったとき</p>
              </div>
              <div className="flex m-[10px]">
                <input className="p-[5px] bg-white" type="number" min={1000} max={20000} step={1000} placeholder="" />
                <p className="flex items-center m-[5px]">円 チャージする。</p>
              </div>
            </div> */}

            {/*<p className="text-center m-[10px] py-[10px] w-[200px] rounded-2xl cursor-pointer text-white bg-[#219bce]">{'設定を保存'}</p> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
