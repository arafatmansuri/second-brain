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
function Profile() {
  const [modalOpen, setModalOpen] = useRecoilState(addContentModalAtom);
  const isDesktop: boolean = useMediaQuery("(min-width:768px)");
  const user = useUserQuery({ credentials: true });
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
  useEffect(() => {
    if (
      (user.status == "error" ) &&
      !hasTriedRefresh.current &&
      !brain
    ) {
      hasTriedRefresh.current = true;
      refreshTokenMutation.mutate(undefined, {
        onSuccess: () => {
          user.refetch();
        },
        onError: () => navigate("/dashboard"),
      });
    }
  }, [user.status]);

  useEffect(() => {
    if (user.status == "success" && !brain) {
      setUser(user.data);
    }
  }, [user.status, brain]);

  useEffect(() => {
    if (privateContentMutation.status == "success" && !brain) {
      user.refetch();
    }
  }, [privateContentMutation.status, brain]);
  return (
    <div
      className={`sm:w-[80%] lg:w-[82%] w-full bg-gray-100 `}
    >
      <div
        className={`bg-gray-100 p-3 w-full ${brain && !getBrainMutation.data ? "hidden" : "block"}`}
      >
        <div
          className={`flex justify-between items-center w-full mb-4 md:mr-5 md:pl-4 sticky top-0 p-3 bg-gray-100 ${
            modalOpen.open && "bg-slate-500"
          }`}
        >
          <h1 className="font-bold md:text-xl">
            Profile
          </h1>
            <ui.MenuButton size="md" />
        </div>
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

export default Profile;
