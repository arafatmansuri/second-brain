import { useEffect } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { useAuthMutation } from "../../queries/AuthQueries/queries";
import { popupAtom } from "../../store/loadingState";
import { icons, ui } from "../index";
type Inputs = {
  username: string;
  password: string;
};
interface authData {
  authName: "Signin" | "Signup";
}
export function Auth({ authName }: authData) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();
  const navigate = useNavigate();
  const navigationUrl: string = authName == "Signin" ? "/dashboard" : "/signin";
  const creds: boolean = authName == "Signin" ? true : false;
  const authMutation = useAuthMutation();
  const setIsPopup = useSetRecoilState(popupAtom);
  const onClick: SubmitHandler<Inputs> = async (data) => {
    if (!errors.password && !errors.username) {
      authMutation.mutate({
        username: data.username,
        password: data.password,
        endpoint: `${authName.toLowerCase()}`,
        credentials: creds,
      });
    }
  };
  useEffect(() => {
    if (!authMutation.isPending && authMutation.isSuccess) {
      setIsPopup({ popup: true, message: `${authName} successfull` });
      setTimeout(() => {
        setIsPopup({ popup: false, message: `` });
        navigate(navigationUrl);
      }, 1000);
    }
  }, [authMutation.isSuccess, authMutation.isPending]);
  return (
    <div className="h-screen w-screen bg-gray-200 flex flex-col justify-center items-center">
      <div className="flex items-center gap-1 mb-5 fixed top-0 left-0 m-3">
        <icons.Brain /> <h1 className="font-bold text-xl">Second Brain</h1>
      </div>
      <div className="bg-white rounded border md:min-w-[28rem] min-w-72 flex items-center flex-col pb-4 pr-9 pl-9 pt-4 gap-5 border-gray-300 shadow">
        <h1 className="font-bold text-2xl text-purple-800">{authName}</h1>
        <form
          onSubmit={handleSubmit(onClick)}
          className="flex items-center flex-col gap-3 w-full"
        >
          <ui.Input
            placeholder="Username"
            formHook={{
              ...register("username", { required: true, minLength: 3 }),
            }}
            defaultValue=""
          />
          {errors.username?.type == "required" && (
            <span className="text-red-500 text-sm -mt-3">
              Username is required
            </span>
          )}
          {errors.username?.type == "minLength" && (
            <span className="text-red-500 text-sm -mt-3">
              Username must be atleast of 3 chars
            </span>
          )}
          <ui.Input
            type="password"
            placeholder="Password"
            formHook={{
              ...register("password", { required: true, minLength: 8 }),
            }}
            defaultValue=""
          />
          {errors.password?.type == "required" && (
            <span className="text-red-500 text-sm -mt-3">
              Password is required
            </span>
          )}
          {errors.password?.type == "minLength" && (
            <span className="text-red-500 text-sm -mt-3">
              Password length can't be less than 8
            </span>
          )}
          {authMutation.error && !errors.password && !errors.username ? (
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
            type="submit"
            varient="primary"
            text={authName}
            loading={authMutation.isLoading}
            size="lg"
            widthFull={true}
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
              Already have an account?{" "}
              <a href="/signin" className="text-blue-400 hover:underline">
                signin
              </a>
            </p>
          )}
        </form>
      </div>
      <ui.Popup />
    </div>
  );
}
