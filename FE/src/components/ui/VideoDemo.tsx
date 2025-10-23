import { useEffect, useRef } from "react";
export const VideoDemo = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = "./demomp4.mp4";
      videoRef.current.play().catch(() => {
        console.log("Autoplay failed, probably due to browser policy.");
      });
    }
  }, []);

  return (
    // <video
    //   ref={videoRef}
    //   muted
    //   loop
    //   playsInline
    //   preload="auto"
    //   className="w-full lg:min-w-[536px] xl:w-full rounded-3xl shadow-xl border-4 border-purple-500  ring-1 ring-gray-200"
    // >
    //   <source src={"/FE/src/components/ui/demomp4.mp4"} type="video/mp4" />
    // </video>
    <video
      src="./demomp4.mp4"
      controls
      className="w-full lg:min-w-[536px] xl:w-full rounded-3xl shadow-xl border-4 border-purple-500 ring-1 ring-gray-200"
    />
  );
};
