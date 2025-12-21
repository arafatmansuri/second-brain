import { useEffect } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { useAuthMutation } from "../../queries/AuthQueries/queries";
import { popupAtom } from "../../store/loadingState";
import { ui } from "../index";

interface OTPBoxInputs {
  otp: number;
  password: string;
}

export function OTPPasswordBox() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OTPBoxInputs>();
  const navigate = useNavigate();
  const authMutation = useAuthMutation();
  const setIsPopup = useSetRecoilState(popupAtom);
  const onClick: SubmitHandler<OTPBoxInputs> = async (data) => {
    console.log("Reached1");
    if (!errors.otp && !errors.password) {
      console.log("Reached2");
      authMutation.mutate({
        otp: Number(data.otp),
        password: data.password,
        endpoint: "forgetverify",
        credentials: true,
      });
    }
  };
  useEffect(() => {
    if (!authMutation.isPending && authMutation.isSuccess) {
      setIsPopup({ popup: true, message: "password changed successfully" });
      setTimeout(() => {
        setIsPopup({ popup: false, message: `` });
        navigate("/signin");
        // navigate("/dashboard?content=All+Notes");
      }, 1000);
    }
  }, [authMutation.isSuccess, authMutation.isPending]);
  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center">
      <div className="rounded border md:min-w-[28rem] min-w-72 flex items-center flex-col pb-4 pr-9 pl-9 pt-4 gap-5 border-gray-300 shadow">
        <p className="self-start font-semibold w-full flex gap-1">
          OTP is sent to{" "}
          <span className="font-bold">{localStorage.getItem("mail")}</span>(
          <Link className="text-blue-500 underline" to={"/forgot-password"}>
            not you?
          </Link>
          )
        </p>
        <form
          onSubmit={handleSubmit(onClick)}
          className="flex items-center flex-col gap-3 w-full"
        >
          <ui.Input
            placeholder="OTP"
            formHook={{
              ...register("otp", { required: true }),
            }}
            defaultValue=""
            type="number"
          />
          {errors.otp?.type == "required" && (
            <span className="text-red-500 text-sm -mt-3 self-start">
              OTP is required
            </span>
          )}
          <ui.Input
            placeholder="Password"
            formHook={{
              ...register("password", { required: true, minLength: 8 }),
            }}
            defaultValue=""
            type="text"
          />
          {errors.password?.type == "required" && (
            <span className="text-red-500 text-sm -mt-3 self-start">
              Password is required
            </span>
          )}
          {errors.password?.type == "minLength" && (
            <span className="text-red-500 text-sm -mt-3 self-start">
              Password must be at least 8 characters
            </span>
          )}
          {authMutation.error && !errors.otp && !errors.password ? (
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
            text={"Change password"}
            loading={authMutation.isPending}
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
