import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import User from '../types/User';
import { BACKEND_ENDPOINT } from '../const';
import { NO_PURCHASE_DATA, Purchase, PurchaseClasses, PurchasePlaces, PurchaseTypes } from '../types/Purchase';
import { format, parse } from 'date-fns';
import CreditsCard from '../components/CreditsCard';
import '../styles/shousai.css';

interface Props {
  user: User;
}

const PurchaseView = (props: Props) => {
  const [purchase, setPurchase] = useState<Purchase>(NO_PURCHASE_DATA);
  const [isCharge, setIsCharge] = useState<boolean>(true);

  const [params] = useSearchParams();

  const id = params.get('id');

  useEffect(() => {
    async function fetchData() {
      const payload = {
        user_id: props.user.id
      };

      const res = await fetch(`${BACKEND_ENDPOINT}/getPurchases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = (await res.json()) as Purchase[];
        const results = data.find((x) => x.id.toString() === id && x.user_id === props.user.id);
        if (results) {
          setPurchase(results);
        }
      } else {
        alert('購入・払戻履歴の取得に失敗しました。管理担当者にお問い合わせください。');
      }
    }

    fetchData();

    setIsCharge(purchase?.product_id === 0);
  }, [props.user.id, id, purchase.product_id]);

  return (
    <div className="flex flex-col x-0 items-center justify-center mx-[20px]">
      <p className="m-[10px] flex items-center justify-center font-bold">{'購入・払戻履歴詳細'}</p>
      <div className="shousai-root block items-center justify-center min-w-[300px] bg-[#fcfbf7] p-[10px] rounded-[10px] border-[1px] border-[#ebebde]">
        <div className="flex flex-row items-center justify-between">
          <p className="">{'ご利用日:'}</p>
          <p className="font-medium">{purchase.date === '' ? '' : format(parse(purchase.date, 'yyyy-MM-dd HH:SS:mm', new Date()), 'yyyy.MM.dd')}</p>
        </div>
        <div className="flex flex-row items-center justify-between">
          <p className="">{'種別:'}</p>
          <p className="font-medium">{PurchaseTypes[purchase.type_id]}</p>
        </div>
        <div className="flex flex-row items-center justify-between">
          <p className="">{'区分:'}</p>
          <p className="font-medium">{PurchaseClasses[purchase.class_id]}</p>
        </div>
        {isCharge ? (
          <></>
        ) : (
          <>
            <div className="flex flex-row items-center justify-between">
              <p className="">{'購入箇所:'}</p>
              <p className="font-medium">{PurchasePlaces[purchase.place_id]}</p>
            </div>
            <div className="flex flex-row items-center justify-between">
              <p className="">{'購入商品:'}</p>
              <p className="font-medium">{purchase.product_id}</p>
            </div>
            <div className="flex flex-row items-center justify-between">
              <p className="">{'有効期限:'}</p>
              <p className="font-medium">{'kigen'}</p>
            </div>
            <div className="flex flex-row items-center justify-between">
              <p className="">{'商品名:'}</p>
              <p className="font-medium">{purchase.teiki_id}</p>
            </div>
            <div className="flex flex-row items-center justify-between">
              <p className="">{'利用区間:'}</p>
              <p className="font-medium">{'kukan'}</p>
            </div>
            <div className="flex flex-row items-center justify-between">
              <p className="">{'運行事業者:'}</p>
              <p className="font-medium">{purchase.teiki_company_id}</p>
            </div>
          </>
        )}
        <div className="flex flex-row items-center justify-between">
          <p className="">{'販売額:'}</p>
          <p className='font-medium after:content-["\5186"]'>{purchase.price.toLocaleString("en-US")}</p>
        </div>
        <div className="flex flex-row items-center justify-between">
          <p className="">{'購入額:'}</p>
          <p className='font-medium after:content-["\5186"]'>{purchase.purchase_price.toLocaleString("en-US")}</p>
        </div>
      </div>

      <CreditsCard charge={null} />
    </div>
  );
};

export default PurchaseView;
