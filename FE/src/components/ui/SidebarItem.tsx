import { type ReactElement } from "react";
import { useSearchParams } from "react-router-dom";

export function SidebarItem({
  text,
  icon,
}: {
  text: string;
  icon: ReactElement;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  function setParams() {
    searchParams.set("content", text);
    setSearchParams(searchParams);
  }
  return (
    <div
      className={`flex h-11 items-center gap-3 p-5 rounded-xs transition-all cursor-pointer ${
        searchParams.get("content") == text
          ? "bg-purple-300"
          : "hover:bg-purple-200"
      }`}
      onClick={setParams}
    >
      {icon} <span>{text}</span>
    </div>
  );
}
