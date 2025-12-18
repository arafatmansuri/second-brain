import { useEffect } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { useAuthMutation } from "../../queries/AuthQueries/queries";
import { popupAtom } from "../../store/loadingState";
import { ui } from "../index";
interface Inputs {
  otp: number;
}
// interface authData {
//   authName: "Sign in" | "Sign up";
// }
export function OTPBox() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();
  const navigate = useNavigate();
  const authMutation = useAuthMutation();
  const setIsPopup = useSetRecoilState(popupAtom);
  const onClick: SubmitHandler<Inputs> = async (data) => {
    if (!errors.otp) {
      authMutation.mutate({
        otp: data.otp,
        endpoint: "signupverify",
        credentials: true,
      });
    }
  };
  useEffect(() => {
    if (!authMutation.isPending && authMutation.isSuccess) {
      setIsPopup({ popup: true, message: "Signup successfull" });
      setTimeout(() => {
        setIsPopup({ popup: false, message: `` });
        navigate("/dashboard");
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
        <p className="self-start font-semibold w-full flex gap-1">
          OTP is sent to{" "}
          <h3 className="font-bold">{localStorage.getItem("mail")}</h3>(
          <Link className="text-blue-500 underline" to={"/signup"}>
            not you?
          </Link>
          )
        </p>
        {/* <h1 className="font-bold text-2xl text-purple-800">{"Verify"}</h1> */}
        <form
          onSubmit={handleSubmit(onClick)}
          className="flex items-center flex-col gap-3 w-full"
        >
          <ui.Input
            placeholder="OTP"
            formHook={{
              ...register("otp", { required: true, minLength: 3 }),
            }}
            defaultValue=""
            type="number"
          />
          {errors.otp?.type == "required" && (
            <span className="text-red-500 text-sm -mt-3">
              Username is required
            </span>
          )}
          {authMutation.error && !errors.otp ? (
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
            text={"Verify"}
            loading={authMutation.isLoading}
            size="lg"
            widthFull={true}
          />
          <p>
            didn't recieved an OTP?{" "}
            <a href="/signup" className="text-blue-400 hover:underline">
              Resend
            </a>
          </p>
        </form>
      </div>
      <ui.Popup />
    </div>
  );
}
