import { useEffect } from "react";
import { ArrowRight, Mail, ShieldCheck } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { ui } from "../components";

type MfaState = {
  methods?: { type: "email" | "totp"; isEnabled: boolean }[];
};

export default function MfaChoice() {
  const navigate = useNavigate();
  const location = useLocation();
  const methods = (location.state as MfaState | null)?.methods?.filter(
    (method) => method.isEnabled,
  ) ?? [];

  useEffect(() => {
    if (methods.length === 1) {
      navigate(
        methods[0].type === "totp" ? "/signin/mfa/totp" : "/signin/mfa/email",
        { replace: true },
      );
    }
  }, [methods.length, navigate]);

  if (methods.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <ui.ErrorBox errorMessage="No MFA method is available for this account." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="border border-gray-200 rounded-2xl shadow-lg bg-white p-6 sm:p-8 w-full max-w-md flex flex-col gap-5">
        <div className="flex items-center justify-center size-14 rounded-full bg-purple-100 text-purple-700">
          <ShieldCheck size={30} strokeWidth={1.8} />
        </div>
        <div>
          <h1 className="font-bold text-2xl text-purple-800">Verify your sign in</h1>
          <p className="text-gray-600 text-sm mt-2">
            Your password was accepted. Choose a verification method to continue.
          </p>
        </div>
        {methods.map((method) => (
          <button
            key={method.type}
            type="button"
            className="group flex items-center gap-4 rounded-xl border border-gray-200 p-4 text-left transition hover:border-purple-400 hover:bg-purple-50"
            onClick={() =>
              navigate(
                method.type === "totp"
                  ? "/signin/mfa/totp"
                  : "/signin/mfa/email",
              )
            }
          >
            <span className="flex items-center justify-center size-11 rounded-lg bg-gray-100 text-purple-700 group-hover:bg-white">
              {method.type === "totp" ? <ShieldCheck size={23} /> : <Mail size={23} />}
            </span>
            <span className="flex-1">
              <span className="block font-semibold text-gray-900">
                  {method.type === "totp" ? "Authenticator app" : "Email verification"}
              </span>
              <span className="block text-sm text-gray-500 mt-1">
                  {method.type === "totp"
                    ? "Use a code from your authenticator app"
                    : "Receive a one-time code by email"}
              </span>
            </span>
            <ArrowRight size={19} className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-purple-600" />
          </button>
        ))}
        <p className="text-center text-xs text-gray-500">
          Select one of your enabled verification methods.
        </p>
      </div>
    </div>
  );
}
