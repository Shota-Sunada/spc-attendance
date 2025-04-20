const CreditsCard = (props: { charge: number | null }) => {
  return (
    <div className="flex items-center justify-center mt-[20px]">
      <div className="rounded-[5px] px-[10px] py-[10px] bg-[#ebebde] text-[12px]">
        <div className="flex flex-row">
          <dt className="pr-[10px]">
            <span className="text-[12px]">{'支払手段:'}</span>
          </dt>
          <dd>
            <p className="text-[12px] font-medium">{'班長のクレジットカード'}</p>
            <p className="text-[12px] font-medium mt-[6px]">{'ButsuryCard **** **** **** *817'}</p>
            <p className="text-[12px] font-medium mt-[6px]">{'有効期限: 03/34'}</p>
          </dd>
        </div>
        {props.charge ? (
          <div className="flex flex-row mt-[6px]">
            <dt className="pr-[10px]">
              <span className="text-[12px]">{'　決済額:'}</span>
            </dt>
            <dd>
              <span className='text-[12px] font-medium after:content-["\5186"]'>{props.charge.toLocaleString('es-US')}</span>
            </dd>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default CreditsCard;
