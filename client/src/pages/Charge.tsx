import { FaChevronLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Charge = () => {
  const navigate = useNavigate()

  return (
    <div className='items-center flex h-[44px] justify-center relative'>
      <div className="absolute block left-[10px] m-[10px] top-[10px] p-[10px] rounded-[20px] cursor-pointer hover:bg-[#f9f9fa] bg-white" onClick={()=> navigate("/")}>
        <FaChevronLeft size={"50px"}/>
      </div>
    </div>
  );
};

export default Charge;
