import { SendHorizonal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { icons, ui } from "..";
import { usePostMutation } from "../../queries/PostQueries/postQueries";
import { addContentModalAtom } from "../../store/AddContentModalState";
import { postAtom } from "../../store/postState";

export function SearchBox() {
  //   const user = useUserQuery();
  const [answer, setAnswer] = useState<string>("");
  const questionRef = useRef<HTMLInputElement | null>(null);
  const [isModalOpen, setIsModalOpen] = useRecoilState(addContentModalAtom);
  const posts = useRecoilValue(postAtom);
  const askAIMutation = usePostMutation<string>();
  useEffect(() => {
    if (askAIMutation.status == "success") {
      console.log(askAIMutation.data);
      setAnswer(askAIMutation.data);
    }
  }, [askAIMutation?.data, askAIMutation.status]);
  async function askAi() {
    askAIMutation.mutate({
      endpoint: "askai",
      method: "POST",
      data: { query: questionRef.current?.value },
    });
  }
  return (
    <div
      className={`${
        isModalOpen.open && isModalOpen.modal == "search" ? "flex" : "hidden"
      } w-screen h-screen
         fixed top-0 left-0 justify-center items-center z-10`}
    >
      <div className="bg-white p-4 shadow-md rounded-xl flex flex-col items-center gap-5 w-[40rem]">
        <div className="flex self-end w-full justify-between font-bold text-purple-800 text-lg">
          <h1>Ask anything from your brain</h1>
          <button
            onClick={() => {
              setIsModalOpen({ open: false, modal: "search" });
              setAnswer("");
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
          <ui.Input
            type="text"
            placeholder="Write your query"
            reference={questionRef}
          />
          <ui.Button
            onClick={askAi}
            varient="primary"
            text={""}
            size="md"
            textVisible={false}
            startIcon={<SendHorizonal className="size-8" />}
            //   loading={shareContentMutation.isPending}
          />
        </div>
        <p className="w-full max-h-64 overflow-y-auto p-2">
          {askAIMutation.status != "idle" &&
          askAIMutation.status == "loading" ? (
            <icons.Loader />
          ) : (
            answer
          )}
          {askAIMutation.status == "error" && askAIMutation.error.message}
        </p>
      </div>
    </div>
  );
}
