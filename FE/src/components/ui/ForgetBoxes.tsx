import { memo, useEffect } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { useAuthMutation } from "../../queries/AuthQueries/queries";
import { popupAtom } from "../../store/loadingState";
import { ui } from "../index";
interface EmailBoxInputs {
  email: string;
}

export const EmailBox = memo(() => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailBoxInputs>();
  const navigate = useNavigate();
  const authMutation = useAuthMutation();
  const setIsPopup = useSetRecoilState(popupAtom);
  const onClick: SubmitHandler<EmailBoxInputs> = async (data) => {
    if (!errors.email) {
      authMutation.mutate({
        email: data.email,
        endpoint: "forgetotp",
        credentials: true,
      });
    }
  };
  useEffect(() => {
    if (!authMutation.isPending && authMutation.isSuccess) {
      setIsPopup({ popup: true, message: "OTP sent successfully" });
      setTimeout(() => {
        setIsPopup({ popup: false, message: `` });
        localStorage.setItem("mail", authMutation.variables?.email || "");
        navigate("/forgot-password/verify");
        // navigate("/dashboard?content=All+Notes");
      }, 1000);
    }
  }, [authMutation.isSuccess, authMutation.isPending]);
  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center">
      {/* <div className="flex items-center gap-1 mb-5 fixed top-0 left-0 m-3">
        <icons.Brain /> <h1 className="font-bold text-xl">Second Brain</h1>
        </div> */}
      <div className="rounded border md:min-w-[28rem] min-w-72 flex items-center flex-col pb-4 pr-9 pl-9 pt-4 gap-5 border-gray-300 shadow">
        <h1 className="font-bold text-2xl text-purple-800">Forgot password</h1>
        <form
          onSubmit={handleSubmit(onClick)}
          className="flex items-center flex-col gap-3 w-full"
        >
          <ui.Input
            placeholder="Email"
            formHook={{
              ...register("email", { required: true, minLength: 3 }),
            }}
            defaultValue=""
            type="email"
          />
          {errors.email?.type == "required" && (
            <span className="text-red-500 text-sm -mt-3">
              Email is required
            </span>
          )}
          {authMutation.error && !errors.email ? (
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
            text={"Send OTP"}
            loading={authMutation.isPending}
            size="lg"
            widthFull={true}
          />
          <p>
            <a href="/signin" className="text-blue-400 hover:underline">
              Back to login
            </a>
          </p>
        </form>
      </div>
      <ui.Popup />
    </div>
  );
});
