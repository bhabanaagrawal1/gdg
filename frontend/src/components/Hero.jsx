import React from 'react'
import { useNavigate } from 'react-router-dom'

const Hero = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className='w-full h-auto lg:h-screen flex flex-col lg:flex-row justify-between items-center'>
        <div className='hide lg:flex lg:w-[50%] lg:h-full bg-[url("https://i.pinimg.com/736x/08/9d/1f/089d1fe2ce3fc04d2e9724b8a7d5f3a3.jpg")] bg-cover bg-no-repeat'></div>
        <div className='w-full lg:w-[50%] h-full bg-linear-to-br from-[#f4f8fc] to-[#eef3f9] lg:bg-linear-to-br lg:from-white lg:to-white'>
            <h1 className='pt-25 pb-5 text-center lg:text-right lg:p-25 lg:pb-15 text-4xl lg:text-[78px]/7 font-semibold ml-0 lg:-ml-[47%] whitespace-normal lg:whitespace-nowrap leading-10 px-7 lg:px-0  lg:leading-none'>Safety Wherever You Go</h1>
            <p className='text-xl lg:text-4xl/12 text-center lg:text-right mr-0 lg:mr-9 font-light mb-3 lg:mb-7 px-7 lg:px-0'>You deserve to feel safe, Wherever life takes you.</p>
            <p className='text-[14px] lg:text-[18px] text-center lg:text-right mr-0 lg:mr-9 font-light lg:font-normal line-clamp-5 px-8 lg:px-0 lg:line-clamp-2 mb-7 lg:mb-10 text-gray-600 lg:text-black'>We quietly watch over your journey - giving you through safer paths, understanding your surroundings, and standing ready when you need help. Secure and supported.</p>
            <div className="flex flex-col items-center">
  <button onClick={()=>{
    navigate('/safescore')
    scrollTo(0,0);
  }
} className=' w-[80%] text-xl lg:text-2xl lg:px-20 py-4 bg-[#A7C7E7] ml-0 lg:ml-8 rounded-[10px] text-white hover:opacity-80 hover:cursor-pointer'>Check My Safety Now</button> 
  
  
  <div className='w-[80%] ml-0 lg:ml-8 text-xl mt-3 flex flex-col items-center lg:flex-row'> 
    <button onClick={()=>{
    navigate('/chatbot')
    scrollTo(0,0);
  }} className='hidden lg:flex w-full justify-center px-6 py-3 border rounded-[10px] border-[#A7C7E7] mr-0 lg:mr-4 font-light hover:text-white hover:bg-[#A7C7E7] hover:cursor-pointer  mb-3 lg:mb-0'>Safety Chat&nbsp;&nbsp; <i className="ri-arrow-right-line transition-transform duration-300 group-hover:translate-x-1"></i></button> 

    <button onClick={()=>{
    navigate('/sos')
    scrollTo(0,0);
  }} className='w-full px-6 py-3 border rounded-[10px] border-[#A7C7E7] font-light hover:text-white hover:bg-[#A7C7E7] hover:cursor-pointer mb-20 lg:mb-0'>Quick SOS &nbsp;&nbsp;<i className="ri-arrow-right-line"></i></button> 
  </div>
</div>

        </div>
      </div>
    </>
  )
}

export default Hero
