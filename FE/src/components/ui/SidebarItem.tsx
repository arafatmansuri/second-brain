import { type ReactElement } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

export function SidebarItem({
  text,
  icon,
  isSettingsTab=false,
}: {
  text: string;
  icon: ReactElement;
  isSettingsTab?: boolean;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  function setParams() {
    const url = new URL(window.location.href);
    if (url.pathname != "/dashboard") {
      navigate(`/dashboard?content=${text}`);
    }else{
    searchParams.set("content", text);
    setSearchParams(searchParams);
    }
  }
  const navigate = useNavigate();
  const location = useLocation();
  function setLocation() {
    navigate(`/settings/${text.toLowerCase()}`);
  }

  return (
    <div
      className={`flex w-full h-8 items-center gap-2.5 p-2 rounded-xs transition-all cursor-pointer ${
        searchParams.get("content") == text
          ? "bg-purple-300"
          : "hover:bg-purple-200"
      } ${
        location.pathname.includes(`/settings/${text.toLowerCase()}`) && isSettingsTab
          ? "bg-purple-300"
          : "hover:bg-purple-200"
      }`}
      onClick={!isSettingsTab ? setParams : setLocation}
    >
      {icon} <span>{text}</span>
    </div>
  );
}
