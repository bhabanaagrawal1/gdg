import React, { useRef, useState } from "react";

const RealCards = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const refs = useRef([]);

  const handleMouseMove = (e, index) => {
    const bounds = refs.current[index].getBoundingClientRect();
    setPosition({
      x: e.clientX - bounds.left,
      y: e.clientY - bounds.top,
    });
  };

  const safetyFeatures = [
    {
      title: "Live Safety Score",
      description:
        "Real-time safety awareness based on location, time, routes, and nearby reports — so you know how safe your surroundings are.",
      icon: "https://i.pinimg.com/736x/41/7d/d3/417dd3e43579a76d6e87b18549388d90.jpg",
    },
    {
      title: "Quick SOS",
      description:
        "One tap instantly alerts trusted contacts with your live location, with a short cancellation window for accidental touches.",
      icon: "https://i.pinimg.com/736x/ee/85/bf/ee85bfcb87fe10a10f3341077a22a613.jpg",
    },
    {
      title: "AI chatbot",
      description:
        "An AI-powered chatbot that listens, guides, and helps you stay safe anytime, anywhere.",
      icon: "https://i.pinimg.com/736x/6d/dc/3f/6ddc3f9a79c891e0efd6042624e08f51.jpg",
    },
    {
      title: "Community Reports",
      description:
        "Anonymous reports from the community help identify unsafe zones and keep everyone informed.",
      icon: "https://i.pinimg.com/736x/4c/7b/14/4c7b14fa5041fdb9d954f6f65c9da668.jpg",
    },
    {
      title: "Offline Emergency Mode",
      description:
        "Even without internet, critical SOS messages can be sent via SMS to ensure help reaches you.",
      icon: "https://i.pinimg.com/736x/4a/56/e8/4a56e8884154f8f138742f360ac5f9b8.jpg",
    },
    {
      title: "Offline Safety Mode",
      description:
        "Even without internet, your last known location is securely shared with your emergency contacts.",
      icon: "https://i.pinimg.com/1200x/cb/07/2d/cb072d5032a9fcde2215653d720f2548.jpg",
    },
  ];

  return (
   <>
      <h1 id='one' className="text-4xl sm:text-5xl lg:text-7xl text-center px-6 py-7 lg:py-14">
        How We Keep <span className="text-[#A7C7E7]">You Safe</span>
      </h1>

      <div className="min-h-screen flex justify-center px-4 pb-10 lg:pb-20">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 max-w-6xl w-full">
    {safetyFeatures.map((item, index) => (
      <div
        key={index}
        ref={(el) => (refs.current[index] = el)}
        onMouseMove={(e) => handleMouseMove(e, index)}
        onMouseEnter={() => setHoveredIndex(index)}
        onMouseLeave={() => setHoveredIndex(null)}
        className="relative w-full max-w-78 sm:max-w-sm h-80 sm:h-96 rounded-xl p-0.5 bg-white overflow-hidden shadow-lg cursor-pointer mx-auto"
      >
        {hoveredIndex === index && (
          <div
            className="pointer-events-none blur-xl bg-linear-to-r from-[#EAF2FF] via-[#A7C7E7] to-[#EDF4FF] size-48 sm:size-60 absolute z-0 transition-opacity duration-300"
            style={{
              top: position.y - 100,
              left: position.x - 100,
            }}
          />
        )}

        <div className="relative z-10 bg-white h-full w-full rounded-[10px] flex flex-col items-center justify-center text-center p-4 sm:p-6">
          <img
            src={item.icon}
            alt={item.title}
            className="w-16 h-16 sm:w-24 sm:h-24 rounded-full shadow-md my-4 sm:my-5"
          />

          <h2 className="text-base sm:text-2xl font-bold mb-3 sm:mb-5">
            {item.title}
          </h2>

          <p className="text-xs sm:text-sm text-gray-500 px-2 sm:px-4">
            {item.description}
          </p>
        </div>
      </div>
    ))}
  </div>
</div>

    </>
  );
};

export default RealCards;
