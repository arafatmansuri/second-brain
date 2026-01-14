import { SendHorizonal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import { icons, ui } from "../components";
import { usePostMutation } from "../queries/PostQueries/postQueries";
import { postAtom, type PostData } from "../store/postState";
import { TypingText } from "../components/ui/TypingText";

export function AskAI() {
  const [answer, setAnswer] = useState<string>("");
  const [resultCompleted, setResultCompleted] = useState<boolean>(false);
  const questionRef = useRef<HTMLInputElement | null>(null);
  const [relevantPosts, setRelevantPosts] = useState<PostData[]>([]);
  const posts = useRecoilValue(postAtom);
  const askAIMutation = usePostMutation<{
    answer: string;
    content: PostData[];
  }>();
  useEffect(() => {
    if (askAIMutation.status == "success") {
      setAnswer(askAIMutation.data.answer);
      setRelevantPosts(askAIMutation.data.content);
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
      className={`flex flex-col w-full h-screen items-center p-5 gap-2 relative`}
    >
      <div className="flex self-end w-full justify-between font-bold text-purple-800 text-lg">
        <h1>Ask anything from your brain</h1>
        <ui.MenuButton size="sm" />
      </div>
      <span className="text-sm w-full text-gray-400">
        {posts.length} items will be used to search
      </span>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          askAi();
        }}
        className="flex w-full gap-3"
      >
        <ui.Input
          type="text"
          placeholder="Write your query"
          reference={questionRef}
        />
        <ui.Button
          //   onClick={askAi}
          varient="primary"
          text={""}
          size="md"
          type="submit"
          classes="px-5 py-5"
          textVisible={false}
          startIcon={<SendHorizonal className="size-5" />}
          //   loading={shareContentMutation.isPending}
        />
      </form>
      <div className="w-full flex-col overflow-y-auto p-2">
        <p className="w-full max-h-64 p-2">
        {askAIMutation.status == "error" && askAIMutation.error.message}
      </p>
      {askAIMutation.status != "idle" && askAIMutation.status == "loading" ? (
        <icons.Loader />
      ) : (
        <TypingText
          text={answer}
          speed={10}
          onComplete={() => setResultCompleted(true)}
        />
      )}
      {relevantPosts.length > 0 && resultCompleted && (
        <h2 className="self-start font-bold text-lg mt-2 mb-2">
          Relevant Contents:
        </h2>
      )}
      {relevantPosts.length > 0 && resultCompleted && (
        <div className="flex lg:grid-cols-3 flex-col w-full flex-wrap items-center lg:pl-1 md:pl-4 sm:grid sm:grid-cols-2 gap-5">
          {relevantPosts.map((post) => (
            <ui.Card
              key={post._id}
              link={post.link}
              id={post._id}
              title={post.title}
              type={post.type}
              description={post.description}
              createdAt={post.createdAt}
              tags={post.tags}
              isCardInModal={true}
            />
          ))}
        </div>
      )}</div>
    </div>
  );
}
