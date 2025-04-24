import { useEffect, useState } from 'react';
import User from '../types/User';
import { BACKEND_ENDPOINT } from '../const';
import { Purchase, PurchaseClasses, PurchaseTypes } from '../types/Purchase';
import { v4 as uuidv4 } from 'uuid';
import '../styles/table.css';
import { parse, format } from 'date-fns';
import { FaArrowAltCircleRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface Props {
  user: User;
}

const Purchases = (props: Props) => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPurchases() {
      const payload = {
        user_id: props.user.id
      };

      const token = localStorage.getItem('token');
      if (!token) {
        console.log('購入・払戻履歴の取得に失敗しました。管理担当者にお問い合わせください。');
        return;
      }

      const res = await fetch(`${BACKEND_ENDPOINT}/getPurchases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = (await res.json()) as Purchase[];
        setPurchases(data);
      } else {
        alert('購入・払戻履歴の取得に失敗しました。管理担当者にお問い合わせください。');
      }
    }

    fetchPurchases();
  }, [props.user.id]);

  return (
    <div className="flex flex-col x-0">
      <p className="m-[10px] flex items-center justify-center font-bold">{'購入・払戻履歴'}</p>
      <div className="table-root flex items-center justify-center">
        <table className="max-w-[360px] w-[100%]">
          <thead>
            <tr className="min-h-[60px]">
              <th className="text-[12px] w-[60px] border-r-white border-r-[.5px]">{'利用日'}</th>
              <th className="text-[12px] border-r-white border-r-[.5px]">{'種別・区分'}</th>
              <th className="text-[12px] w-[76px] border-r-white border-r-[.5px]">{'金額'}</th>
              <th className="text-[12px] w-[58px]">{'詳細'}</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((x, i) => (
              <tr key={uuidv4()}>
                <td className={(i % 2 === 0 ? 'bg-[#ffffff]' : 'bg-[#fcfbf7]') + ' text-[12px]'}>
                  {format(parse(x.date, 'yyyy-MM-dd HH:SS:mm', new Date()), 'yyyy.MM.dd')}
                </td>
                <td className={(i % 2 === 0 ? 'bg-[#ffffff]' : 'bg-[#fcfbf7]') + ' text-[12px]'}>
                  {PurchaseTypes[x.type_id]}
                  <br />
                  {PurchaseClasses[x.class_id]}
                </td>
                <td className={(i % 2 === 0 ? 'bg-[#ffffff]' : 'bg-[#fcfbf7]') + ' after:content-["\\5186"] text-[12px]'}>
                  {x.purchase_price.toLocaleString('es-US')}
                </td>
                <td className={(i % 2 === 0 ? 'bg-[#ffffff]' : 'bg-[#fcfbf7]') + ' text-[12px]'}>
                  <div className="flex items-center justify-center cursor-pointer" onClick={() => navigate(`/purchase?id=${x.id}`)}>
                    <FaArrowAltCircleRight size={'30px'} color="#219bce" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Purchases;
