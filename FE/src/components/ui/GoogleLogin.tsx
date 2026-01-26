import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { googleAuth } from "../../queries/AuthQueries/queries";
import { userAtom } from "../../store/userState";
import { GoogleIcon } from "../icons/GoogleIcon";
import { Button } from "./Button";
import { memo } from "react";

const GoogleLoginButton = memo<{ text: string }>(({ text }) => {
  const navigate = useNavigate();
  const setUser = useSetRecoilState(userAtom);
  const responseGoogle = async (authResult: any) => {
    try {
      if (authResult["code"]) {
        const result = await googleAuth(authResult.code);
        setUser(result.data.user.username);
        navigate("/dashboard");
      } else {
        console.log(authResult);
        throw new Error(authResult);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });

  return (
    <Button
      text={`${text} with Google`}
      size="lg"
      varient="google"
      onClick={googleLogin}
      widthFull={true}
      classes=""
      startIcon={<GoogleIcon />}
    />
  );
});
export default GoogleLoginButton;