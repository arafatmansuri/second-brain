import axios from "axios";
import type React from "react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import Brain from "../components/icons/Brain";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { BACKEND_URL } from "../config";
function Signup() {
  const usernameRef = useRef<React.InputHTMLAttributes<HTMLInputElement>>(
    <input type="text" />
  );
  const passwordRef = useRef<React.InputHTMLAttributes<HTMLInputElement>>(
    <input type="text" />
  );
  const navigate = useNavigate();
  async function signup() {
    const username = usernameRef.current?.value;
    const password = passwordRef.current?.value;
    console.log(username);
    console.log(password);
    await axios.post(`${BACKEND_URL}/api/v1/user/signup`, {
      username: username,
      password: password,
    });
    navigate("/signin");
  }
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
          <Button
            varient="primary"
            text="Signup"
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
