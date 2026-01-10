import React from 'react'
import Navbar from '../components/Navbar'
import FriendMap from '../components/FriendMap'


const FriendMapPage = () => {

    return (
        <div>
            <Navbar />
            <div className="bg-linear-to-br from-[#f4f8fc] to-[#eef3f9]">
                <h1 className="text-3xl lg:text-4xl font-bold mb-2 pt-15 text-center">Live Friend <span className='text-[#a7c7e7]'>Map</span></h1>
                <h2 className='text-center text-gray-500 text-[14px] px-10 lg:px-70'><span className='hidden lg:block'>See your friends’ live locations when they’re online or in SOS mode.</span> The map also shows all friends who’ve activated SOS, so you stay connected when it matters most.</h2>
                <FriendMap />
            </div>
        </div>
    )
}

export default FriendMapPage
