import React from 'react'
import vid from '../assets/home.mp4'
import pos from '../assets/Meet AegisHer.jpg'
import post from '../assets/poster.jpg'
import { useEffect, useState } from "react";

const Video = () => {
  const [poster, setPoster] = useState(pos);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");

    const updatePoster = () => {
      setPoster(media.matches ? pos : post);
    };

    updatePoster();
    media.addEventListener("change", updatePoster);

    return () => media.removeEventListener("change", updatePoster);
  }, []);
  return (
    <div>
      <div className='w-full h-[90vh] lg:h-screen flex justify-center items-center'>
        <div className='w-[80%] lg:w-[70%] h-[90%]  lg:h-[75%] relative overflow-hidden rounded-[10px]'>
            <video
    className="absolute inset-0 w-full h-full object-cover rounded-[10px]"
    src={vid}
    poster={poster}
    muted
    playsInline
    controls
  />
        </div>
      </div>
    </div>
  )
}

export default Video;
