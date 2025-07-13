import { ReactElement, useCallback, useEffect, useState } from 'react';
import { QRCode, QRFormat } from '../components/QRCode';
import User from '../types/User';
import { BACKEND_ENDPOINT, PASS_STATIONS, QR_VERSION } from '../const';
import Ticket from '../types/Ticket';
import { IoQrCode } from 'react-icons/io5';
import { TfiReload } from 'react-icons/tfi';
import { CommuterTicketCard, NoCommuterTicketCard } from '../components/CommuterTicketCard';
// import { NoCommuterTicketCard } from '../components/CommuterTicketCard';
import MobiryButton from '../components/MobiryButton';
import { useNavigate } from 'react-router-dom';
// import { apiBan } from '../api';

type UserPageProps = {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  isQROpened: boolean;
  setIsQROpened: React.Dispatch<React.SetStateAction<boolean>>;
  isMenuOpen: boolean;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isBanned: boolean;
  setIsBanned: React.Dispatch<React.SetStateAction<boolean>>;
  isSmartphone: boolean;
};

const QR_MAX_TIMEOUT_SEC = 300;
const GEN_RESET_TIMEOUT_SEC = 10;
const GEN_LIMIT_PER_SECONDS = 20;

const UserPage = (props: UserPageProps) => {
  const navigate = useNavigate();

  const [qr, setQR] = useState<ReactElement | null>(null);
  const [count, setCount] = useState<number>(QR_MAX_TIMEOUT_SEC);

  const [genCount, setGenCount] = useState<number>(0);
  const [genResetCount, setGenResetCount] = useState<number>(GEN_RESET_TIMEOUT_SEC);

  const [initialized, setInitialized] = useState<boolean>(false);

  const onClick = () => {
    props.setIsQROpened(true);
    props.setIsMenuOpen(false);
    createTicket();
  };

  const createTicket = useCallback(async () => {
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

    const payload = {
      user_id: props.user.id
    };

    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${BACKEND_ENDPOINT}/api/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'User-ID': String(props.user.id)
        },
        body: JSON.stringify(payload)
      });

      const data = (await res.json()) as Ticket;
      if (res.ok) {
        GenerateQRCode(data.uuid);
        console.log('QRコード生成');
      }
    } catch {
      //
    }

    setGenCount(genCount + 1);

    if (genCount === 1) {
      setGenResetCount(GEN_RESET_TIMEOUT_SEC);
    }

    if (genCount > GEN_LIMIT_PER_SECONDS) {
      props.setIsBanned(true);
      props.setIsQROpened(false);
      // apiBan(props.user);
    }
  }, [genCount, props]);

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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (genResetCount <= 0) {
        setGenCount(0);
      } else {
        setGenResetCount(genResetCount - 1);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [genResetCount]);

  const sec = count % 60;
  const min = (count - sec) / 60;

  const getMe = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    const res = await fetch(`${BACKEND_ENDPOINT}/api/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-ID': String(props.user.id)
      }
    });

    if (res.ok) {
      const data = await res.json();
      props.setUser(data);
      console.log(data);
    } else {
      localStorage.removeItem('token');
    }
  }, [props]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!initialized) {
      getMe();
      setInitialized(true);
    }
  });

  useEffect(() => {
    if (props.user.is_banned) {
      props.setIsBanned(true);
    }
  }, [props.user.is_banned, props]);

  return (
    <>
      <title>{'ホーム - BUTSURY DAYS'}</title>
      {/* QRコード */}
      {props.isBanned ? (
        <>
          <div className="content items-center justify-center m-[10px]">
            <p className="text-center">{'【お知らせ】'}</p>
            <p className="text-center">{'過剰なQRコードの生成を検知したため、一時的にサービスを停止しました。'}</p>
            <br />
            <p className="text-center">{'ページをリロードしてください。'}</p>
            <br />
            <br />
            <p className="text-center">{'開発・管理担当: 修道物理班'}</p>
          </div>
        </>
      ) : (
        <>
          <div className="fixed bottom-[1vh] left-[50%] transform-[translateX(-50%)] bg-white p-[25px] rounded-2xl z-100">
            <div className="flex flex-col items-center justify-center">
              {props.isQROpened ? (
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
                        props.setIsQROpened(false);
                        setQR(null);
                        getMe();
                      }}>
                      {'閉じる'}
                    </p>
                  </>
                ) : (
                  <p
                    className="text-center py-[10px] px-[100px] border-[1px] rounded-2xl cursor-pointer"
                    onClick={() => {
                      props.setIsQROpened(false);
                      setQR(null);
                      getMe();
                    }}>
                    {'閉じる'}
                  </p>
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
          <div className={props.isQROpened ? 'blur-sm transition-[.1s]' : ''}>
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
                <MobiryButton
                  text="チャージする"
                  onClick={() => {
                    if (!props.isQROpened) {
                      navigate('/charge');
                    }
                  }}
                />
              </div>

              <div className="flex flex-col items-center justify-center mt-[20px]">
                <p className="m-[10px] flex items-center justify-center font-medium mb-[30px]">{'定期券情報'}</p>
                {props.user.is_admin ? (
                  <CommuterTicketCard
                    isStudent={props.user.pass_is_student}
                    company={props.user.pass_company_name}
                    route_start_stop={PASS_STATIONS(props.user.pass_start_id)}
                    route_end_stop={PASS_STATIONS(props.user.pass_end_id)}
                    subtext="修道物理班 デモンストレーション"
                    start_date="2025.04.24"
                    end_date="2025.04.25"
                  />
                ) : (
                  <NoCommuterTicketCard />
                )}
                <MobiryButton
                  text="定期券を設定する"
                  onClick={() => {
                    if (!props.isQROpened) {
                      navigate('/fake-pass');
                    }
                  }}
                />
                {/* <p className="m-[5px] text-[12px]">{'※定期券は購入できません。'}</p> */}
              </div>
              <div className="flex flex-col items-center justify-center mt-[20px]">
                <p className='text-3xl'>{props.user.is_admin ? '現在活動中 👍' : '現在休暇中 💤'}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default UserPage;
