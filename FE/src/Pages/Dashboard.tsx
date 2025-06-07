import axios from "axios";
import { useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import PlusIcon from "../components/icons/PlusIcon";
import ShareIcon from "../components/icons/ShareIcon";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import CreateContentModal from "../components/ui/CreateContentModal";
import MenuButton from "../components/ui/MenuButton";
import Sidebar from "../components/ui/Sidebar";
import { BACKEND_URL } from "../config";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { addContentModalAtom } from "../store/AddContentModalState";
import { postAtom } from "../store/postState";
import { userAtom } from "../store/userState";
function Dashboard() {
  const [modalOpen, setModalOpen] = useRecoilState(addContentModalAtom);
  const isDesktop: boolean = useMediaQuery("(min-width:768px)");
  const [user, setUser] = useRecoilState(userAtom);
  const posts = useRecoilValue(postAtom);
  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/v1/user/getuser`, {
        withCredentials: true,
      })
      .then((data) => {
        setUser(data.data.user);
      });
  }, [setUser]);
  return (
    <div className="flex min-h-screen relative">
      <Sidebar />
      <div
        className={`bg-gray-100 md:w-[80%] p-3 w-full ${
          modalOpen && "bg-slate-500 opacity-40"
        }`}
      >
        <h1 className="md:block hidden font-bold md:text-2xl text-md md:mr-5 md:ml-6 text-purple-500">
          Welcome, {user?.username}{" "}
        </h1>
        <div className="flex justify-between items-center w-full mb-4 md:mr-5 md:pl-7 sticky top-0 bg-gray-100 p-3">
          <h1 className="font-bold md:text-xl">All Notes</h1>
          <div className="flex gap-2">
            <Button
              size="md"
              text="Share Brain"
              startIcon={<ShareIcon />}
              varient="secondary"
              textVisible={isDesktop}
              classes="hover:text-blue-800"
            />
            <Button
              size="md"
              text="Add Content"
              varient="primary"
              startIcon={<PlusIcon size={"md"} />}
              onClick={() => setModalOpen(true)}
              textVisible={isDesktop}
            />
            <MenuButton />
          </div>
        </div>
        <section className="flex md:flex-row flex-col w-full flex-wrap md:items-start gap-5 items-center md:pl-8">
          {posts?.map((post) => (
            <Card
              title={post.title}
              link={post.link}
              type={post.type}
              key={post._id}
              id={post._id}
            />
          ))}
        </section>
      </div>
      <CreateContentModal />
    </div>
  );
}

export default Dashboard;
