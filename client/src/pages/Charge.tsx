import { FaArrowRight } from 'react-icons/fa';
import '../styles/radio.css';
import MobiryButton from '../components/MobiryButton';
import { useState } from 'react';
import User from '../types/User';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { apiCharge } from '../api';

interface Props {
  user: User;
}

const Charge = (props: Props) => {
  const [charge, setCharge] = useState<number>(1000);
  const changeValue = (event: React.ChangeEvent<HTMLInputElement>) => setCharge(Number.parseInt(event.target.value));

  const navigate = useNavigate();

  const radioButtons1: number[] = [1000, 3000, 8000];
  const radioButtons2: number[] = [2000, 5000, 10000];

  const chargeMoney = async () => {
    apiCharge(props.user, charge, navigate);
  };

  return (
    <>
      <div className="flex flex-col x-0">
        <p className="m-[10px] flex items-center justify-center font-bold">{'チャージ'}</p>
        <div className="flex flex-col items-center justify-center">
          <div className="flex flex-row items-center justify-center">
            <div className="flex flex-col w-[100%]">
              <p className="font-medium text-[12px] min-w-[130px] mb-[4px]">{'現在の残高'}</p>
              <p className='font-semibold text-[32px] after:content-["\5186"] after:text-[14px] text-[#462066] text-right tracking-wide leading-[1]'>
                {(props.user.balance + charge).toLocaleString('es-US')}
              </p>
            </div>
            <div className="m-[10px] flex items-center justify-center">
              <FaArrowRight size={'20px'} color="#c7d2d5" />
            </div>
            <div className="flex flex-col w-[100%]">
              <p className="font-medium text-[12px] min-w-[130px] mb-[4px]">{'チャージ後の残高'}</p>
              <p className='font-semibold text-[32px] after:content-["\5186"] after:text-[14px] text-[#462066] text-right tracking-wide leading-[1]'>
                {(props.user.balance + charge).toLocaleString('es-US')}
              </p>
            </div>
          </div>
          <div className="radio-root flex flex-row items-center justify-center mt-[20px]">
            <div className="flex flex-col">
              {radioButtons1.map((x) => (
                <div key={uuidv4()} className="flex flex-row rounded-[10px] bg-white m-[8px]">
                  <input type="radio" name="charge_options" id={x + 'yen'} value={x} checked={x === charge} onChange={changeValue} />
                  <label
                    onClick={() => {}}
                    className="cursor-pointer flex items-center justify-center w-[100%] h-[100%] min-w-[140px] py-[8px] rounded-[10px] font-bold text-[#219bce] after:content-['\5186']"
                    htmlFor={x + 'yen'}>
                    {x.toLocaleString('es-US')}
                  </label>
                </div>
              ))}
            </div>
            <div className="flex flex-col">
              {radioButtons2.map((x) => (
                <div key={uuidv4()} className="flex flex-row rounded-[10px] bg-white m-[8px]">
                  <input type="radio" name="charge_options" id={x + 'yen'} value={x} checked={x === charge} onChange={changeValue} />
                  <label
                    onClick={() => {}}
                    className="cursor-pointer flex items-center justify-center w-[100%] h-[100%] min-w-[140px] py-[8px] rounded-[10px] font-bold text-[#219bce] after:content-['\5186']"
                    htmlFor={x + 'yen'}>
                    {x.toLocaleString('es-US')}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center mt-[20px]">
            <div className="rounded-[5px] px-[10px] py-[10px] bg-[#ebebde] text-[12px]">
              <div className="flex flex-row">
                <dt className="pr-[20px]">
                  <span className="text-[12px]">支払手段:</span>
                </dt>
                <dd>
                  <p className="text-[12px] font-medium">班長のクレジットカード</p>
                  <p className="text-[12px] font-medium mt-[6px]">SHUDO CARD **** **** **** *817</p>
                  <p className="text-[12px] font-medium mt-[6px]">有効期限: 03/34</p>
                </dd>
              </div>
              <div className="flex flex-row mt-[6px]">
                <dt className="pr-[20px]">
                  <span className="text-[12px]">{'　決済額:'}</span>
                </dt>
                <dd>
                  <span className='text-[12px] font-medium after:content-["\5186"]'>{charge.toLocaleString('es-US')}</span>
                </dd>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center m-[20px]">
            <MobiryButton text={'チャージする'} onClick={chargeMoney} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Charge;
