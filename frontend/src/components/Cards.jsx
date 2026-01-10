import React from 'react'
import { useNavigate } from 'react-router-dom'

const Cards = () => {
  const navigate = useNavigate();
  return (
   <div>
      <div className='w-full h-auto lg:h-screen flex flex-col lg:flex-row lg:justify-center items-center pb-5 lg:pb-20 border-b border-gray-300'>
        <div className='w-full lg:w-[45%] h-auto lg:h-[90%]'>
          <div className='w-full h-1/2 text-4xl lg:text-7xl text-center lg:text-right relative'>
          <div className='static lg:absolute lg:bottom-4 right-0 lg:right-10 mb-5 lg:mb-0'>
            <p className='mr-0 lg:mr-10'>You're doing</p>
            <p className='mr-0 lg:mr-10 text-nowrap'>everything <span className='text-[#A7C7E7]'>right</span>,</p>
          </div>
          </div>
          <div className='w-full h-1/2 flex justify-center items-center'>
          <p className='hidden lg:flex lg:text-[#A7C7E7] lg:w-[20%] lg:h-full lg:text-8xl lg:justify-center lg:items-center'>01</p>
          <img src="https://i.pinimg.com/736x/3b/0a/19/3b0a19c08d26572cdbb8a07a629eb166.jpg" alt="" className='object-cover w-[80%] h-[50vh] lg:h-full rounded-3xl' />
          </div>
        </div>
        <div className='w-full lg:w-[45%] h-auto lg:h-[90%]'>
        <div className='hidden lg:flex w-full h-1/2 items-baseline'></div>
          <div className='w-full h-1/2 pl-0 lg:pl-5 text-4xl lg:text-7xl static lg:relative'>
          <div className='static lg:absolute top-0 left-0 lg:left-5 text-center lg:text-left my-3 lg:my-0'>
            <p>yet something</p>
          <p>still <span className='text-[#A7C7E7]'>feel off&nbsp;</span>? </p>
          </div>
          <div className='w-full lg:w-[15%] lg:absolute lg:left-5 lg:bottom-0 lg:text-left text-[14px] leading-4 font-thin text-center mb-3 lg:mb-0 px-7 lg:px-0'>You just know something isn't right, and that awareness deserves to be respected.</div>
          <div className='flex justify-center mb-5 lg:mb-0'>
            <button onClick={()=>navigate('/home#one')} className='static lg:absolute lg:bottom-2 lg:right-32 text-[15px] border rounded-[10px] px-5 py-3 font-semibold hover:cursor-pointer hover:text-white hover:bg-[#A7C7E7]'>Learn how we help</button>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cards
