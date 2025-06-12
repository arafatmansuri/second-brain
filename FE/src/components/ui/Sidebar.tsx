import { useSearchParams } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { addContentModalAtom } from "../../store/AddContentModalState";
import { sidebarAtom } from "../../store/sideBarState";
import { icons, ui } from "../index";
export function Sidebar() {
  const isModalOpen = useRecoilValue(addContentModalAtom);
  const [isSidebarOpen,setIsSideBarOpen] = useRecoilState(sidebarAtom);
  const isDesktop = useMediaQuery("(min-width:768px)");
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <div
      className={`lg:w-[20%] md:w-[30%] h-screen shadow border-r border-gray-200 p-2 md:block ${
        isModalOpen.open ? "bg-slate-500 opacity-70 border-none" : "bg-white"
      } md:sticky top-0 md:left-0 fixed z-10 right-0 ${
        isSidebarOpen ? "block" : "hidden"
      }`}
    >
      <div className="flex items-center gap-2 md:mb-5 mb-3 cursor-pointer">
        <div
          className="md:hidden flex items-center cursor-pointer"
          onClick={() => setIsSideBarOpen((p) => !p)}
        >
          {isSidebarOpen ? (
            <icons.CrossIcon size="md" />
          ) : (
            <ui.MenuButton size="sm" />
          )}
        </div>
        <div
          className="flex items-center gap-1"
          onClick={() => {
            searchParams.set("content", "All Notes");
            setSearchParams(searchParams);
          }}
        >
          <icons.Brain size={isDesktop ? "lg" : "md"} />{" "}
          <h1 className="font-bold md:text-xl">Second Brain</h1>
        </div>
      </div>
      <div className="flex flex-col gap-2 font-semibold text-gray-700">
        <ui.SidebarItem text="Tweets" icon={<icons.TwitterIcon />} />
        <ui.SidebarItem text="Videos" icon={<icons.YoutubeIcon />} />
        <ui.SidebarItem text="Youtube" icon={<icons.YoutubeIcon />} />
      </div>
    </div>
  );
}
