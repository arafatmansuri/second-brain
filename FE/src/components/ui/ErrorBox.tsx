import { memo } from "react";

export const ErrorBox = memo<{ errorMessage: string }>(({ errorMessage }) => {
  return <div className="text-red-500">{errorMessage}</div>;
});