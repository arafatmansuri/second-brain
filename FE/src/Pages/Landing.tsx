// ---------main landing page --> have to add grid or dot in bg-> in v2 -------

import { useNavigate } from "react-router-dom";
import heroImage from "/heroImage.png";
// import { HandleDemo } from "./HandleDemo";
import { LandingSection } from "../components/ui";
//import heroimagedark1 from "../assets/heroimagedark1.png"
//import heroimagedark2 from "../assets/heroimagedark2.png"
import { useEffect, useRef } from "react";
import heroimagedark4 from "/heroimagedark4.png";
import {
  useRefreshTokenMutation,
  useUserQuery,
} from "../queries/AuthQueries/queries";
//import toast from "react-hot-toast";
// import { ThreeDots } from "react-loader-spinner";

export default function LandingPage() {
  //   const [loader, setLoader] = useState(false);
  const user = useUserQuery({ credentials: true });
  const refreshTokenMutation = useRefreshTokenMutation();
  const navigate = useNavigate();
  const hasTriedRefresh = useRef(false);
  useEffect(() => {
    if (user.status == "error" && !hasTriedRefresh.current) {
      hasTriedRefresh.current = true;
      refreshTokenMutation.mutate(undefined, {
        onSuccess: () => {
          navigate("/dashboard");
        },
        //   onError: () => navigate("/signin"),
      });
    }
    if (user.status == "success") {
      navigate("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTokenMutation, user.status]);
  return (
    <div className="md:-mb-8 min-h-screen text-black">
      {/* Header
      <Navbar/>    */}

      {/* Hero */}
      <section className="flex flex-col-reverse md:flex-row md:justify-center md:px-8  min-h-screen max-w-7xl mx-auto mt-6 md:-mt-4 ">
        {/* Left Content */}
        <div className="flex-1 ">
          <div className="flex justify-center md:justify-normal">
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl -mt-32 md:mt-32 xl:mt-40 ">
              <span className="block font-bold md:pl-0 pl-8">
                Your Second Brain
              </span>
              <span className="flex leading-[1.5] md:leading-[3.5rem] lg:leading-[4.5rem] xl:leading-[5.5rem] font-bold  pl-2">
                <span>with</span>
                <span className="block text-purple-600 font-extrabold ml-2">
                  AI-Powered
                </span>
                {/* only for mobile view + sm */}
                <span className="md:hidden block text-purple-600 font-extrabold md:ml-2 ml-2">
                  Search
                </span>
              </span>
              {/* this show on only md or above breakpoints. */}
              <span className="hidden md:block  text-purple-600 font-extrabold md:ml-2 ml-16">
                Search
              </span>
            </h1>
          </div>

          <p
            className="text-sm md:text-sm lg:text-lg font-medium
           text-slate-600 md:mt-4 lg:mt-10 -mt-4 px-6 md:px-2 flex justify-center md:justify-center"
          >
            {/* Store and organize your digital life — links,  YouTube <br className="md:hidden"/> videos, tweets, notes, and more. */}
            Second Brain doesn’t just store your knowledge — it thinks with you.
            Our AI understands context, connects ideas, and find ideas by
            meaning, not just keywords.
          </p>

          {/* <h2 className="flex justify-center md:justify-normal md:mt-24 mt-10 text-purple-500 font-bold text-2xl md:text-4xl">Powered by AI to search smarter</h2> */}
          {/*           
          <div className="flex justify-center md:justify-normal  font-semibold text-gray-600 text-sm md:text-lg md:mt-2 px-4 md:px-2">
            Forget scrolling through bookmarks — just  ask,  and your  AI brain delivers</div>
            */}

          <div className="flex justify-center md:justify-start items-stretch md:gap-16 lg:gap-24 gap-12 mt-8 md:mt-16 lg:mt-16 md:ml-2 ml-5 mb-7">
            <button
              type="button"
              onClick={() => {
                navigate("/signup");
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 md:px-4 md:py-2
                    lg:px-6 lg:py-4 xl:px-8 xl:py-4  rounded-md md:rounded-md lg:rounded-lg xl:rounded-lg
                     text-sm md:text-lg lg:text-lg xl:text-xl font-semibold transition cursor-pointer"
            >
              Get Started
            </button>

            {/* <button
              className="dark:hover:bg-zinc-800 dark:text-white px-8 py-2 lg:px-8 lg:py-4 md:px-4
                   md:py-1 font-semibold text-[15px] text-sm lg:text-lg xl:text-xl  border-purple-600 border-2 hover:bg-purple-200
                    text-purple-900 rounded-md md:rounded-md lg:rounded-lg xl:rounded-xl transition"
              onClick={() => HandleDemo({ navigate, setLoader })}
            >
              {loader ? <ThreeDots height={10} color="purple" /> : "Try Demo"}
            </button> */}
          </div>
        </div>

        <div className="flex-1 md:mt-11 lg:mt-2 -mt-2 mb-15">
          <img
            src={heroImage}
            alt="Second Brain image"
            className="w-80  min-[415px]:w-96 md:min-w-96 lg:min-w-[492px]  xl:min-w-[536px] object-cover mx-auto block"
          />

          {/* when theme --> dark  */}
          <img
            src={heroimagedark4}
            alt="Second Brain image"
            className="w-80  min-[415px]:w-96 md:min-w-96  lg:min-w-[492px]  xl:min-w-[536px] object-cover hidden mx-auto"
          />
        </div>
      </section>

      <LandingSection />
    </div>
  );
}
