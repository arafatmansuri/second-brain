import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { ui } from "../components";
import { useAuthMutation } from "../queries/AuthQueries/queries";
import { countMinutesSeconds } from "../services/countMinutes";

export default function MfaEmail() {
  const authMutation = useAuthMutation();
  const [timer, setTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const { register, handleSubmit, formState: { errors },setValue,setFocus } =
    useForm<{ otp: string }>();
  useEffect(()=>{
    setFocus("otp");
  },[setFocus]);
  useEffect(() => {
    authMutation.mutate({
      endpoint: "signin/mfa/email/send",
      credentials: true,
    });
    const interval = window.setInterval(() => {
      setTimer((current) => {
        if (current <= 1) {
          setCanResend(true);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const submit: SubmitHandler<{ otp: string }> = ({ otp }) => {
    authMutation.mutate({
      endpoint: "signin/mfa/email/verify",
      otp,
      credentials: true,
    });
    setValue("otp", "");
  };
  useEffect(()=>{
    if(authMutation.isSuccess && authMutation.variables?.endpoint === "signin/mfa/email/verify"){
      window.location.href = "/dashboard";
    }
  },[authMutation.isSuccess])
  const resend = () => {
    setTimer(120);
    setCanResend(false);
    authMutation.mutate({
      endpoint: "signin/mfa/email/send",
      credentials: true,
    });
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit(submit)} className="border rounded-md shadow p-8 w-80 flex flex-col gap-4">
        <h1 className="font-bold text-2xl text-purple-800">Email verification</h1>
        <p className="text-gray-600 text-sm">Enter the code sent to your email.</p>
        <ui.Input
          placeholder="123456"
          type="text"
          formHook={{ ...register("otp", { required: true, pattern: /^\d{6}$/ }) }}
        />
        {errors.otp && <span className="text-red-500 text-sm">Enter a valid 6-digit code.</span>}
        {authMutation.error && <ui.ErrorBox errorMessage={authMutation.error.message} />}
        <ui.Button type="submit" size="lg" widthFull varient="primary" text="Verify" loading={authMutation.isPending} />
        {canResend ? (
          <button type="button" onClick={resend} className="text-blue-500 hover:underline">
            Resend code
          </button>
        ) : (
          <p className="text-center text-sm text-gray-500">Resend in {countMinutesSeconds(timer)}</p>
        )}
      </form>
    </div>
  );
}
