import User from '../types/User';
import "../styles/shousai.css"

interface Props {
  user: User;
}

const UserPage = (props: Props) => {
  return (
    <div className="flex flex-col x-0 items-center justify-center mx-[20px]">
      <p className="m-[10px] flex items-center justify-center font-bold">{'ユーザー情報'}</p>
      <div className="shousai-root block items-center justify-center min-w-[300px] bg-[#fcfbf7] p-[10px] rounded-[10px] border-[1px] border-[#ebebde]">
        <div className="flex flex-row items-center justify-between">
          <p className="">{'ユーザーID:'}</p>
          <p className="font-medium">{props.user.id}</p>
        </div>
        <div className="flex flex-row items-center justify-between">
          <p className="">{'ユーザー名:'}</p>
          <p className="font-medium">{props.user.name}</p>
        </div>
        <div className="flex flex-row items-center justify-between">
          <p className="">{'ｱｶｳﾝﾄ作成日時:'}</p>
          <p className="font-medium">{props.user.created_at}</p>
        </div>
      </div>

      <div className="mt-[20px]">
        <p className="text-[13px] font-normal">{'情報の編集はできません。詳しくは管理担当者にお問い合わせください。'}</p>
      </div>
    </div>
  );
};

export default UserPage;
