/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import { icons, ui } from "../components";
import { Button } from "../components/ui";
import {
  useRefreshTokenMutation,
  useUserQuery,
} from "../queries/AuthQueries/queries";
import { usePostMutation } from "../queries/PostQueries/postQueries";
import { userAtom } from "../store/userState";

function SecurityPage() {
  const userQuery = useUserQuery({ credentials: true });
  const [user, setUser] = useRecoilState(userAtom);
  const refreshTokenMutation = useRefreshTokenMutation();
  const privateContentMutation = usePostMutation();
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
      <div className={`p-3 w-full mb-5`}>
        <div className="flex justify-end items-center">
          <ui.MenuButton size="md" />
        </div>
        <div className="flex flex-col gap-2 w-full pt-5">
          <h1 className="font-medium md:text-2xl text-xl">Sign in methods</h1>
          <div className="flex flex-col gap-2 sm:w-[70%] lg:w-[80%] w-full border rounded-md border-gray-300 border-b-0 mt-1">
            <div className="flex justify-between p-5 border-b border-gray-300 items-center">
              <div className="flex justify-center items-center gap-2">
                <icons.PasswordIcon />
                <div>
                  <h4 className="font-medium">Password</h4>
                  <p className="text-gray-600 text-sm">Configured</p>
                </div>
              </div>
              <Button
                size="sm"
                classes="font-medium"
                text="Change password"
                varient="secondary"
              />
            </div>
            <div className="flex justify-between p-5 border-b border-gray-300 items-center">
              <div className="flex justify-center items-center gap-2">
                <icons.GoogleIcon2 />
                <div>
                  <h4 className="font-medium">Google</h4>
                  <p className="text-gray-600 text-sm">
                    Sign in with your Google account
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                classes="font-medium"
                text="Connect"
                varient="secondary"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SecurityPage;
