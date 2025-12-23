import { Outlet } from "react-router-dom";
import { ui } from "../components";

export const SettingsLayout = () => {
  return (
    <div className="flex min-h-screen relative w-full">
      <ui.Sidebar type="settings" />
      <Outlet />
      <ui.DeleteAccountModal />
      <ui.Popup />
    </div>
  );
};
