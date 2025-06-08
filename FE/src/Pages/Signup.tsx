import type React from "react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Brain from "../components/icons/Brain";
import Button from "../components/ui/Button";
import ErrorBox from "../components/ui/ErrorBox";
import Input from "../components/ui/Input";
import { useAuthMutation } from "../queries/AuthQueries/queries";
function Signup() {
  const usernameRef = useRef<React.InputHTMLAttributes<HTMLInputElement>>(
    <input type="text" />
  );
  const passwordRef = useRef<React.InputHTMLAttributes<HTMLInputElement>>(
    <input type="text" />
  );
  const navigate = useNavigate();
  const signupMutation = useAuthMutation();
  async function signup() {
    const username = usernameRef.current?.value?.toString();
    const password = passwordRef.current?.value?.toString();
    signupMutation.mutate({ username, password, endpoint: "signup" });
  }
  useEffect(() => {
    if (!signupMutation.isLoading && !signupMutation.error) {
      navigate("/signin");
    }
  }, [navigate, signupMutation.error, signupMutation.isLoading]);
  return (
    <div className="h-screen w-screen bg-gray-200 flex flex-col justify-center items-center">
      <div className="flex items-center gap-1 mb-5 fixed top-0 left-0 m-3">
        <Brain /> <h1 className="font-bold text-xl">Second Brain</h1>
      </div>
      <div className="bg-white rounded border min-w-96 flex items-center flex-col pb-4 pr-9 pl-9 pt-4 gap-5 border-gray-300 shadow">
        <h1 className="font-bold text-2xl text-purple-800">Signup</h1>
        <div className="flex items-center flex-col gap-3 w-full">
          <Input placeholder="Username" reference={usernameRef} />
          <Input placeholder="Password" reference={passwordRef} />
          {signupMutation.error ? (
            <ErrorBox
              errorMessage={
                signupMutation.error.response?.data?.message
                  ? signupMutation.error.response.data.message
                  : signupMutation.error.message
              }
            />
          ) : (
            ""
          )}
          <Button
            varient="primary"
            text="Signup"
            loading={signupMutation.isLoading}
            size="lg"
            widthFull={true}
            onClick={signup}
          />
          <p>
            Having account?{" "}
            <a href="/signin" className="text-blue-400 hover:underline">
              signin
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
