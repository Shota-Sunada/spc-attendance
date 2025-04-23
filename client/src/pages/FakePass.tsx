import { useEffect, useState } from 'react';
import MobiryButton from '../components/MobiryButton';
import { apiPass } from '../api';
import User from '../types/User';
import { useNavigate } from 'react-router-dom';

interface Props {
  user: User;
}

const FakePass = (props: Props) => {
  const [isEnabled, setIsEnabled] = useState<boolean>(props.user.is_admin);

  const [isStudent, setIsStudent] = useState<boolean>(props.user.pass_is_student);
  const [companyName, setCompanyName] = useState<string>(props.user.pass_company_name);
  const [startId, setStartId] = useState<string>(props.user.pass_start_id);
  const [endId, setEndId] = useState<string>(props.user.pass_end_id);

  const navigate = useNavigate();

  useEffect(() => {
    if (props.user.id === -1) navigate('/');
  }, [navigate, props.user.id]);

  const onSave = async () => {
    if (companyName.length > 30) {
      alert('「定期券発行会社」の名前が長すぎます。短くしてください。');
      return;
    }

    const res = await apiPass(props.user, isStudent, companyName, startId, endId, isEnabled);
    if (res) {
      alert('更新しました。');
    } else {
      alert('設定に失敗しました。管理担当者にお問い合わせください。');
    }

    navigate('/');
    return;
  };

  return (
    <div className="flex flex-col x-0">
      <p className="m-[10px] flex items-center justify-center font-bold">{'見せかけ定期券設定'}</p>
      <div className="flex flex-col items-center justify-center">
        <p>{'時間がなくて定期券のシステムが用意できなかったので、'}</p>
        <p>{'見た目だけでもお楽しみください。'}</p>
        <br />
        <p>{'※見た目だけなので、実際には使用できません。'}</p>
        <br />

        <div>
          <input type="checkbox" name="is_enabled" id="is_enabled" onChange={() => setIsEnabled(!isEnabled)} defaultChecked={isEnabled} />
          <label className="ml-[5px]" htmlFor="is_enabled">
            {'見せかけ定期券を使用する'}
          </label>
        </div>

        <div className="w-[400px]">
          <div className="m-[10px]">
            <p>{'通勤定期・通学定期 切り替え'}</p>
            <div>
              <input
                type="checkbox"
                name="is_student"
                id="is_student"
                disabled={!isEnabled}
                onChange={() => setIsStudent(!isStudent)}
                defaultChecked={isStudent}
              />
              <label className="ml-[5px]" htmlFor="is_student">
                {'通学定期券にする'}
              </label>
            </div>
          </div>

          <div className="m-[10px]">
            <p>{'定期券発行会社'}</p>
            <input
              disabled={!isEnabled}
              className="p-[10px] bg-white rounded-[6px] disabled:bg-[#c7d2d5] disabled:text-white"
              type="text"
              name="company_name"
              onChange={(e) => setCompanyName(e.target.value)}
              defaultValue={companyName}
            />
            <p>{'人が見て不快な思いをするような類のものは、登録しないでください。'}</p>
          </div>

          <div className="flex flex-row">
            <div className="m-[10px]">
              <p>{'定期券 開始電停'}</p>
              <select
                disabled={!isEnabled}
                className="p-[10px] bg-white rounded-[6px] disabled:bg-[#c7d2d5] disabled:text-white"
                name="start_stop"
                id="start_stop"
                onChange={(e) => setStartId(e.target.value)}
                defaultValue={startId}>
                <option value="bk2">{'物化第二'}</option>
                <option value="physics">{'物理'}</option>
                <option value="train">{'鉄道研究'}</option>
                <option value="jug">{'ｼﾞｬｸﾞ同'}</option>
                <option value="all">{'全線'}</option>
              </select>
            </div>

            <div className="m-[10px]">
              <p>{'定期券 終了電停'}</p>
              <select
                disabled={!isEnabled}
                className="p-[10px] bg-white rounded-[6px] disabled:bg-[#c7d2d5] disabled:text-white"
                name="start_stop"
                id="start_stop"
                onChange={(e) => setEndId(e.target.value)}
                defaultValue={endId}>
                <option value="bk2">{'物化第二'}</option>
                <option value="physics">{'物理'}</option>
                <option value="train">{'鉄道研究'}</option>
                <option value="jug">{'ｼﾞｬｸﾞ同'}</option>
                <option value="all">{'全線'}</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <MobiryButton text="設定する" onClick={onSave} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FakePass;
