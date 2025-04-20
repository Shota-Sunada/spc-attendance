import User from '../types/User';

interface Props {
  user: User;
}

const UserPage = (props: Props) => {
  return (
    <div className="flex flex-col x-0 items-center justify-center">
      <p className="m-[10px] flex items-center justify-center font-bold">{'ユーザー情報'}</p>
      <div className="block items-center justify-center min-w-[400px] bg-[#fcfbf7] p-[10px] rounded-[10px] border-[1px] border-[#ebebde]">
        <div className="flex flex-row items-center justify-between">
          <p className="">{'ユーザーID:'}</p>
          <p className="">{props.user.id}</p>
        </div>
        <div className="flex flex-row items-center justify-between">
          <p className="">{'ユーザー名:'}</p>
          <p className="">{props.user.name}</p>
        </div>
        <div className="flex flex-row items-center justify-between">
          <p className="">{'アカウント作成日時:'}</p>
          <p className="">{props.user.created_at}</p>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
