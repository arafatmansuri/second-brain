function ErrorBox({ errorMessage }: { errorMessage: string }) {
  return <div className="text-red-500">{errorMessage}</div>;
}

export default ErrorBox;
