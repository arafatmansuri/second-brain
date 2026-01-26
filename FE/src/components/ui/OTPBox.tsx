import { memo, useEffect, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { useAuthMutation } from "../../queries/AuthQueries/queries";
import { countMinutesSeconds } from "../../services/countMinutes";
import { popupAtom } from "../../store/loadingState";
import { ui } from "../index";
interface Inputs {
  otp: string;
}

export const  OTPBox = memo(() => {
  const [resnendActive, setIsResendActive] = useState(
    localStorage.getItem("signupisResendActive") === "true" ? true : false
  );
  const [timer, setTimer] = useState(
    localStorage.getItem("signuptimer")
      ? parseInt(localStorage.getItem("signuptimer") || "120")
      : 120
  );
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
  const sendOTP = async () => {
    authMutation.mutate({
      endpoint: "resendotp",
      credentials: true,
    });
  };
  useEffect(() => {
    localStorage.setItem("signupisResendActive", "false");
    localStorage.setItem("signuptimer", "120");
  }, []);
  useEffect(() => {
    localStorage.setItem("signupisResendActive", "" + resnendActive);
    localStorage.setItem("signuptimer", "" + timer);
    let interval: NodeJS.Timeout;
    if (!resnendActive) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      if (timer === 0) {
        setIsResendActive(true);
        setTimer(120);
      }
    }
    return () => clearInterval(interval);
  }, [timer, resnendActive]);
  useEffect(() => {
    if (
      !authMutation.isPending &&
      authMutation.isSuccess &&
      authMutation.variables?.endpoint === "signupverify"
    ) {
      setIsPopup({ popup: true, message: "Signup successfull" });
      setTimeout(() => {
        setIsResendActive(false);
        localStorage.setItem("signupisResendActive", "false");
        setTimer(120);
        localStorage.setItem("signuptimer", "120");
        setIsPopup({ popup: false, message: `` });
        navigate("/dashboard");
        // navigate("/dashboard?content=All+Notes");
      }, 1000);
    }
    if (
      !authMutation.isPending &&
      authMutation.isSuccess &&
      authMutation.variables?.endpoint === "resendotp"
    ) {
      setIsPopup({ popup: true, message: "OTP resent successfully" });
      setTimeout(() => {
        setIsResendActive(false);
        localStorage.setItem("signupisResendActive", "false");
        setIsPopup({ popup: false, message: `` });
      }, 1000);
    }
  }, [authMutation.isSuccess, authMutation.isPending]);
  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center">
      {/* <div className="flex items-center gap-1 mb-5 fixed top-0 left-0 m-3">
        <icons.Brain /> <h1 className="font-bold text-xl">Second Brain</h1>
        </div> */}
      <div className="rounded border md:min-w-[28rem] min-w-72 flex items-center flex-col pb-4 pr-9 pl-9 pt-4 gap-5 border-gray-200 shadow">
        <p className="self-start font-semibold w-full flex gap-1">
          OTP is sent to{" "}
          <span className="font-bold">{localStorage.getItem("mail")}</span>(
          <Link
            className="text-blue-500 underline"
            to={"/signup"}
            onClick={() => {
              setTimer(120);
              localStorage.setItem("signuptimer", "120");
              setIsResendActive(false);
              localStorage.setItem("signupisResendActive", "false");
            }}
          >
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
              ...register("otp", { required: true }),
            }}
            // defaultValue=""
            type="text"
          />
          {errors.otp && errors.otp.type == "required" && (
            <span className="text-red-500 text-sm -mt-3 self-start">OTP is required</span>
          )}
          {authMutation.error ? (
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
            text={"Sign Up"}
            loading={authMutation.isPending}
            size="lg"
            widthFull={true}
          />
          <p>
            {resnendActive ? "didn't recieved an OTP?" : "resend OTP in"}{" "}
            <button type="button">
              {resnendActive && (
                <span
                  onClick={() => {
                    sendOTP();
                  }}
                  className="text-blue-400 hover:underline"
                >
                  Resend
                </span>
              )}
              {!resnendActive && (
                <span className="text-black">{countMinutesSeconds(timer)}</span>
              )}
            </button>
          </p>
        </form>
      </div>
      <ui.Popup />
    </div>
  );
});