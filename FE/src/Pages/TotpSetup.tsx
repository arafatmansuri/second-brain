import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ui } from "../components";
import { useAuthMutation } from "../queries/AuthQueries/queries";

export default function TotpSetup() {
  const navigate = useNavigate();
  const setupMutation = useAuthMutation();
  const verifyMutation = useAuthMutation();
  const [code, setCode] = useState("");

  useEffect(() => {
    setupMutation.mutate({
      endpoint: "mfa/totp/setup",
      credentials: true,
    });
  }, []);

  const verify = (event: React.FormEvent) => {
    event.preventDefault();
    verifyMutation.mutate({
      endpoint: "mfa/totp/verify",
      code,
      credentials: true,
    });
  };

  const backupCodes = verifyMutation.data?.backupCodes;
  const isSetupComplete = verifyMutation.isSuccess;
  return (
    <div className="sm:w-[80%] lg:w-[82%] w-full p-3">
      <div className="max-w-xl border rounded-md p-6 flex flex-col gap-4">
        <h1 className="font-medium text-2xl">Set up authenticator app</h1>
        {!isSetupComplete ? (
          <>
            <p className="text-gray-600">
              Scan this QR code with your authenticator app, then enter the code it generates.
            </p>
            {setupMutation.data?.qrCode && (
              <img
                src={setupMutation.data.qrCode}
                alt="TOTP setup QR code"
                className="w-48 h-48"
              />
            )}
            {setupMutation.data?.manualKey && (
              <p className="text-sm break-all">
                Can&apos;t scan? Enter this key manually:{" "}
                <strong>{setupMutation.data.manualKey}</strong>
              </p>
            )}
            <form onSubmit={verify} className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="font-medium">Verification code</label>
                <ui.Input
                  placeholder="123456"
                  type="text"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  isWidthFull
                />
              </div>
              <ui.Button
                type="submit"
                size="sm"
                varient="primary"
                text="Enable"
                loading={verifyMutation.isPending}
                isDisabled={!/^\d{6}$/.test(code)}
              />
            </form>
          </>
        ) : (
          <div className="border border-green-300 bg-green-50 rounded p-4">
            <h2 className="font-semibold">Authenticator app enabled</h2>
            <p className="text-sm">
              Your authenticator app is now configured for sign in.
            </p>
          </div>
        )}
        {(setupMutation.error || verifyMutation.error) && (
          <ui.ErrorBox
            errorMessage={
              setupMutation.error?.message ?? verifyMutation.error?.message ?? "Unable to configure MFA"
            }
          />
        )}
        {backupCodes && (
          <div className="border border-green-300 bg-green-50 rounded p-4">
            <h2 className="font-semibold">Save your backup codes</h2>
            <p className="text-sm mb-2">These codes are shown once. Store them somewhere safe.</p>
            <code className="grid grid-cols-2 gap-1">
              {backupCodes.map((backupCode) => (
                <span key={backupCode}>{backupCode}</span>
              ))}
            </code>
          </div>
        )}
        {isSetupComplete && (
          <ui.Button
            size="sm"
            varient="google"
            text="Back to security"
            onClick={() => navigate("/settings/security")}
            classes="self-start"
          />
        )}
      </div>
    </div>
  );
}
