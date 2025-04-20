import { ReactElement, useCallback, useEffect, useState } from 'react';
import { QRCode, QRFormat } from '../components/QRCode';
import User from '../types/User';
import { BACKEND_ENDPOINT, QR_VERSION } from '../const';
import Ticket from '../types/Ticket';
import { IoQrCode } from 'react-icons/io5';
import { TfiReload } from 'react-icons/tfi';
// import { CommuterTicketCard, NoCommuterTicketCard } from '../components/CommuterTicketCard';
import { NoCommuterTicketCard } from '../components/CommuterTicketCard';
import MobiryButton from '../components/MobiryButton';
import { useNavigate } from 'react-router-dom';

type UserPageProps = {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  isMenuOpen: boolean;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSmartphone: boolean;
};

const QR_MAX_TIMEOUT_SEC = 300;

const UserPage = (props: UserPageProps) => {
  const navigate = useNavigate();

  const [qr, setQR] = useState<ReactElement | null>(null);
  const [count, setCount] = useState<number>(QR_MAX_TIMEOUT_SEC);
  const [isOpened, setIsOpened] = useState<boolean>(false);

  const onClick = () => {
    setIsOpened(true);
    createTicket();
  };

  const getAuthUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    const res = await fetch(`${BACKEND_ENDPOINT}/api/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.ok) {
      const data = await res.json();
      props.setUser(data);
    } else {
      localStorage.removeItem('token');
    }
  }, [props]);

  useEffect(() => {
    getAuthUser();
  }, [getAuthUser]);

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

  function GenerateQRCode(uuid: string) {
    setCount(QR_MAX_TIMEOUT_SEC);

    const json: QRFormat = {
      version: QR_VERSION,
      data: uuid
    };

    const data = JSON.stringify(json);

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
    <>
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
              className="bg-purple-900 border-[20px] border-purple-900 rounded-[100%] fixed bottom-[-30px] left-[50%] transform-[translateX(-50%)] cursor-pointer hover:border-purple-950 hover:bg-purple-950">
              <IoQrCode className="pb-[10px]" color="white" size={'40px'} />
            </div>
          )}
        </div>
      </div>
      {/* メイン画面 */}
      <div className={isOpened ? 'blur-sm transition-[.1s]' : ''}>
        <div className="max-w-[360px] mx-auto">
          <p className="m-[10px] flex items-center justify-center font-bold">{'ホーム'}</p>
          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-row items-end justify-between mb-[10px]">
              <p className="mb-[3px]">{'残高'}</p>
              <p
                className='text-4xl font-bold text-[#462066] pl-[20px] after:content-["\5186"] after:text-[14px] after:ml-[4px]'
                style={{ unicodeBidi: 'isolate' }}>
                {props.user.balance.toLocaleString('es-US')}
              </p>
            </div>
            <MobiryButton text="チャージする" onClick={() => navigate('/charge')} />
          </div>

          <div className="flex flex-col items-center justify-center mt-[20px]">
            <p className="m-[10px] flex items-center justify-center font-medium mb-[30px]">定期券情報</p>
            {/* <CommuterTicketCard
              isStudent={false}
              company="物理班電鉄"
              route_start_stop_id={1}
              route_end_stop_id={2}
              subtext="修道物理班 デモンストレーション"
              start_date="2025.04.24"
              end_date="2025.04.25"
            /> */}
            <NoCommuterTicketCard />
            <MobiryButton text="定期券を購入する" onClick={() => navigate('/buy-commuter')} />
          </div>
        </div>
      </div>
    </>
  );
};

export default UserPage;
