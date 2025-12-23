import { useEffect } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { icons, ui } from "..";
import { usePostMutation } from "../../queries/PostQueries/postQueries";
import { addContentModalAtom } from "../../store/AddContentModalState";
import { isCopyAtom, popupAtom } from "../../store/loadingState";
import { postAtom } from "../../store/postState";
import { userAtom } from "../../store/userState";

export function ShareContentMoal() {
  const [isModalOpen, setIsModalOpen] = useRecoilState(addContentModalAtom);
  const setIsPopup = useSetRecoilState(popupAtom);
  const [isCopy, setIsCopy] = useRecoilState(isCopyAtom);
  const setUser = useSetRecoilState(userAtom);
  const posts = useRecoilValue(postAtom);
  const shareContentMutation = usePostMutation<{
    link: string;
    contentCount: number;
  }>();
  function ShareContent() {
    shareContentMutation.mutate({
      endpoint: "share?reqtype=copy",
      method: "PUT",
    });
  }
  useEffect(() => {
    if (shareContentMutation.status == "success") {
      setUser((prev) => ({ ...prev, shared: !prev.shared }));
      if (shareContentMutation.data?.link !== "" && !isCopy) {
        setIsPopup({ message: "Your Brain set to Public", popup: true });
        setIsCopy(true);
        const link = `https://www.secondbrain.services/dashboard/${shareContentMutation.data?.link}`;
        navigator.clipboard.writeText(link);
      }
      setTimeout(() => {
        setIsCopy(false);
        setIsPopup({ message: "", popup: false });
      }, 3000);
    }
  }, [shareContentMutation.status]);
  return (
    <div
      className={`${
        isModalOpen.open && isModalOpen.modal == "share" ? "flex" : "hidden"
      } w-screen h-screen
         fixed top-0 left-0 justify-center items-center p-5 z-10`}
    >
      <div className="bg-white p-4 shadow-md rounded-xl flex flex-col items-center gap-5 w-96">
        <div className="flex self-end w-full justify-between font-bold text-purple-800 text-lg">
          <h1>Share Your Second Brain</h1>
          <icons.CrossIcon
            size="sm"
            onClick={() => {
              setIsModalOpen({ open: false, modal: "share" });
            }}
            className="cursor-pointer"
          />
        </div>
        <p className="text-sm text-gray-500 w-[89%] self-start">
          Share your entire collection of notes, documents, tweets, and videos
          with others. They'll be able to your content into their own Second
          Brain.
        </p>
        <ui.Button
          onClick={ShareContent}
          varient="primary"
          text={isCopy ? "Copied" : "Share Brain"}
          size="md"
          textVisible={true}
          widthFull={true}
          startIcon={isCopy ? <icons.Copied /> : <icons.CopyIcon />}
          loading={shareContentMutation.isLoading}
        />
        <span className="text-sm text-center w-full text-gray-400">
          {posts.length} items will be shared
        </span>
      </div>
    </div>
  );
}
