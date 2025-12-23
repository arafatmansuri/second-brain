/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import { ui } from "../components";
import { usePostMutation } from "../queries/PostQueries/postQueries";
import { postAtom, type PostData } from "../store/postState";
interface SahredBrainData {
  username: string;
  content: PostData[] | ((currVal: PostData[]) => PostData[]);
}
function BrainDashboard() {
  //   const isDesktop: boolean = useMediaQuery("(min-width:768px)");
  const [postsData, setPostsData] = useRecoilState(postAtom);
  const getBrainMutation = usePostMutation<SahredBrainData>();
  const { brain } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    setSearchParams({ content: "All Notes" });
    if (brain) {
      getBrainMutation.mutate({
        method: "GET",
        endpoint: `display?share=${brain}`,
      });
    }
  }, []);
  useEffect(() => {
    if (brain && getBrainMutation.status == "success") {
      setPostsData(getBrainMutation.data.content);
    }
  }, [getBrainMutation.status, brain]);
  return (
    <div className={`sm:w-[80%] lg:w-[82%] w-full bg-gray-100`}>
      <div
        className={`bg-gray-100 p-3 w-full ${
          brain && !getBrainMutation.data ? "hidden" : "block"
        }`}
      >
        <div className="flex w-full justify-between">
          <h1
            className={`${
              brain ? "block" : "hidden"
            } font-bold md:text-2xl text-md md:mr-5 md:ml-6 text-purple-500`}
          >
            {`${brain && `${getBrainMutation.data?.username}'s Brain`}`}
          </h1>
          {brain && (
            <ui.Button
              size="md"
              text="Go to your Dashboard"
              varient="primary"
              onClick={() => {
                navigate("/");
              }}
            />
          )}
        </div>
        <div
          className={`flex justify-between items-center w-full mb-4 md:mr-5 md:pl-4 sticky top-0 p-3 bg-gray-100`}
        >
          <h1 className="font-bold md:text-xl">
            {searchParams.get("content")}
          </h1>
        </div>
        <section
          className={`flex lg:grid-cols-3 flex-col w-full flex-wrap items-center lg:pl-1 md:pl-4 sm:grid sm:grid-cols-2 gap-5`}
        >
          {postsData.filter((post) => {
            if (searchParams.get("content") == "All Notes") {
              return post;
            }
            return searchParams
              .get("content")
              ?.toLowerCase()
              .includes(post.type.toLowerCase());
          }).length > 0 ? (
            postsData
              .filter((post) => {
                if (searchParams.get("content") == "All Notes") {
                  return post;
                }
                return searchParams
                  .get("content")
                  ?.toLowerCase()
                  .includes(post.type.toLowerCase());
              })
              .map((post: PostData) => (
                <ui.Card
                  title={post.title}
                  link={post.link}
                  type={post.type}
                  tags={post.tags}
                  createdAt={post.createdAt}
                  key={post._id}
                  id={post._id}
                  isLoading={getBrainMutation.isPending}
                  description={post.description}
                  isProcessing={post.isProcessing}
                />
              ))
          ) : (
            <p>No contents</p>
          )}
        </section>
      </div>
      <div
        className={`bg-gray-100 md:w-[80%] w-full p-3 flex-col md:items-start items-center gap-2 ${
          brain && !getBrainMutation.data ? "flex" : "hidden"
        }`}
      >
        <h1 className="font-bold md:text-2xl text-md text-purple-500 mt-5 mb-5">
          {"No Brain found"}
        </h1>
        <ui.Button
          size="lg"
          text="Go to your Dashboard"
          varient="primary"
          onClick={() => {
            navigate("/");
          }}
          widthFull={false}
          classes={`font-semibold text-2xl`}
        />
      </div>
    </div>
  );
}

export default BrainDashboard;
