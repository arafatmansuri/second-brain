import { useSetRecoilState } from "recoil";
import { sidebarAtom } from "../../store/sideBarState";
import { Menu, type IconProps } from "../icons";
import { memo } from "react";

export const MenuButton = memo<IconProps>(({size}) => {
  const setIsModalOpen = useSetRecoilState(sidebarAtom);
  return (
    <button
      className="sm:hidden flex items-center cursor-pointer"
      onClick={() => setIsModalOpen((p) => !p)}
      title="menu"
    >
      <Menu size={size} />
    </button>
  );
});