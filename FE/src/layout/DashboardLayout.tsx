import { Outlet } from "react-router-dom";
import { ui } from "../components";

export const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen relative w-full">
      <ui.Sidebar type="dashboard" />
      <Outlet />
      {/* <ui.CreateContentModal /> */}
      <ui.ShareContentMoal />
      {/* <ui.SearchBox /> */}
      <ui.Popup />
    </div>
  );
};
