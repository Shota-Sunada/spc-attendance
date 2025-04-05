import { ReactElement, useState } from 'react';
import QRCode from '../components/QRCode';
import User from '../types/User';
import { BACKEND_ENDPOINT } from '../const';
import Ticket from '../types/Ticket';

type UserPageProps = {
  user: User;
};

const UserPage = (props: UserPageProps) => {
  const [qr, setQR] = useState<ReactElement>();

  const onClick = () => {
    createTicket();
  };

  const createTicket = async () => {
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
  };

  function GenerateQRCode(data: string) {
    setQR(<QRCode data={data}></QRCode>);
  }

  return (
    <div className="m-10">
      <h1>BUTSURY DAYS</h1>
      <button onClick={onClick}>Press to generate QR code</button>
      {qr}
    </div>
  );
};

export default UserPage;
