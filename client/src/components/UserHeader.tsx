import User from '../types/User';

type Props = {
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

const UserHeader = (props: Props) => {
  const onLogoutClick = () => {
    if (!window.confirm('ログアウトしてもよろしいですか?')) {
      return;
    }

    props.setUser(null);
    localStorage.removeItem('token');
    location.reload();
  };

  return (
    <div className="bg-white flex flex-row p-[10px] items-center justify-center">
      <h1 className="p-[1vh] cursor-default">{'BUTSURY DAYS'}</h1>
      <button className="bg-[#008fc0] rounded-[3px] p-[10px] text-white cursor-pointer" onClick={onLogoutClick}>
        {'ログアウト'}
      </button>
    </div>
  );
};

export default UserHeader;
