import { memo, useEffect, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { useAuthMutation } from "../../queries/AuthQueries/queries";
import { countMinutesSeconds } from "../../services/countMinutes";
import { popupAtom } from "../../store/loadingState";
import { ui } from "../index";

interface OTPBoxInputs {
  otp: string;
  password: string;
}

export const OTPPasswordBox = memo(() => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OTPBoxInputs>();
  const [resnendActive, setIsResendActive] = useState(
    localStorage.getItem("forgetIsResendActive") === "true" ? true : false
  );
  const [timer, setTimer] = useState(
    localStorage.getItem("forgetTimer")
      ? parseInt(localStorage.getItem("forgetTimer") || "120")
      : 120
  );
  const navigate = useNavigate();
  const authMutation = useAuthMutation();
  const setIsPopup = useSetRecoilState(popupAtom);
  const onClick: SubmitHandler<OTPBoxInputs> = async (data) => {
    if (!errors.otp && !errors.password) {
      authMutation.mutate({
        otp: data.otp,
        password: data.password,
        endpoint: "forgetverify",
        credentials: true,
      });
    }
  };
  useEffect(() => {
    if (
      !authMutation.isPending &&
      authMutation.isSuccess &&
      authMutation.variables?.endpoint == "forgetverify"
    ) {
      setIsPopup({ popup: true, message: "Password changed successfully" });
      setTimeout(() => {
        setTimer(120);
        localStorage.setItem("forgetTimer", "120");
        setIsResendActive(false);
        localStorage.setItem("forgetIsResendActive", "false");
        setIsPopup({ popup: false, message: `` });
        navigate("/signin");
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
        localStorage.setItem("forgetIsResendActive", "false");
        setIsPopup({ popup: false, message: `` });
      }, 1000);
    }
  }, [authMutation.isSuccess, authMutation.isPending]);
  const sendOTP = async () => {
    authMutation.mutate({
      endpoint: "resendotp",
      credentials: true,
    });
  };
  useEffect(() => {
    localStorage.setItem("forgetIsResendActive", "false");
    localStorage.setItem("forgetTimer", "120");
  }, []);
  useEffect(() => {
    localStorage.setItem("forgetIsResendActive", "" + resnendActive);
    localStorage.setItem("forgetTimer", "" + timer);
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
  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center">
      <div className="rounded border md:min-w-[28rem] min-w-72 flex items-center flex-col pb-4 pr-9 pl-9 pt-4 gap-5 border-gray-300 shadow">
        <p className="self-start font-semibold w-full flex gap-1">
          OTP is sent to{" "}
          <span className="font-bold">{localStorage.getItem("mail")}</span>(
          <Link
            className="text-blue-500 underline"
            to={"/forgot-password"}
            onClick={() => {
              setTimer(120);
              localStorage.setItem("forgetTimer", "120");
              setIsResendActive(false);
              localStorage.setItem("forgetIsResendActive", "false");
            }}
          >
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
            type="text"
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
            type="password"
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
            text={"Change password"}
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
