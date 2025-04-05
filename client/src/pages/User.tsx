import { ReactElement, useCallback, useEffect, useState } from 'react';
import QRCode from '../components/QRCode';
import User from '../types/User';
import { BACKEND_ENDPOINT } from '../const';
import Ticket from '../types/Ticket';

type UserPageProps = {
  user: User;
};

const QR_MAX_TIMEOUT_SEC = 300;

const UserPage = (props: UserPageProps) => {
  const [qr, setQR] = useState<ReactElement | null>(null);
  const [count, setCount] = useState<number>(QR_MAX_TIMEOUT_SEC);

  const onClick = () => {
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
    <div className="m-10">
      <h1>BUTSURY DAYS</h1>
      <button onClick={onClick}>Press to generate QR code</button>
      {qr}
      {qr ? (
        <>
          <p>
            {'有効期限　'}
            {min}
            {'分'}
            {sec.toString().padStart(2, '0')}
            {'秒'}
          </p>
          <button
            onClick={() => {
              createTicket();
            }}>
            再生成
          </button>
          <button
            onClick={() => {
              setQR(null);
            }}>
            閉じる
          </button>
        </>
      ) : null}
    </div>
  );
};

export default UserPage;
