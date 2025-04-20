import { FaArrowRight } from 'react-icons/fa';
import '../styles/radio.css';
import MobiryButton from '../components/MobiryButton';
import { useState } from 'react';
import User from '../types/User';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { apiCharge } from '../api';

interface Radio {
  label: string;
  value: number;
}

interface Props {
  user: User | null;
}

const Charge = (props: Props) => {
  const [charge, setCharge] = useState<number>(1000);
  const changeValue = (event: React.ChangeEvent<HTMLInputElement>) => setCharge(Number.parseInt(event.target.value));

  const navigate = useNavigate();

  const radioButtons1: Radio[] = [
    {
      label: '1,000円',
      value: 1000
    },
    {
      label: '3,000円',
      value: 3000
    },
    {
      label: '8,000円',
      value: 8000
    }
  ];

  const radioButtons2: Radio[] = [
    {
      label: '2,000円',
      value: 2000
    },
    {
      label: '5,000円',
      value: 5000
    },
    {
      label: '10,000円',
      value: 10000
    }
  ];

  const chargeMoney = async () => {
    if (props.user) {
      apiCharge(props.user, charge, navigate);
    } else {
      alert('チャージに失敗しました。管理者にお問い合わせ下さい。');
    }
  };

  return (
    <>
      <div className="flex flex-col x-0">
        <p className="m-[10px] flex items-center justify-center font-medium">{'チャージ'}</p>
        <div className="">
          <div className="flex flex-row items-center justify-center">
            <div>
              <p className="font-medium text-[12px]">{'現在の残高'}</p>
              <p className='font-semibold text-[30px] after:content-["\5186"] after:text-[14px] text-[#462066]'>{props.user?.balance}</p>
            </div>
            <div className="m-[10px]">
              <FaArrowRight size={'30px'} color="#c7d2d5" />
            </div>
            <div>
              <p className="font-medium text-[12px]">{'チャージ後の残高'}</p>
              <p className='font-semibold text-[30px] after:content-["\5186"] after:text-[14px] text-[#462066]'>
                {props.user?.balance === undefined ? charge : props.user?.balance + charge}
              </p>
            </div>
          </div>
          <div className="radio-root flex flex-row items-center justify-center">
            <div className="flex flex-col">
              {radioButtons1.map((x) => (
                <div key={uuidv4()} className="flex flex-row rounded-[10px] bg-white m-[8px]">
                  <input
                    type="radio"
                    name="charge_options"
                    id={x.value + 'yen'}
                    value={x.value}
                    checked={x.value === charge}
                    onChange={changeValue}
                  />
                  <label
                    onClick={() => {}}
                    className="cursor-pointer flex items-center justify-center w-[100%] h-[100%] min-w-[120px] p-[10px] rounded-[10px]"
                    htmlFor={x.value + 'yen'}>
                    {x.label}
                  </label>
                </div>
              ))}
            </div>
            <div className="flex flex-col">
              {radioButtons2.map((x) => (
                <div key={uuidv4()} className="flex flex-row rounded-[10px] bg-white m-[8px]">
                  <input
                    type="radio"
                    name="charge_options"
                    id={x.value + 'yen'}
                    value={x.value}
                    checked={x.value === charge}
                    onChange={changeValue}
                  />
                  <label
                    onClick={() => {}}
                    className="cursor-pointer flex items-center justify-center w-[100%] h-[100%] min-w-[120px] p-[10px] rounded-[10px]"
                    htmlFor={x.value + 'yen'}>
                    {x.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center mt-[5px]">
            <div className="rounded-[5px] px-[10px] py-[10px] bg-[#ebebde] text-[15px]">
              <div className="flex flex-row">
                <dt className="pr-[20px]">
                  <span>支払手段:</span>
                </dt>
                <dd>
                  <p>班長のクレジットカード</p>
                  <p>SHUDO CARD **** **** **** *817</p>
                  <p>有効期限: 03/34</p>
                </dd>
              </div>
              <div className="flex flex-row">
                <dt className="pr-[20px]">
                  <span>{'　決済額:'}</span>
                </dt>
                <dd>
                  <span className='after:content-["\5186"]'>{charge}</span>
                </dd>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center m-[20px]">
            <MobiryButton text={'チャージする'} onClick={chargeMoney} />
          </div>{' '}
        </div>
      </div>
    </>
  );
};

export default Charge;
