import { useRecoilValue } from "recoil";
import { addContentModalAtom } from "../../store/AddContentModalState";
import { icons, ui } from "../index";
export function Sidebar() {
  const isModalOpen = useRecoilValue(addContentModalAtom);
  return (
    <div
      className={`w-[20%] h-screen shadow border-r border-gray-200 p-2 hidden md:block ${
        isModalOpen && "bg-slate-500 opacity-40 border-none"
      } md:sticky top-0 left-0`}
    >
      <div className="flex items-center gap-1 mb-5">
        <icons.Brain /> <h1 className="font-bold text-xl">Second Brain</h1>
      </div>
      <div className="flex flex-col gap-2 font-semibold text-gray-700">
        <ui.SidebarItem text="Tweets" icon={<icons.TwitterIcon />} />
        <ui.SidebarItem text="Videos" icon={<icons.YoutubeIcon />} />
      </div>
    </div>
  );
}
