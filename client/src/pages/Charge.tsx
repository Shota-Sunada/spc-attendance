import { FaArrowRight } from 'react-icons/fa';
import '../styles/radio.css';
import MobiryButton from '../components/MobiryButton';

const Charge = () => {
  const RadioChargeCard = (props: { price: number }) => (
    <div className="flex flex-row rounded-[10px] bg-white m-[8px] ">
      <input type="radio" name="charge_options" id={props.price + 'yen'} value={props.price} />
      <label className="flex items-center justify-center w-[100%] h-[100%] min-w-[120px] p-[10px] rounded-[10px]" htmlFor={props.price + 'yen'}>
        {props.price + '円'}
      </label>
    </div>
  );

  const charge = () => {};

  return (
    <>
      <div className="flex flex-col x-0">
        <p className="m-[10px] flex items-center justify-center font-medium">{'チャージ'}</p>
        <div className="">
          <div className="flex flex-row items-center justify-center">
            <div>
              <p className="font-medium text-[12px]">{'現在の残高'}</p>
              <p className='font-semibold text-[30px] after:content-["\5186"] after:text-[14px] text-[#462066]'>{'10,000'}</p>
            </div>
            <div className="m-[10px]">
              <FaArrowRight size={'30px'} color="#c7d2d5" />
            </div>
            <div>
              <p className="font-medium text-[12px]">{'チャージ後の残高'}</p>
              <p className='font-semibold text-[30px] after:content-["\5186"] after:text-[14px] text-[#462066]'>{'10,000'}</p>
            </div>
          </div>
          <div className="radio-root flex flex-row items-center justify-center">
            <div className="flex flex-col">
              <RadioChargeCard price={1000} />
              <RadioChargeCard price={3000} />
              <RadioChargeCard price={8000} />
            </div>
            <div className="flex flex-col">
              <RadioChargeCard price={2000} />
              <RadioChargeCard price={5000} />
              <RadioChargeCard price={10000} />
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
                  <span>0000円</span>
                </dd>
              </div>
            </div>
          </div>
          <div className='flex items-center justify-center m-[20px]'>
            <MobiryButton text={'チャージする'} onClick={charge} />
          </div>{' '}
        </div>
      </div>
    </>
  );
};

export default Charge;
