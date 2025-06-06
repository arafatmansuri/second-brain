import { useState } from "react";
import PlusIcon from "../components/icons/PlusIcon";
import ShareIcon from "../components/icons/ShareIcon";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import CreateContentModal from "../components/ui/CreateContentModal";
import MenuButton from "../components/ui/MenuButton";
import Sidebar from "../components/ui/Sidebar";
function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div
        className={`bg-gray-100 md:w-[80%] p-5 w-full ${
          modalOpen && "bg-slate-500 opacity-40"
        }`}
      >
        <div className="flex justify-between items-center w-full mb-8 md:pr-5 md:pl-5">
          <h1 className="font-bold text-xl">All Notes</h1>
          <div className="flex gap-2">
            <Button
              size="md"
              text="Share Brain"
              startIcon={<ShareIcon />}
              varient="secondary"
            />
            <Button
              size="md"
              text="Add Content"
              varient="primary"
              startIcon={<PlusIcon size={"md"} />}
              onClick={() => setModalOpen(true)}
            />
            <MenuButton />
          </div>
        </div>
        <section className="flex gap-y-5 md:flex-row flex-col w-full flex-wrap md:items-start gap-5 justify-center items-center">
          <Card
            title="Project Idea"
            link="https://www.youtube.com/watch?v=0KlnSdvsojc"
            type="youtube"
          />
          <Card
            title="VS tweet"
            link="https://x.com/e_opore/status/1930378577431933064"
            type="tweet"
          />
          <Card
            title="VS tweet"
            link="https://x.com/e_opore/status/1930378577431933064"
            type="tweet"
          />
        </section>
      </div>
      <CreateContentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

export default Dashboard;
