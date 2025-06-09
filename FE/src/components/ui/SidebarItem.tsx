import { type ReactElement } from "react";

export function SidebarItem({
  text,
  icon,
}: {
  text: string;
  icon: ReactElement;
}) {
  return (
    <div className="flex h-11 items-center gap-3 p-5 hover:bg-purple-200 rounded-xs transition-all cursor-pointer">
      {icon} <span>{text}</span>
    </div>
  );
}
