import { useRecoilState, useRecoilValue } from "recoil";
import { icons, ui } from "..";
import { addContentModalAtom } from "../../store/AddContentModalState";
import { postAtom } from "../../store/postState";

export function SearchBox() {
  //   const user = useUserQuery();
  const [isModalOpen, setIsModalOpen] = useRecoilState(addContentModalAtom);
  const posts = useRecoilValue(postAtom);
  return (
    <div
      className={`${
        isModalOpen.open && isModalOpen.modal == "search" ? "flex" : "hidden"
      } w-screen h-screen
         fixed top-0 left-0 justify-center items-center`}
    >
      <div className="bg-white p-4 shadow-md rounded-xl flex flex-col items-center gap-5 w-[35rem]">
        <div className="flex self-end w-full justify-between font-bold text-purple-800 text-lg">
          <h1>Ask anything from your brain</h1>
          <button
            onClick={() => {
              setIsModalOpen({ open: false, modal: "search" });
            }}
            className="cursor-pointer"
          >
            <icons.CrossIcon size="sm" />
          </button>
        </div>
        <span className="text-sm w-full text-gray-400">
          {posts.length} items will be used to search
        </span>
        <div className="flex w-full gap-3">
          <ui.Input type="text" placeholder="Write your query" />
          <ui.Button
            //   onClick={ShareContent}
            varient="primary"
            text={""}
            size="md"
            textVisible={false}
            startIcon={<icons.Search size="sm" />}
            //   loading={shareContentMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
}
