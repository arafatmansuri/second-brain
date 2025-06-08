import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Brain from "../components/icons/Brain";
import Button from "../components/ui/Button";
import ErrorBox from "../components/ui/ErrorBox";
import Input from "../components/ui/Input";
import { useAuthMutation } from "../queries/AuthQueries/queries";

function Signin() {
  const usernameRef = useRef<React.InputHTMLAttributes<HTMLInputElement>>(
    <input type="text" />
  );
  const passwordRef = useRef<React.InputHTMLAttributes<HTMLInputElement>>(
    <input type="text" />
  );
  const navigate = useNavigate();
  const signinMutation = useAuthMutation();
  async function signin() {
    const username = usernameRef.current?.value?.toString();
    const password = passwordRef.current?.value?.toString();
    signinMutation.mutate({
      username,
      password,
      credentials: true,
      endpoint: "signin",
    });
  }
  useEffect(() => {
    if (!signinMutation.isLoading && !signinMutation.error) {
      navigate("/dashboard");
    }
  }, [navigate, signinMutation.error, signinMutation.isLoading]);
  return (
    <div className="h-screen w-screen bg-gray-200 flex flex-col justify-center items-center">
      <div className="flex items-center gap-1 mb-5 fixed top-0 left-0 m-3">
        <Brain /> <h1 className="font-bold text-xl">Second Brain</h1>
      </div>
      <div className="bg-white rounded border min-w-96 flex items-center flex-col pb-4 pr-9 pl-9 pt-4 gap-5 border-gray-300 shadow">
        <h1 className="font-bold text-2xl text-purple-800">Signin</h1>
        <div className="flex items-center flex-col gap-3 w-full">
          <Input placeholder="Username" reference={usernameRef} />
          <Input placeholder="Password" reference={passwordRef} />
          {signinMutation.error ? (
            <ErrorBox
              errorMessage={
                signinMutation.error.response?.data?.message
                  ? signinMutation.error.response.data.message
                  : signinMutation.error.message
              }
            />
          ) : (
            ""
          )}
          <Button
            varient="primary"
            text="Signin"
            loading={signinMutation.isLoading}
            size="lg"
            widthFull={true}
            onClick={signin}
          />
          <p>
            Don't have an account?{" "}
            <a href="/signup" className="text-blue-400 hover:underline">
              create one
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signin;
