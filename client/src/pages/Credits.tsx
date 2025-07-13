const Credits = () => {
  return (
    <>
      <title>{'クレジット - BUTSURY DAYS'}</title>
      <div className="flex flex-col x-0 items-center justify-center mx-[20px]">
        <p className="m-[10px] flex items-center justify-center font-bold">{'クレジット'}</p>
        <div className="mt-[20px] flex flex-col items-center justify-center text-center">
          <p className="font-normal">{'このアプリケーションは BUTSURY DAYS をベースに作成されました。'}</p>
          <br />
          <p className="font-normal">{'Copyright 2025 Shudo Physics Club'}</p>
        </div>
        <p className="mt-[20px] font-normal">{"MOBIRY DAYS クレジット"}</p>
        <div className="flex flex-col items-center justify-center text-center border p-[10px] rounded-2xl">
          <p className="font-normal">{'原案'}</p>
          <p className="font-normal">{'MOBIRY DAYS - 広島電鉄株式会社'}</p>
          <br />
          <p className="font-normal">{'開発'}</p>
          <p className="font-normal">{'修道物理班 技術部 プログラム課'}</p>
          <br />
          <p className="font-normal">{'このプロジェクトの参考元となった「MOBIRY DAYS」の関係者の皆様へ、この場をお借りして厚く御礼申し上げます。'}</p>
          <br />
          <p className="font-normal">{'Copyright 2025 Shudo Physics Club'}</p>
        </div>
      </div>
    </>
  );
};

export default Credits;
