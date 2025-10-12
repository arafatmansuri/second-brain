/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useRecoilState, useSetRecoilState } from "recoil";
import { icons, ui } from "../components";
import { useMediaQuery } from "../hooks/useMediaQuery";
import {
  useRefreshTokenMutation,
  useUserQuery,
} from "../queries/AuthQueries/queries";
import {
  useGetPosts,
  usePostMutation,
} from "../queries/PostQueries/postQueries";
import { addContentModalAtom } from "../store/AddContentModalState";
import { popupAtom } from "../store/loadingState";
import { postAtom, type PostData } from "../store/postState";
import { userAtom } from "../store/userState";
interface SahredBrainData {
  username: string;
  content: PostData[] | ((currVal: PostData[]) => PostData[]);
}
function Dashboard() {
  const [modalOpen, setModalOpen] = useRecoilState(addContentModalAtom);
  const isDesktop: boolean = useMediaQuery("(min-width:768px)");
  const user = useUserQuery({ credentials: true });
  const posts = useGetPosts();
  const [postsData, setPostsData] = useRecoilState(postAtom);
  const setUser = useSetRecoilState(userAtom);
  const refreshTokenMutation = useRefreshTokenMutation();
  const privateContentMutation = usePostMutation();
  const getBrainMutation = usePostMutation<SahredBrainData>();
  const setIsPopup = useSetRecoilState(popupAtom);
  const { brain } = useParams();
  function PrivateContent() {
    privateContentMutation.mutate({
      endpoint: "share?reqtype=private",
      method: "PUT",
    });
    setIsPopup({ popup: true, message: "Your Brain set to Private" });
    setTimeout(() => {
      setIsPopup({ popup: false, message: "" });
    }, 3000);
  }
  const navigate = useNavigate();
  const hasTriedRefresh = useRef(false);
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    searchParams.set("content", "All Notes");
    setSearchParams(searchParams);
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
      console.log(getBrainMutation.data.content);
    }
  }, [getBrainMutation.status]);
  useEffect(() => {
    if (
      (user.status == "error" || posts?.error?.status == 401) &&
      !hasTriedRefresh.current &&
      !brain
    ) {
      hasTriedRefresh.current = true;
      refreshTokenMutation.mutate(undefined, {
        onSuccess: () => {
          user.refetch();
          posts.refetch();
        },
        onError: () => navigate("/signin"),
      });
    }
  }, [posts?.error?.status, user.status]);

  useEffect(() => {
    if (user.status == "success" && !brain) {
      setUser(user.data);
    }
  }, [user.status, brain]);

  useEffect(() => {
    if (posts.status == "success" && !brain) {
      setPostsData(posts.data);
    }
  }, [posts.data, posts.status, setPostsData, brain]);

  useEffect(() => {
    if (privateContentMutation.status == "success" && !brain) {
      user.refetch();
    }
  }, [privateContentMutation.status, brain]);
  return (
    <div className="flex min-h-screen relative">
      <ui.Sidebar />
      <div
        className={`bg-gray-100 md:w-[80%] p-3 w-full ${
          modalOpen.open && "bg-slate-500 opacity-70"
        } ${brain && !getBrainMutation.data ? "hidden" : "block"}`}
      >
        <div className="flex w-full justify-between">
          <h1 className="md:block hidden font-bold md:text-2xl text-md md:mr-5 md:ml-6 text-purple-500">
            {`${
              brain
                ? `${getBrainMutation.data?.username}'s Brain`
                : `Welcome, ${user.data?.username}`
            }`}
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
          className={`flex justify-between items-center w-full mb-4 md:mr-5 md:pl-7 sticky top-0 p-3 bg-gray-100 ${
            modalOpen.open && "bg-slate-500"
          }`}
        >
          <h1 className="font-bold md:text-xl">
            {searchParams.get("content")}
          </h1>
          <div className={`${brain ? "hidden" : "flex"} gap-2`}>
            <ui.Button
              size="md"
              text="Private Brain"
              varient="secondary"
              textVisible={isDesktop}
              classes={`hover:text-blue-800 ${
                user.data?.shared ? "flex" : "hidden"
              }`}
              onClick={PrivateContent}
              startIcon={<icons.Lock />}
            />
            <ui.Button
              size="md"
              text={"Ask AI"}
              startIcon={<icons.AI size={"sm"} />}
              varient="primary"
              textVisible={isDesktop}
              onClick={() => {
                setModalOpen({ open: true, modal: "search" });
              }}
            />
            <ui.Button
              size="md"
              text={"Share Brain"}
              startIcon={<icons.ShareIcon />}
              varient="secondary"
              textVisible={isDesktop}
              classes="hover:text-blue-800"
              onClick={() => {
                setModalOpen({ open: true, modal: "share" });
              }}
            />
            <ui.Button
              size="md"
              text="Add Content"
              varient="primary"
              startIcon={<icons.PlusIcon size={"md"} />}
              onClick={() => setModalOpen({ open: true, modal: "create" })}
              textVisible={isDesktop}
            />
            <ui.MenuButton size="md" />
          </div>
        </div>
        <section
          className={`flex md:flex-row flex-col w-full flex-wrap md:items-start gap-5 items-center md:pl-5`}
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
                  isLoading={posts.isFetching}
                  description={post.description}
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
      <ui.CreateContentModal />
      <ui.ShareContentMoal />
      <ui.SearchBox />
      <ui.Popup />
    </div>
  );
}

export default Dashboard;
