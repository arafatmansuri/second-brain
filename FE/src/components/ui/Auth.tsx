import { GoogleOAuthProvider } from "@react-oauth/google";
import { useEffect } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { useAuthMutation } from "../../queries/AuthQueries/queries";
import { popupAtom } from "../../store/loadingState";
import { ui } from "../index";
import GoogleLoginButton from "./GoogleLogin";
interface Inputs {
  username: string;
  password: string;
  email?: string;
}
interface Signup extends Inputs {
  email: string;
}
interface authData {
  authName: "Sign in" | "Sign up";
}
export function Auth({ authName }: authData) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs | Signup>();
  const navigate = useNavigate();
  const authMutation = useAuthMutation();
  const setIsPopup = useSetRecoilState(popupAtom);
  const onClick: SubmitHandler<Signup | Inputs> = async (data) => {
    if (!errors.password && !errors.username) {
      authMutation.mutate({
        username: data.username,
        password: data.password,
        email: data.email,
        endpoint: `${authName == "Sign in" ? "signin" : "signupotp"}`,
        credentials: true,
      });
    }
  };
  useEffect(() => {
    if (!authMutation.isPending && authMutation.isSuccess) {
      const message =
        authName == "Sign up" ? "OTP sent successfully" : "Signin sucessfull";
      setIsPopup({ popup: true, message: message });
      setTimeout(() => {
        setIsPopup({ popup: false, message: `` });
        localStorage.setItem("mail",authMutation.variables?.email || "")
        navigate(authName == "Sign in" ? "/dashboard" : "/verifyotp")
        // navigate("/dashboard?content=All+Notes");
      }, 1000);
    }
  }, [authMutation.isSuccess, authMutation.isPending]);
  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center">
      {/* <div className="flex items-center gap-1 mb-5 fixed top-0 left-0 m-3">
        <icons.Brain /> <h1 className="font-bold text-xl">Second Brain</h1>
      </div> */}
      <div className="bg-white rounded border md:min-w-[28rem] min-w-72 flex items-center flex-col pb-4 pr-9 pl-9 pt-4 gap-5 border-gray-300 shadow mt-8">
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
            <span className="text-red-500 text-sm -mt-3 self-start">
              Username is required
            </span>
          )}
          {errors.username?.type == "minLength" && (
            <span className="text-red-500 text-sm -mt-3 self-start">
              Username must be atleast of 3 chars
            </span>
          )}
          {authName == "Sign up" && (
            <div className="w-full">
              <ui.Input
                placeholder="Email"
                formHook={{
                  ...register("email", { required: true, minLength: 3 }),
                }}
                defaultValue=""
                type="email"
              />
              {errors.email?.type == "required" && (
                <span className="text-red-500 text-sm -mt-3 self-start">
                  Email is required
                </span>
              )}
            </div>
          )}
          <ui.Input
            type="password"
            placeholder="Password"
            formHook={{
              ...register("password", { required: true, minLength: 8 }),
            }}
            defaultValue=""
          />
          <div
            className={`flex ${
              errors.password ? "justify-between" : "justify-end"
            } w-full`}
          >
            {errors.password?.type == "required" && (
              <span className="text-red-500 text-sm -mt-2 self-start">
                Password is required
              </span>
            )}
            {errors.password?.type == "minLength" && (
              <span className="text-red-500 text-sm -mt-2 self-start">
                Password length can't be less than 8
              </span>
            )}
            {authName == "Sign in" && (
              <Link
                className="text-blue-500 self-end cursor-pointer hover:underline -mt-2"
                to={"/forgot-password"}
              >
                Forgot password?
              </Link>
            )}
          </div>
          {authMutation.error && !errors.password && !errors.username ? (
            <ui.ErrorBox
              errorMessage={
                authMutation.error.message
                  ? authMutation.error.message
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
          {authName == "Sign in" ? (
            <p>
              Don't have an account?{" "}
              <a href="/signup" className="text-blue-400 hover:underline">
                Create one
              </a>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <a href="/signin" className="text-blue-400 hover:underline">
                Sign in
              </a>
            </p>
          )}
        </form>
        <GoogleOAuthProvider clientId="671836512515-qml9ur04oo8rfu9rvs257i4uf2bka2eb.apps.googleusercontent.com">
          <GoogleLoginButton text={"Continue"} />
        </GoogleOAuthProvider>
      </div>
      <ui.Popup />
    </div>
  );
}
