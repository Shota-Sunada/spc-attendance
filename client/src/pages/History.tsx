import User from '../types/User';
import '../styles/table.css';
import { useEffect, useState } from 'react';
import { BACKEND_ENDPOINT, COMPANY, STATIONS, TYPE } from '../const';
import { v4 as uuidv4 } from 'uuid';
import { format, parse } from 'date-fns';
import { History as TypeHistory } from '../types/History';

interface Props {
  user: User;
}

const History = (props: Props) => {
  const [histories, setHistories] = useState<TypeHistory[]>([]);

  useEffect(() => {
    async function fetchHistories() {
      const payload = {
        user_id: props.user.id
      };

      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      const res = await fetch(`${BACKEND_ENDPOINT}/getHistories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'User-ID': String(props.user.id)
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = (await res.json()) as TypeHistory[];
        setHistories(data);
      } else {
        alert('購入・払戻履歴の取得に失敗しました。管理担当者にお問い合わせください。');
      }
    }

    fetchHistories();
  }, [props.user.id]);

  return (
    <>
      <title>{'利用履歴 - BUTSURY DAYS'}</title>
      <div className="flex flex-col x-0">
        <p className="m-[10px] flex items-center justify-center font-bold">{'利用履歴'}</p>
        <div className="table-root flex items-center justify-center">
          <table className="max-w-[360px] w-[100%]">
            <thead>
              <tr className="min-h-[60px]">
                <th className="text-[12px] w-[60px] border-r-white border-r-[.5px]">{'利用日'}</th>
                <th className="text-[12px] border-r-white border-r-[.5px]">{'利用場所'}</th>
                <th className="text-[12px] w-[76px] border-r-white border-r-[.5px]">
                  {'残高'}
                  <br />
                  {'利用額'}
                </th>
                <th className="text-[12px] w-[73px]">{'利用種別'}</th>
              </tr>
            </thead>
            <tbody>
              {histories.map((x, i) =>
                x.type_id === 1 ? (
                  <>
                    <tr key={uuidv4()}>
                      <td className={(i % 2 === 0 ? 'bg-[#ffffff]' : 'bg-[#fcfbf7]') + ' text-[12px]'} rowSpan={2}>
                        {format(parse(x.date, 'yyyy-MM-dd HH:SS:mm', new Date()), 'yyyy.MM.dd')}
                      </td>
                      <td className={(i % 2 === 0 ? 'bg-[#ffffff]' : 'bg-[#fcfbf7]') + ' text-[12px]'}>
                        {STATIONS[x.get_on_id]}
                        <br />
                        {STATIONS[x.get_off_id]}
                      </td>
                      <td className={(i % 2 === 0 ? 'bg-[#ffffff]' : 'bg-[#fcfbf7]') + ' text-[12px]'}>
                        {x.balance.toLocaleString('en-US') + '円'}
                        <br />
                        {'-'}
                        {x.fair.toLocaleString('en-US') + '円'}
                      </td>
                      <td className={(i % 2 === 0 ? 'bg-[#ffffff]' : 'bg-[#fcfbf7]') + ' text-[12px]'}>{TYPE[x.type_id]}</td>
                    </tr>
                    <tr key={uuidv4()}>
                      <td className={(i % 2 === 0 ? 'bg-[#ffffff]' : 'bg-[#fcfbf7]') + ' text-[12px]'} colSpan={3}>
                        {COMPANY[x.company_id]}
                      </td>
                    </tr>
                  </>
                ) : (
                  <tr key={uuidv4()}>
                    <td className={(i % 2 === 0 ? 'bg-[#ffffff]' : 'bg-[#fcfbf7]') + ' text-[12px]'}>
                      {format(parse(x.date, 'yyyy-MM-dd HH:SS:mm', new Date()), 'yyyy.MM.dd')}
                    </td>
                    <td className={(i % 2 === 0 ? 'bg-[#ffffff]' : 'bg-[#fcfbf7]') + ' text-[12px]'}></td>
                    <td className={(i % 2 === 0 ? 'bg-[#ffffff]' : 'bg-[#fcfbf7]') + ' text-[12px]'}>
                      {x.balance.toLocaleString('en-US') + '円'}
                      <br />
                      {x.fair.toLocaleString('en-US') + '円'}
                    </td>
                    <td className={(i % 2 === 0 ? 'bg-[#ffffff]' : 'bg-[#fcfbf7]') + ' text-[12px]'}>{TYPE[x.type_id]}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default History;
