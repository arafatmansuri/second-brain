import {
  BookText,
  ImageIcon,
  Newspaper,
  SquarePlay,
  Twitter,
  VideoIcon,
} from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useAuthMutation } from "../../queries/AuthQueries/queries";
import { addContentModalAtom } from "../../store/AddContentModalState";
import { sidebarAtom } from "../../store/sideBarState";
import { icons, ui } from "../index";
import { Button } from "./Button";
// import { TwitterIcon, YoutubeIcon } from "../icons";
export function Sidebar() {
  const isModalOpen = useRecoilValue(addContentModalAtom);
  const [isSidebarOpen, setIsSideBarOpen] = useRecoilState(sidebarAtom);
  const isDesktop = useMediaQuery("(min-width:768px)");
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
      className={`lg:w-[20%] md:w-[30%] h-screen shadow border-r border-gray-200 p-2 md:flex flex-col justify-between ${
        isModalOpen.open ? "bg-slate-500 opacity-70 border-none" : "bg-white"
      } md:sticky top-0 md:left-0 fixed z-10 right-0 ${
        isSidebarOpen ? "flex" : "hidden"
      } `}
    >
      <div>
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
          <ui.SidebarItem text="Tweets" icon={<Twitter />} />
          <ui.SidebarItem text="Videos" icon={<VideoIcon />} />
          <ui.SidebarItem text="Youtube" icon={<SquarePlay />} />
          <ui.SidebarItem text="Images" icon={<ImageIcon />} />
          <ui.SidebarItem text="Documents" icon={<BookText />} />
          <ui.SidebarItem text="Articles" icon={<Newspaper />} />
          {/* <ui.SidebarItem text="Tags" icon={<icons.YoutubeIcon />} /> */}
        </div>
      </div>
      {!brain && <Button
        text="Log out"
        size="md"
        varient="primary"
        widthFull={true}
        classes="mt-10"
        onClick={logout}
      />}
    </div>
  );
}
