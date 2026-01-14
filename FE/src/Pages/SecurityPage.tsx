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
  const [isPasswordBoxOpen, setIsPasswordBoxOpen] = useState(false);
  const user = useRecoilValue(userAtom);
  const navigate = useNavigate();
  const setIsPopup = useSetRecoilState(popupAtom);
  const changePasswordMutation = useAuthMutation();
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
  useEffect(() => {
    if (changePasswordMutation.isSuccess) {
      setIsPopup({ popup: true, message: "Password changed successfully" });
      setIsPasswordBoxOpen(false);
      setTimeout(() => {
        setIsPopup({ popup: false, message: "" });
      }, 1000);
    }
  }, [changePasswordMutation.isSuccess]);
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
        </div>
      </div>
    </div>
  );
}

export default SecurityPage;
