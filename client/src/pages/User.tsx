import { ReactElement, useCallback, useEffect, useState } from 'react';
import QRCode from '../components/QRCode';
import User from '../types/User';
import { BACKEND_ENDPOINT } from '../const';
import Ticket from '../types/Ticket';
import { IoQrCode } from 'react-icons/io5';
import { TfiReload } from 'react-icons/tfi';
import UserHeader from '../components/UserHeader';

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
      <div className="fixed bottom-[1vh] left-[50%] transform-[translateX(-50%)] bg-white p-[25px] rounded-2xl">
        <div className="flex flex-col items-center justify-center">
          {isOpened ? (
            qr ? (
              <>
                <div className="flex flex-col items-center justify-center mb-[50%]">
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
              className="bg-purple-900 border-[3vh] border-purple-900 rounded-[100%] fixed bottom-[-4vh] left-[50%] transform-[translateX(-50%)]">
              <IoQrCode className="pb-[1vh]" color="white" size={'5vh'} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPage;
