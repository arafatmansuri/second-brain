import axios from "axios";
import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import Brain from "../components/icons/Brain";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { BACKEND_URL } from "../config";

function Signin() {
  const usernameRef = useRef<React.InputHTMLAttributes<HTMLInputElement>>(
    <input type="text" />
  );
  const passwordRef = useRef<React.InputHTMLAttributes<HTMLInputElement>>(
    <input type="text" />
  );
  const navigate = useNavigate();
  async function signin() {
    const username = usernameRef.current?.value;
    const password = passwordRef.current?.value;
    await axios.post(
      `${BACKEND_URL}/api/v1/user/signin`,
      {
        username: username,
        password: password,
      },
      { withCredentials: true }
    );
    navigate("/Dashboard");
  }
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
          <Button
            varient="primary"
            text="Signin"
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
