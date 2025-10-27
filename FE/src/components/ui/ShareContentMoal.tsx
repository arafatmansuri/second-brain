import { useEffect } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { icons, ui } from "..";
import { useUserQuery } from "../../queries/AuthQueries/queries";
import { usePostMutation } from "../../queries/PostQueries/postQueries";
import { addContentModalAtom } from "../../store/AddContentModalState";
import { isCopyAtom, popupAtom } from "../../store/loadingState";
import { postAtom } from "../../store/postState";

export function ShareContentMoal() {
  const user = useUserQuery({ credentials: true });
  const [isModalOpen, setIsModalOpen] = useRecoilState(addContentModalAtom);
  const setIsPopup = useSetRecoilState(popupAtom);
  const [isCopy, setIsCopy] = useRecoilState(isCopyAtom);
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
      user.refetch();
      if (shareContentMutation.data?.link !== "" && !isCopy) {
        setIsPopup({ message: "Your Brain set to Public", popup: true });
        setIsCopy(true);
        const link = `https://www.secondbrain.services//dashboard/${shareContentMutation.data?.link}`;
        navigator.clipboard.writeText(link);
      }
      setTimeout(() => {
        setIsCopy(false);
        setIsPopup({ message: "", popup: false });
      }, 3000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shareContentMutation.status]);
  return (
    <div
      className={`${
        isModalOpen.open && isModalOpen.modal == "share" ? "flex" : "hidden"
      } w-screen h-screen
         fixed top-0 left-0 justify-center items-center`}
    >
      <div className="bg-white p-4 shadow-md rounded-xl flex flex-col items-center gap-5 w-96">
        <div
          className="flex self-end cursor-pointer w-full justify-between font-bold text-purple-800 text-lg"
          onClick={() => {
            setIsModalOpen({ open: false, modal: "share" });
          }}
        >
          <h1>Share Your Second Brain</h1>
          <icons.CrossIcon size="sm" />
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
