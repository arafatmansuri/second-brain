import {
  BookText,
  ImageIcon,
  LogOut,
  Newspaper,
  Settings,
  SquarePlay,
  Twitter,
  VideoIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
// import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useAuthMutation, useUserQuery } from "../../queries/AuthQueries/queries";
import { addContentModalAtom } from "../../store/AddContentModalState";
import { sidebarAtom } from "../../store/sideBarState";
import { userAtom } from "../../store/userState";
import { icons, ui } from "../index";
// import { TwitterIcon, YoutubeIcon } from "../icons";
export function Sidebar() {
  const isModalOpen = useRecoilValue(addContentModalAtom);
  const [isSidebarOpen, setIsSideBarOpen] = useRecoilState(sidebarAtom);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // const isDesktop = useMediaQuery("(min-width:768px)");
  const userQuery = useUserQuery({credentials:true});
  const [user,setUser] = useRecoilState(userAtom);
  useEffect(() => {
    if (userQuery.status =="success") {
      setUser(userQuery.data);
    }
  }, [userQuery.status])
  
  const [searchParams, setSearchParams] = useSearchParams();
  const logoutMutation = useAuthMutation();
  const { brain } = useParams();
  const navigate = useNavigate();
  function logout() {
    logoutMutation.mutate(
      {
        method: "POST",
        endpoint: "signout",
        credentials: true,
      },
      {
        onSuccess: async () => {
          navigate("/signin", { replace: true });
        },
      }
    );
  }
  return (
    <div
      className={`lg:w-[18%] md:w-[25%] sm:w-[25%] h-screen shadow border-r border-gray-200 p-2 sm:flex flex-col justify-between ${
        isModalOpen.open ? "bg-slate-500 opacity-70 border-none" : "bg-white"
      } sm:sticky top-0 sm:left-0 fixed z-10 right-0 ${
        isSidebarOpen ? "flex" : "hidden"
      } `}
    >
      <div>
        <div className="flex items-center gap-2 md:mb-5 mb-3 cursor-pointer">
          <div
            className="sm:hidden flex items-center cursor-pointer"
            onClick={() => setIsSideBarOpen((p) => !p)}
          >
            {isSidebarOpen ? (
              <icons.CrossIcon size="md" />
            ) : (
              <ui.MenuButton size="sm" />
            )}
          </div>
          <div
            className="flex items-center gap-1 w-fit"
            onClick={() => {
              searchParams.set("content", "All Notes");
              setSearchParams(searchParams);
            }}
          >
            <icons.Brain size={"md"} />{" "}
            <h1 className="font-bold md:text-xl">Second Brain</h1>
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 font-semibold text-gray-700">
          <ui.SidebarItem text="Tweets" icon={<Twitter />} />
          <ui.SidebarItem text="Videos" icon={<VideoIcon />} />
          <ui.SidebarItem text="Youtube" icon={<SquarePlay />} />
          <ui.SidebarItem text="Images" icon={<ImageIcon />} />
          <ui.SidebarItem text="Documents" icon={<BookText />} />
          <ui.SidebarItem text="Articles" icon={<Newspaper />} />
          {/* <ui.SidebarItem text="Tags" icon={<icons.YoutubeIcon />} /> */}
        </div>
      </div>
      {/* {!brain && <Button
        text="Log out"
        size="md"
        varient="primary"
        widthFull={true}
        classes="mt-10"
        onClick={logout}
      />} */}
      {!brain && (
        <div
          className="flex gap-3 rounded-md p-1 w-full transition-all duration-200 items-center cursor-pointer hover:bg-gray-200 justify-between"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="flex justify-center items-center gap-2">
            <div className="rounded-full bg-purple-600 w-8 h-8 font-medium flex items-center justify-center text-white">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
            <h3 className="font-medium">{user.username}</h3></div>
          <BsThreeDots
            className={`h-4 w-5 text-gray-500 transition-transform duration-200 
              rotate-90`}
          />
        </div>
      )}
      {isDropdownOpen && (
        <>
          <div
            className="fixed z-10 cursor-pointer"
            onClick={() => setIsDropdownOpen(false)}
          />
          <div className="absolute sm:left-45 sm:bottom-14 bottom-14 right-40 bg-white border border-gray-200 rounded-xl shadow-xl z-20 w-54 py-2">
            <div className="px-4 py-3 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-900">
                {user?.username}
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setIsDropdownOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
              <button
                onClick={() => {
                  logout();
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
