/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import { ui } from "../components";
import {
  useRefreshTokenMutation,
  useUserQuery,
} from "../queries/AuthQueries/queries";
import { usePostMutation } from "../queries/PostQueries/postQueries";
import { type PostData } from "../store/postState";
import { userAtom } from "../store/userState";
interface SahredBrainData {
  username: string;
  content: PostData[] | ((currVal: PostData[]) => PostData[]);
}
function Profile() {
  const userQuery = useUserQuery({ credentials: true });
  const [user, setUser] = useRecoilState(userAtom);
  const refreshTokenMutation = useRefreshTokenMutation();
  const privateContentMutation = usePostMutation();
  const getBrainMutation = usePostMutation<SahredBrainData>();
  const { brain } = useParams();
  const navigate = useNavigate();
  const hasTriedRefresh = useRef(false);
  useEffect(() => {
    if (userQuery.status == "error" && !hasTriedRefresh.current && !brain) {
      hasTriedRefresh.current = true;
      refreshTokenMutation.mutate(undefined, {
        onSuccess: () => {
          userQuery.refetch();
        },
        onError: () => navigate("/dashboard"),
      });
    }
  }, [userQuery.status]);

  useEffect(() => {
    if (userQuery.status == "success" && !brain) {
      setUser(userQuery.data);
    }
  }, [userQuery.status, brain]);

  useEffect(() => {
    if (privateContentMutation.status == "success" && !brain) {
      userQuery.refetch();
    }
  }, [privateContentMutation.status, brain]);
  return (
    <div className={`sm:w-[80%] lg:w-[82%] w-full`}>
      <div
        className={`p-3 w-full mb-5 ${
          brain && !getBrainMutation.data ? "hidden" : "block"
        }`}
      >
        <div className="flex justify-between items-center">
          <h1 className="font-bold md:text-3xl text-2xl text-purple-800">
            {user.username}
          </h1>
          <ui.MenuButton size="md" />
        </div>
        <div className="flex flex-col gap-2 w-full pt-5">
          <h1 className="font-semibold md:text-2xl text-xl">Update Profile</h1>
          <hr className="text-gray-500 mb-1" />
          <div className="flex flex-col gap-2 sm:w-[70%] lg:w-[50%] w-full">
            <label className="font-semibold">Username</label>
            <ui.Input
              placeholder="Username"
              // formHook={{ ...register("title", { minLength: 3 }) }}
              isWidthFull={true}
              defaultValue={user.username}
            />
            <label className="font-semibold">Email</label>
            <ui.Input
              placeholder="Email"
              // formHook={{ ...register("title", { minLength: 3 }) }}
              isWidthFull={true}
              defaultValue={user.email}
              isDisabled={true}
            />
            <ui.Button
              varient="green"
              text="Update Profile"
              size="md"
              textVisible={true}
              classes="w-36"
              // loading={addPostMutation.isPending}
              type="submit"
              isCenterText={true}
              widthFull={false}
            />
          </div>
        </div>
      </div>
      <div className="p-3 w-full">
        <h1 className="text-red-500 font-semibold md:text-2xl text-xl mb-1">
          Delete Account
        </h1>
        <hr className="text-gray-500 mb-1" />
        <span className="mb-3 text-gray-700 text-sm block">
          Once you delete your account, there is no going back. Please be
          certain.
        </span>
        <ui.Button
          varient="danger"
          text="Delete Account"
          size="md"
          textVisible={true}
          classes="w-36"
          // loading={addPostMutation.isPending}
          type="submit"
          isCenterText={true}
          widthFull={false}
        />
      </div>
    </div>
  );
}

export default Profile;
