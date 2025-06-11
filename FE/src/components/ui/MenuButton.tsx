import { useSetRecoilState } from "recoil";
import { sidebarAtom } from "../../store/sideBarState";
import { Menu, type IconProps } from "../icons";

export function MenuButton({size}:IconProps) {
  const setIsModalOpen = useSetRecoilState(sidebarAtom);
  return (
    <button
      className="md:hidden flex items-center cursor-pointer"
      onClick={() => setIsModalOpen((p) => !p)}
    >
      <Menu size={size} />
    </button>
  );
}
