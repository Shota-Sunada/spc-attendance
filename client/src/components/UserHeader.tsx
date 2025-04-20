import { useLocation, useNavigate } from 'react-router-dom';
import User from '../types/User';
import { FaChevronLeft } from 'react-icons/fa';
import { NO_USER } from '../const';

type Props = {
  setUser: React.Dispatch<React.SetStateAction<User>>;
  isMenuOpen: boolean;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const UserHeader = (props: Props) => {
  const navigate = useNavigate();
  const loc = useLocation();

  const onLogoutClick = () => {
    if (!window.confirm('ログアウトしてもよろしいですか?')) {
      return;
    }

    props.setUser(NO_USER);
    localStorage.removeItem('token');
    navigate("/")
  };

  return (
    <>
      {loc.pathname === '/reader' ? (
        <></>
      ) : (
        <>
          {loc.pathname === '/' ? (
            <></>
          ) : (
            <div
              className="fixed block left-0 m-[5px] top-[5px] p-[8px] rounded-[20px] cursor-pointer hover:bg-[#f9f9fa] bg-white"
              onClick={() => navigate('/')}>
              <FaChevronLeft size={'30px'} />
            </div>
          )}
          <div className="bg-white flex flex-row p-[10px] items-center justify-center x-50">
            <button
              className="bg-[#219bce] rounded-[20px] px-[15px] py-[10px] text-white cursor-pointer hover:bg-[#008fc0] anim"
              onClick={() => props.setIsMenuOpen(!props.isMenuOpen)}>
              {'メニュー'}
            </button>
            {/* <h1 className="p-[10px] cursor-default">{'BUTSURY DAYS'}</h1> */}
            <img src="/logo.png" alt="LOGO" className="w-[100px]" />
            <button
              className="bg-[#219bce] rounded-[20px] px-[15px] py-[10px] text-white cursor-pointer hover:bg-[#008fc0] anim"
              onClick={onLogoutClick}>
              {'ログアウト'}
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default UserHeader;
