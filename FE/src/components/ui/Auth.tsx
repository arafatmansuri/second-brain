import type React from "react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { useAuthMutation } from "../../queries/AuthQueries/queries";
import { popupAtom } from "../../store/loadingState";
import { icons, ui } from "../index";
interface authData {
  authName: "Signin" | "Signup";
}
export function Auth({ authName }: authData) {
  const usernameRef = useRef<React.InputHTMLAttributes<HTMLInputElement>>(
    <input type="text" />
  );
  const passwordRef = useRef<React.InputHTMLAttributes<HTMLInputElement>>(
    <input type="text" />
  );
  const navigate = useNavigate();
  const navigationUrl: string = authName == "Signin" ? "/dashboard" : "/signin";
  const creds: boolean = authName == "Signin" ? true : false;
  const authMutation = useAuthMutation();
  const setIsPopup = useSetRecoilState(popupAtom);
  async function onClick() {
    const username = usernameRef.current?.value?.toString();
    const password = passwordRef.current?.value?.toString();
    authMutation.mutate({
      username,
      password,
      endpoint: `${authName.toLowerCase()}`,
      credentials: creds,
    });
  }
  useEffect(() => {
    if (!authMutation.isLoading && authMutation.isSuccess) {
      setIsPopup({ popup: true, message: `${authName} successfull` });
      setTimeout(() => {
        setIsPopup({ popup: false, message: `` });
        navigate(navigationUrl);
      }, 1000);
    }
  }, [authMutation.isSuccess, authMutation.isLoading]);
  return (
    <div className="h-screen w-screen bg-gray-200 flex flex-col justify-center items-center">
      <div className="flex items-center gap-1 mb-5 fixed top-0 left-0 m-3">
        <icons.Brain /> <h1 className="font-bold text-xl">Second Brain</h1>
      </div>
      <div className="bg-white rounded border md:min-w-[28rem] min-w-72 flex items-center flex-col pb-4 pr-9 pl-9 pt-4 gap-5 border-gray-300 shadow">
        <h1 className="font-bold text-2xl text-purple-800">{authName}</h1>
        <div className="flex items-center flex-col gap-3 w-full">
          <ui.Input placeholder="Username" reference={usernameRef} />
          <ui.Input placeholder="Password" reference={passwordRef} />
          {authMutation.error ? (
            <ui.ErrorBox
              errorMessage={
                authMutation.error.response?.data?.message
                  ? authMutation.error.response.data.message
                  : authMutation.error.message
              }
            />
          ) : (
            ""
          )}
          <ui.Button
            varient="primary"
            text={authName}
            loading={authMutation.isLoading}
            size="lg"
            widthFull={true}
            onClick={onClick}
          />
          {authName == "Signin" ? (
            <p>
              Don't have an account?{" "}
              <a href="/signup" className="text-blue-400 hover:underline">
                create one
              </a>
            </p>
          ) : (
            <p>
              Having account?{" "}
              <a href="/signin" className="text-blue-400 hover:underline">
                signin
              </a>
            </p>
          )}
        </div>
      </div>
      <ui.Popup />
    </div>
  );
}
