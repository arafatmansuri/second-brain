import { useState } from "react";
import { Link } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { icons, ui } from "../components";
import { Button } from "../components/ui";
import { userAtom } from "../store/userState";

function SecurityPage() {
  const [isPasswordBoxOpen, setIsPasswordBoxOpen] = useState(false);
  const user = useRecoilValue(userAtom);

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
                    <p className="text-gray-600 text-sm">Configured</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  classes="font-medium"
                  text={isPasswordBoxOpen ? "Hide" : "Change password"}
                  varient="google"
                  onClick={() => setIsPasswordBoxOpen((prev) => !prev)}
                />
              </div>
              {isPasswordBoxOpen && (
                <div className="flex flex-col gap-2 mt-5 w-[80%] ml-11">
                  <div className="w-[70%]">
                    <label className="font-semibold">Old password</label>
                    <ui.Input
                      // formHook={{ ...register("title", { minLength: 3 }) }}
                      isWidthFull={true}
                    />
                  </div>
                  <div className="w-[70%]">
                    <label className="font-semibold">New password</label>
                    <ui.Input
                      // formHook={{ ...register("title", { minLength: 3 }) }}
                      isWidthFull={true}
                    />
                  </div>
                  <p className="text-gray-500 text-sm">
                    Make sure it's at least 8 characters including a number and
                    a lowercase letter.
                  </p>
                  <div className="flex gap-3 items-center">
                    <Button
                      size="sm"
                      text="Update password"
                      varient="google"
                      isCenterText={true}
                      widthFull={false}
                      classes="w-36 font-medium"
                    />
                    <Link
                      to={"/forgot-password"}
                      className="text-blue-800 hover:underline"
                    >
                      I forgot my password
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-between md:p-5 p-3 border-b border-gray-300 items-center">
              <div className="flex justify-center items-center md:gap-2">
                <icons.GoogleIcon2 />
                <div>
                  <h4 className="font-medium">Google</h4>
                  <p className="text-gray-600 text-sm">
                    Sign in with your Google account
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                classes="font-medium"
                text="Connect"
                varient="google"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SecurityPage;
