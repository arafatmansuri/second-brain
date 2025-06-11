import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRecoilState, useSetRecoilState } from "recoil";
import { icons, ui } from "../components";
import { useMediaQuery } from "../hooks/useMediaQuery";
import {
  useRefreshTokenMutation,
  useUserQuery,
} from "../queries/AuthQueries/queries";
import { useGetPosts } from "../queries/PostQueries/postQueries";
import { addContentModalAtom } from "../store/AddContentModalState";
import { postAtom, type PostData } from "../store/postState";
import { userAtom } from "../store/userState";

function Dashboard() {
  const [modalOpen, setModalOpen] = useRecoilState(addContentModalAtom);
  const isDesktop: boolean = useMediaQuery("(min-width:768px)");
  const user = useUserQuery();
  const posts = useGetPosts();
  const [postsData, setPostsData] = useRecoilState(postAtom);
  const setUser = useSetRecoilState(userAtom);
  const refreshTokenMutation = useRefreshTokenMutation();
  const navigate = useNavigate();
  const hasTriedRefresh = useRef(false);
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    searchParams.set("content", "All Notes");
    setSearchParams(searchParams);
  }, []);
  useEffect(() => {
    if (
      (user.status == "error" || posts?.error?.response?.status == 401) &&
      !hasTriedRefresh.current
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
  }, [
    navigate,
    posts,
    posts?.error?.response?.status,
    refreshTokenMutation,
    user,
    user.status,
  ]);

  useEffect(() => {
    if (user.status == "success") {
      setUser(user.data);
    }
  }, [user.status, user.data, setUser]);

  useEffect(() => {
    if (posts.status == "success") {
      setPostsData(posts.data);
    }
  }, [posts.data, posts.status, postsData, setPostsData]);

  return (
    <div className="flex min-h-screen relative">
      <ui.Sidebar />
      <div
        className={`bg-gray-100 md:w-[80%] p-3 w-full ${
          modalOpen && "bg-slate-500 opacity-40"
        }`}
      >
        <h1 className="md:block hidden font-bold md:text-2xl text-md md:mr-5 md:ml-6 text-purple-500">
          Welcome, {user.data?.username}{" "}
        </h1>
        <div className="flex justify-between items-center w-full mb-4 md:mr-5 md:pl-7 sticky top-0 bg-gray-100 p-3">
          <h1 className="font-bold md:text-xl">{searchParams.get("content")}</h1>
          <div className="flex gap-2">
            <ui.Button
              size="md"
              text="Share Brain"
              startIcon={<icons.ShareIcon />}
              varient="secondary"
              textVisible={isDesktop}
              classes="hover:text-blue-800"
            />
            <ui.Button
              size="md"
              text="Add Content"
              varient="primary"
              startIcon={<icons.PlusIcon size={"md"} />}
              onClick={() => setModalOpen(true)}
              textVisible={isDesktop}
            />
            <ui.MenuButton size="md" />
          </div>
        </div>
        <section className="flex md:flex-row flex-col w-full flex-wrap md:items-start gap-5 items-center md:pl-8">
          {postsData.length > 0 ? (
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
                />
              ))
          ) : (
            <p>No contents</p>
          )}
        </section>
      </div>
      <ui.CreateContentModal />
      <ui.Popup />
    </div>
  );
}

export default Dashboard;
