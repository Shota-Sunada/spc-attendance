import { RiMoneyCnyCircleLine } from 'react-icons/ri';
import { SiMoneygram } from 'react-icons/si';
import { PiTimer } from 'react-icons/pi';
import { FaUserAlt } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { FaHouse } from "react-icons/fa6";
import '../styles/menu.css';
import { useNavigate } from 'react-router-dom';

interface Props {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Menu = (props: Props) => {
  const navigate = useNavigate();

  return (
    <div className={props.isOpen ? '' : 'hidden'}>
      <div className={'fixed w-[280px] top-0 left-0 bg-white h-[100dvh] x-100 border-r'}>
        <div className="fixed left-[5px] top-[5px] border rounded-[10px] p-[10px] cursor-pointer">
          <IoClose size={'30px'} onClick={() => props.setIsOpen(false)} />
        </div>
        <div>
          <img src="/logo.png" alt="LOGO" className="w-[100px] absolute top-[44px] left-[80px]" />
        </div>
        <div className="mt-[108px]">
          <ul className="flex flex-col m-0 p-0">
            <li
              onClick={() => {
                navigate('/');
                props.setIsOpen(false);
              }}>
              <div className="icon">
                <FaHouse size={'30px'} color="#fc1d25" />
              </div>
              <a>ホーム</a>
            </li>
            <li
              onClick={() => {
                navigate('/auto-charge');
                props.setIsOpen(false);
              }}>
              <div className="icon">
                <SiMoneygram size={'30px'} color="#219bce" />
              </div>
              <a>オートチャージ設定</a>
            </li>
            <li
              onClick={() => {
                navigate('/buy-histories');
                props.setIsOpen(false);
              }}>
              <div className="icon">
                <RiMoneyCnyCircleLine size={'30px'} color="#fc1d25" />
              </div>
              <a>購入・払戻履歴</a>
            </li>
            <li
              onClick={() => {
                navigate('/usage-histories');
                props.setIsOpen(false);
              }}>
              <div className="icon">
                <PiTimer size={'30px'} color="#f4c541" />
              </div>
              <a>利用履歴</a>
            </li>
            <li
              onClick={() => {
                navigate('/user');
                props.setIsOpen(false);
              }}>
              <div className="icon">
                <FaUserAlt size={'30px'} color="#219bce" />
              </div>
              <a>ユーザー情報</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Menu;
