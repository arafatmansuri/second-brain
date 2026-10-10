import { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ui } from "../components";
import { useAuthMutation } from "../queries/AuthQueries/queries";

export default function MfaTotp() {
  const navigate = useNavigate();
  const authMutation = useAuthMutation();
  const { register, handleSubmit, formState: { errors } } =
    useForm<{ code: string }>();

  const submit: SubmitHandler<{ code: string }> = ({ code }) => {
    authMutation.mutate({
      endpoint: "signin/mfa/totp",
      code,
      credentials: true,
    });
  };

  useEffect(() => {
    if (authMutation.isSuccess) navigate("/dashboard");
  }, [authMutation.isSuccess, navigate]);

  return (
    <div className="h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit(submit)} className="border rounded-md shadow p-8 w-80 flex flex-col gap-4">
        <h1 className="font-bold text-2xl text-purple-800">Authenticator code</h1>
        <p className="text-gray-600 text-sm">Enter the 6-digit code from your authenticator app.</p>
        <ui.Input
          placeholder="123456"
          type="text"
          formHook={{
            ...register("code", {
              required: true,
              pattern: /^\d{6}$/,
            }),
          }}
        />
        {errors.code && <span className="text-red-500 text-sm">Enter a valid 6-digit code.</span>}
        {authMutation.error && <ui.ErrorBox errorMessage={authMutation.error.message} />}
        <ui.Button type="submit" size="lg" widthFull varient="primary" text="Verify" loading={authMutation.isPending} />
      </form>
    </div>
  );
}
