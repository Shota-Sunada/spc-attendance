import { FaArrowLeft } from 'react-icons/fa';
import { FaArrowRight } from 'react-icons/fa';

interface Props {
  isStudent: boolean;
  company: string;
  route_start_stop_id: number;
  route_end_stop_id: number;
  subtext: string;
  start_date: string;
  end_date: string;
}

export const NoCommuterTicketCard = () => {
  return (
    <div className="flex items-center justify-center bg-white rounded-[15px] cursor-pointer p-[20px] w-[296px] h-[167px] hover:bg-[#f9f9fa]">
      <p>{'使用可能な定期券はありません'}</p>
    </div>
  );
};

export const CommuterTicketCard = (props: Props) => {
  return (
    <div className="bg-white rounded-[15px] cursor-pointer p-[20px] w-[296px] h-[167px] hover:bg-[#f9f9fa] anim">
      <div className="flex flex-row">
        <p className="font-semibold">{props.isStudent ? '通学' : '通勤'}</p>
        <p className="font-medium">{'：'}</p>
        <p className="font-medium">{props.company}</p>
      </div>
      <div className="flex flex-row m-[10px] items-center justify-center">
        <p className="font-semibold text-2xl items-center justify-center">{'仮電停1'}</p>
        <div className="flex flex-row items-center justify-center">
          <FaArrowLeft className="transform-[translateX(5px)]" size={'20px'} color={'#c7d2d5'} />
          <FaArrowRight className="transform-[translateX(-5px)]" size={'20px'} color={'#c7d2d5'} />
        </div>
        <p className="font-semibold text-2xl items-center justify-center">{'仮電停2'}</p>
      </div>
      <p className="flex items-center justify-center text-[12px] font-medium">{props.subtext}</p>
      <div className="mt-[10px] flex flex-row items-center justify-center">
        <p className="text-[18px]">{props.start_date}</p>
        <p className="text-[18px]">{'-'}</p>
        <p className="text-[18px]">{props.end_date}</p>
      </div>
    </div>
  );
};
