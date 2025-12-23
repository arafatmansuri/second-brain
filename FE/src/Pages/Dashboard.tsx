/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRecoilState, useSetRecoilState } from "recoil";
import { icons, ui } from "../components";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useRefreshTokenMutation } from "../queries/AuthQueries/queries";
import {
  useGetPosts,
  usePostMutation,
} from "../queries/PostQueries/postQueries";
import { addContentModalAtom } from "../store/AddContentModalState";
import { popupAtom } from "../store/loadingState";
import { postAtom, type PostData } from "../store/postState";
import { userAtom } from "../store/userState";

function Dashboard() {
  const [modalOpen, setModalOpen] = useRecoilState(addContentModalAtom);
  const isDesktop: boolean = useMediaQuery("(min-width:768px)");
  const [user, setUser] = useRecoilState(userAtom);
  const posts = useGetPosts();
  const [postsData, setPostsData] = useRecoilState(postAtom);
  const refreshTokenMutation = useRefreshTokenMutation();
  const privateContentMutation = usePostMutation();
  const setIsPopup = useSetRecoilState(popupAtom);
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
    setSearchParams({ content: "All Notes" });
  }, []);
  useEffect(() => {
    if (posts?.error?.status == 401 && !hasTriedRefresh.current) {
      hasTriedRefresh.current = true;
      refreshTokenMutation.mutate(undefined, {
        onSuccess: () => {
          // user.refetch();
          posts.refetch();
        },
        onError: () => navigate("/signin"),
      });
    }
  }, [posts?.error?.status]);

  useEffect(() => {
    if (posts.status == "success") {
      setPostsData(posts.data);
    }
  }, [posts.data, posts.status, setPostsData]);

  useEffect(() => {
    if (privateContentMutation.status == "success") {
      setUser((prev) => ({ ...prev, shared: !prev.shared }));
    }
  }, [privateContentMutation.status]);
  return (
    <div
      className={`sm:w-[80%] lg:w-[82%] w-full bg-gray-100 ${
        modalOpen.open && "bg-slate-500 opacity-70"
      }`}
    >
      <div
        className={`bg-gray-100 p-3 w-full ${
          modalOpen.open && "bg-slate-500 opacity-70"
        }`}
      >
        <div
          className={`flex justify-between items-center w-full mb-4 md:mr-5 md:pl-4 sticky top-0 p-3 bg-gray-100 ${
            modalOpen.open && "bg-slate-500"
          }`}
        >
          <h1 className="font-bold md:text-xl">
            {searchParams.get("content")}
          </h1>
          <div className={`flex gap-2`}>
            <ui.Button
              size="md"
              text="Private Brain"
              varient="secondary"
              textVisible={isDesktop}
              classes={`hover:text-blue-800 ${user.shared ? "flex" : "hidden"}`}
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
              onClick={() => navigate("/add-content")}
              textVisible={isDesktop}
            />
            <ui.MenuButton size="md" />
          </div>
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
                  isLoading={posts.isFetching}
                  description={post.description}
                  isProcessing={post.isProcessing}
                />
              ))
          ) : (
            <p>No contents</p>
          )}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
