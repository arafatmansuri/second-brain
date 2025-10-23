import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { googleAuth } from "../../queries/AuthQueries/queries";
import { userAtom } from "../../store/userState";
import { GoogleIcon } from "../icons/GoogleIcon";
import { Button } from "./Button";

const GoogleLoginButton = ({ text }: { text: string }) => {
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
      varient="secondary"
      onClick={googleLogin}
      widthFull={true}
      startIcon={<GoogleIcon />}
    />
  );
};
export default GoogleLoginButton;
