import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  useRefreshTokenMutation,
  useUserQuery,
} from "../queries/AuthQueries/queries";

function Index() {
  const user = useUserQuery({credentials:true});
  const refreshTokenMutation = useRefreshTokenMutation();
  const navigate = useNavigate();
  const hasTriedRefresh = useRef(false);
  useEffect(() => {
    if (user.status == "error" && !hasTriedRefresh.current) {
      hasTriedRefresh.current = true;
      refreshTokenMutation.mutate(undefined, {
        onSuccess: () => {
          navigate("/dashboard");
        },
        onError: () => navigate("/signin"),
      });
    }
    if (user.status == "success") {
      navigate("/dashboard");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTokenMutation, user.status]);
  return <></>;
}

export default Index;
