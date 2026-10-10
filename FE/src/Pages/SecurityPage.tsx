import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { icons, ui } from "../components";
import { Button } from "../components/ui";
import { useAuthMutation } from "../queries/AuthQueries/queries";
import { popupAtom } from "../store/loadingState";
import { userAtom } from "../store/userState";

function SecurityPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ oldPassword: string; newPassword: string }>();
  const {
    register: registerTotpDisable,
    handleSubmit: handleTotpDisableSubmit,
    formState: { errors: totpDisableErrors },
  } = useForm<{ password: string; code: string }>();
  const [isPasswordBoxOpen, setIsPasswordBoxOpen] = useState(false);
  const [isTotpDisableBoxOpen, setIsTotpDisableBoxOpen] = useState(false);
  const user = useRecoilValue(userAtom);
  const navigate = useNavigate();
  const setIsPopup = useSetRecoilState(popupAtom);
  const changePasswordMutation = useAuthMutation();
  const emailMfaMutation = useAuthMutation();
  const disableTotpMutation = useAuthMutation();
  const changePassword: SubmitHandler<{
    oldPassword: string;
    newPassword: string;
  }> = (data) => {
    changePasswordMutation.mutate({
      endpoint: "changepassword",
      method: "PUT",
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
      credentials: true,
    });
  };
  const disableTotp: SubmitHandler<{ password: string; code: string }> = ({
    password,
    code,
  }) => {
    disableTotpMutation.mutate({
      endpoint: "mfa/totp/disable",
      password,
      code,
      credentials: true,
    });
  };
  useEffect(() => {
    if (changePasswordMutation.isSuccess) {
      setIsPopup({ popup: true, message: "Password changed successfully" });
      setIsPasswordBoxOpen(false);
      setTimeout(() => {
        setIsPopup({ popup: false, message: "" });
      }, 1000);
    }
  }, [changePasswordMutation.isSuccess]);
  const [emailMfaEnabled, setEmailMfaEnabled] = useState(
    user.MFAs?.some((mfa) => mfa.type === "email" && mfa.isEnabled) ?? false,
  );
  const [totpEnabled, setTotpEnabled] = useState(user.totp?.isVerified ?? false);
  useEffect(() => {
    if (emailMfaMutation.isSuccess) setEmailMfaEnabled((enabled) => !enabled);
  }, [emailMfaMutation.isSuccess]);
  useEffect(() => {
    if (disableTotpMutation.isSuccess) {
      setTotpEnabled(false);
      setIsTotpDisableBoxOpen(false);
    }
  }, [disableTotpMutation.isSuccess]);
  return (
    <div className={`sm:w-[80%] lg:w-[82%] w-full`}>
      <div className={`p-3 w-full mb-5`}>
        <div className="flex justify-end items-center">
          <ui.MenuButton size="md" />
        </div>
        <div className="flex flex-col gap-2 w-full pt-5">
          <h1 className="font-medium md:text-2xl text-xl">Sign in methods</h1>
          <div className="flex flex-col gap-2 sm:w-[90%] lg:w-[80%] w-full border rounded-md border-gray-300 border-b-0 mt-1">
            <div className="flex flex-col md:p-5 p-3 border-b border-gray-300">
              <div className="flex justify-between items-center">
                <div className="flex justify-center items-center md:gap-2">
                  <icons.PasswordIcon />
                  <div className="">
                    <h4 className="font-medium">Password</h4>
                    <p className="text-gray-600 text-sm">
                      {user.method === "oauth"
                        ? "Connected with Google"
                        : "Configured"}
                    </p>
                  </div>
                </div>
                {user.method == "normal" || !user.method && (
                  <Button
                    size="sm"
                    classes="font-medium"
                    text={isPasswordBoxOpen ? "Hide" : "Change password"}
                    varient="google"
                    onClick={() => setIsPasswordBoxOpen((prev) => !prev)}
                  />
                )}
              </div>
              {isPasswordBoxOpen && (
                <form
                  onSubmit={handleSubmit(changePassword)}
                  className="flex flex-col gap-2 mt-5 w-[80%] ml-11"
                >
                  <div className="w-[70%]">
                    <label className="font-semibold">Old password</label>
                    <ui.Input
                      formHook={{
                        ...register("oldPassword", { required: true }),
                      }}
                      isWidthFull={true}
                      type="password"
                    />
                    {errors.oldPassword?.type == "required" && (
                      <span className="text-red-500 text-sm -mt-2 self-start">
                        Old password cannot be empty
                      </span>
                    )}
                  </div>
                  <div className="w-[70%]">
                    <label className="font-semibold">New password</label>
                    <ui.Input
                      formHook={{
                        ...register("newPassword", {
                          required: true,
                          minLength: 8,
                          pattern:
                            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                        }),
                      }}
                      isWidthFull={true}
                      type="password"
                    />
                    {errors.newPassword?.type == "required" && (
                      <span className="text-red-500 text-sm -mt-2 self-start">
                        New password cannot be empty
                      </span>
                    )}
                    {errors.newPassword?.type == "minLength" && (
                      <span className="text-red-500 text-sm -mt-2 self-start">
                        New password must be atleast of 8 chars
                      </span>
                    )}
                    {errors.newPassword?.type == "pattern" && (
                      <span className="text-red-500 text-sm -mt-2 self-start">
                        New password must include a number, an uppercase letter,
                        a lowercase letter, and a special character.
                      </span>
                    )}
                  </div>
                  {!errors.newPassword && (
                    <p className="text-gray-500 text-sm">
                      Make sure it's at least 8 characters including a number,an
                      uppercase letter, a lowercase letter, and a special
                      character.
                    </p>
                  )}
                  {changePasswordMutation.error &&
                    !errors.oldPassword &&
                    !errors.newPassword && (
                      <ui.ErrorBox
                        errorMessage={
                          changePasswordMutation.error.message
                            ? changePasswordMutation.error.message
                            : changePasswordMutation.error.message
                        }
                      />
                    )}
                  <div className="flex gap-3 items-center">
                    <Button
                      size="sm"
                      text="Update password"
                      varient="google"
                      isCenterText={true}
                      widthFull={false}
                      type="submit"
                      classes="w-36 font-medium"
                    />
                    <Link
                      to={"/forgot-password"}
                      className="text-blue-800 hover:underline"
                    >
                      I forgot my password
                    </Link>
                  </div>
                </form>
              )}
            </div>
            <div className="flex justify-between md:p-5 p-3 border-b border-gray-300 items-center">
              <div className="flex justify-center items-center md:gap-2">
                <icons.GoogleIcon2 />
                <div>
                  <h4 className="font-medium">Google</h4>
                  <p className="text-gray-600 text-sm">
                    {user.method === "oauth"
                      ? `Connected as ${user.email}`
                      : "Sign in with your Google account"}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                classes="font-medium"
                text={user.method === "oauth" ? "Connected" : "Connect"}
                varient="google"
                onClick={() => user.method !== "oauth" && navigate("/signin")}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-7">
            <icons.Security />
            <h2 className="font-medium md:text-2xl text-xl">Multi-factor authentication</h2>
          </div>
          <p className="text-gray-600 text-sm sm:w-[90%] lg:w-[80%]">
            Add an extra layer of protection by requiring a second verification method when you sign in.
          </p>
          <div className="flex flex-col gap-2 sm:w-[90%] lg:w-[80%] w-full border rounded-md border-gray-300 border-b-0 mt-1">
            <div className="flex justify-between md:p-5 p-3 border-b border-gray-300 items-center">
              <div className="flex justify-center items-center md:gap-2">
                <icons.Security />
                <div>
                  <h4 className="font-medium">Email verification</h4>
                  <p className="text-gray-600 text-sm">
                    {emailMfaEnabled ? "Enabled for sign in" : "Use email codes for sign in"}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                classes="font-medium"
                text={emailMfaEnabled ? "Disable" : "Enable"}
                varient={emailMfaEnabled ? "danger" : "google"}
                loading={emailMfaMutation.isPending}
                onClick={() =>
                  emailMfaMutation.mutate({
                    endpoint: "mfa/email/toggle",
                    credentials: true,
                  })
                }
              />
            </div>
            <div className="flex justify-between md:p-5 p-3 items-center">
              <div className="flex justify-center items-center md:gap-2">
                <icons.Security />
                <div>
                  <h4 className="font-medium">Authenticator app</h4>
                  <p className="text-gray-600 text-sm">
                    {totpEnabled ? "Enabled for sign in" : "Use an authenticator app for sign in"}
                  </p>
                </div>
              </div>
              {totpEnabled ? (
                <Button
                  size="sm"
                  classes="font-medium"
                  text="Disable"
                  varient="danger"
                  loading={disableTotpMutation.isPending}
                  onClick={() => setIsTotpDisableBoxOpen((open) => !open)}
                />
              ) : (
                <Button
                  size="sm"
                  classes="font-medium"
                  text="Set up"
                  varient="google"
                  onClick={() => navigate("/settings/security/totp")}
                />
              )}
            </div>
            {totpEnabled && isTotpDisableBoxOpen && (
              <form
                onSubmit={handleTotpDisableSubmit(disableTotp)}
                className="flex flex-col gap-2 border-t border-gray-200 p-3 md:p-5"
              >
                <p className="text-sm text-gray-600">
                  Confirm your password and enter a current authenticator code to disable TOTP.
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-medium text-sm">Password</label>
                    <ui.Input
                      type="password"
                      formHook={{
                        ...registerTotpDisable("password", { required: true }),
                      }}
                    />
                    {totpDisableErrors.password && (
                      <span className="text-red-500 text-sm">Password is required.</span>
                    )}
                  </div>
                  <div>
                    <label className="font-medium text-sm">Authenticator code</label>
                    <ui.Input
                      type="text"
                      placeholder="123456"
                      formHook={{
                        ...registerTotpDisable("code", {
                          required: true,
                          pattern: /^\d{6}$/,
                        }),
                      }}
                    />
                    {totpDisableErrors.code && (
                      <span className="text-red-500 text-sm">Enter a valid 6-digit code.</span>
                    )}
                  </div>
                </div>
                {disableTotpMutation.error && (
                  <ui.ErrorBox errorMessage={disableTotpMutation.error.message} />
                )}
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    varient="danger"
                    text="Confirm disable"
                    loading={disableTotpMutation.isPending}
                  />
                  <Button
                    type="button"
                    size="sm"
                    varient="google"
                    text="Cancel"
                    onClick={() => setIsTotpDisableBoxOpen(false)}
                  />
                </div>
              </form>
            )}
          </div>
          {(emailMfaMutation.error || disableTotpMutation.error) && (
            <ui.ErrorBox
              errorMessage={
                emailMfaMutation.error?.message ??
                disableTotpMutation.error?.message ??
                "Unable to update MFA settings"
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default SecurityPage;
