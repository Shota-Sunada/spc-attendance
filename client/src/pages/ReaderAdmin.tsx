import { useState } from 'react';
import MobiryButton from '../components/MobiryButton';
import { BACKEND_ENDPOINT } from '../const';
import { Admin } from '../types/Admin';

const ReaderAdmin = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [id, setId] = useState<number>(0);

  const [adultNum, setAdultNum] = useState<number>(1);
  const [childrenNum, setChildrenNum] = useState<number>(0);
  const [isCancel, setIsCancel] = useState<boolean>(false);
  const [startId, setStartId] = useState<number>(0);
  const [endId, setEndId] = useState<number>(0);
  const [fareDirect, setFareDirect] = useState<number>(0);

  const [adultNumNull, setAdultNumNull] = useState<boolean>(false);
  const [childrenNumNull, setChildrenNumNull] = useState<boolean>(false);
  const [isCancelNull, setIsCancelNull] = useState<boolean>(false);
  const [startIdNull, setStartIdNull] = useState<boolean>(false);
  const [endIdNull, setEndIdNull] = useState<boolean>(false);
  const [fareDirectNull, setFareDirectNull] = useState<boolean>(false);

  const onClick = async () => {
    const payload = {
      id6: id
    };

    const res = await fetch(`${BACKEND_ENDPOINT}/getAdmin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = (await res.json()) as Admin;
      console.log('管理システム接続: ', data.id6);
      setIsConnected(true);
    } else {
      console.log('管理システム接続失敗');
    }
  };

  const send = async () => {
    const payload = {
      id6: id,
      adult_num: adultNumNull ? null : adultNum,
      children_num: childrenNumNull ? null : childrenNum,
      is_cancel: isCancelNull ? null : isCancel,
      start_id: startIdNull ? null : startId,
      end_id: endIdNull ? null : endId,
      fare_direct: fareDirectNull ? null : fareDirect
    };

    const res = await fetch(`${BACKEND_ENDPOINT}/updateAdmin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert('送信しました');
      console.log('送信しました');
    } else {
      console.log('送信失敗');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <p className="font-bold">{'リーダー機管理画面'}</p>
      {isConnected ? (
        <div className="flex flex-col">
          <div className="m-[10px]">
            <p>大人の人数</p>
            <div>
              <input type="checkbox" name="adult_num_null" id="adult_num_null" onChange={() => setAdultNumNull(!adultNumNull)} />
              <label htmlFor="adult_num_null">設定しない</label>
            </div>
            <input
              disabled={adultNumNull}
              className="p-[10px] bg-white rounded-[6px] disabled:bg-[#c7d2d5] disabled:text-white"
              type="number"
              name="adult_num"
              onChange={(e) => setAdultNum(e.target.valueAsNumber)}
              defaultValue={adultNum}
            />
          </div>
          <div className="m-[10px] flex flex-col">
            <p>子供の人数</p>
            <div>
              <input type="checkbox" name="children_num_null" id="children_num_null" onChange={() => setChildrenNumNull(!childrenNumNull)} />
              <label htmlFor="children_num_null">設定しない</label>
            </div>
            <input
              disabled={childrenNumNull}
              className="p-[10px] bg-white rounded-[6px] disabled:bg-[#c7d2d5] disabled:text-white"
              type="number"
              name="children_num"
              onChange={(e) => setChildrenNum(e.target.valueAsNumber)}
              defaultValue={childrenNum}
            />
          </div>
          <div className="m-[10px]">
            <div>
              <input type="checkbox" name="is_cancel_null" id="is_cancel_null" onChange={() => setIsCancelNull(!isCancelNull)} />
              <label htmlFor="is_cancel_null">設定しない</label>
            </div>
            <input
              disabled={isCancelNull}
              className="p-[10px] bg-white rounded-[6px] disabled:bg-[#c7d2d5] disabled:text-white"
              type="checkbox"
              id="is_cancel"
              name="is_cancel"
              onChange={() => setIsCancel(!isCancel)}
              defaultChecked={isCancel}
            />
            <label htmlFor="is_cancel">乗車情報取り消し</label>
          </div>
          <div className="m-[10px]">
            <p>乗車駅</p>
            <div>
              <input type="checkbox" name="start_id_null" id="start_id_null" onChange={() => setStartIdNull(!startIdNull)} />
              <label htmlFor="start_id_null">設定しない</label>
            </div>
            <input
              disabled={startIdNull}
              className="p-[10px] bg-white rounded-[6px] disabled:bg-[#c7d2d5] disabled:text-white"
              type="number"
              name="start_id"
              onChange={(e) => setStartId(e.target.valueAsNumber)}
              defaultValue={startId}
            />
          </div>
          <div className="m-[10px]">
            <p>降車駅</p>
            <div>
              <input type="checkbox" name="end_id_null" id="end_id_null" onChange={() => setEndIdNull(!endIdNull)} />
              <label htmlFor="end_id_null">設定しない</label>
            </div>
            <input
              disabled={endIdNull}
              className="p-[10px] bg-white rounded-[6px] disabled:bg-[#c7d2d5] disabled:text-white"
              type="number"
              name="end_id"
              onChange={(e) => setEndId(e.target.valueAsNumber)}
              defaultValue={endId}
            />
          </div>
          <div className="m-[10px]">
            <p>運賃直接入力</p>
            <div>
              <input type="checkbox" name="fare_direct_null" id="fare_direct_null" onChange={() => setFareDirectNull(!fareDirectNull)} />
              <label htmlFor="fare_direct_null">設定しない</label>
            </div>
            <input
              disabled={fareDirectNull}
              className="p-[10px] bg-white rounded-[6px] disabled:bg-[#c7d2d5] disabled:text-white"
              type="number"
              name="fare_direct"
              onChange={(e) => setFareDirect(e.target.valueAsNumber)}
              defaultValue={Number(fareDirect)}
            />
          </div>

          <div className='flex items-center justify-center m-[15px]'>
            <MobiryButton text={'送信'} onClick={send} />
          </div>
        </div>
      ) : (
        <>
          <p>管理するリーダー機のIDを入力してください。</p>
          <input
            className="p-[10px] bg-white rounded-[6px] disabled:bg-[#c7d2d5] disabled:text-white"
            type="number"
            name="id6"
            onChange={(e) => {
              setId(e.target.valueAsNumber);
            }}
          />
          <MobiryButton text={'接続'} onClick={onClick} />
        </>
      )}
    </div>
  );
};

export default ReaderAdmin;
