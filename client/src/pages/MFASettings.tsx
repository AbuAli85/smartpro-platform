import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { Shield, ShieldCheck, ShieldOff, Key, Copy, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function MFASettings() {
  const { t } = useTranslation();
  const utils = trpc.useUtils();

  const [setupStep, setSetupStep] = useState<"idle" | "generating" | "verifying">("idle");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationToken, setVerificationToken] = useState("");
  const [disableToken, setDisableToken] = useState("");

  // Get MFA status
  const { data: mfaStatus, isLoading } = trpc.mfa.getStatus.useQuery();

  // Generate setup mutation
  const generateSetup = trpc.mfa.generateSetup.useMutation({
    onSuccess: (data) => {
      setQrCodeUrl(data.qrCodeUrl);
      setSecret(data.secret);
      setBackupCodes(data.backupCodes);
      setSetupStep("verifying");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Enable MFA mutation
  const enableMFA = trpc.mfa.enable.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Two-factor authentication has been enabled",
      });
      setSetupStep("idle");
      setVerificationToken("");
      utils.mfa.getStatus.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Disable MFA mutation
  const disableMFA = trpc.mfa.disable.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Two-factor authentication has been disabled",
      });
      setDisableToken("");
      utils.mfa.getStatus.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Regenerate backup codes mutation
  const regenerateBackupCodes = trpc.mfa.regenerateBackupCodes.useMutation({
    onSuccess: (data) => {
      setBackupCodes(data.backupCodes);
      toast({
        title: "Success",
        description: "New backup codes have been generated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStartSetup = () => {
    setSetupStep("generating");
    generateSetup.mutate();
  };

  const handleVerifyAndEnable = () => {
    if (!verificationToken || !secret) return;
    
    enableMFA.mutate({
      secret,
      token: verificationToken,
      backupCodes,
    });
  };

  const handleDisable = () => {
    if (!disableToken) return;
    
    disableMFA.mutate({
      token: disableToken,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
  };

  const copyAllBackupCodes = () => {
    const text = backupCodes.join("\n");
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "All backup codes copied to clipboard",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Two-Factor Authentication</h1>
        <p className="text-muted-foreground">
          Add an extra layer of security to your account
        </p>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {mfaStatus?.enabled ? (
                  <>
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                    Two-Factor Authentication Enabled
                  </>
                ) : (
                  <>
                    <ShieldOff className="h-5 w-5 text-gray-400" />
                    Two-Factor Authentication Disabled
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {mfaStatus?.enabled
                  ? `Enabled on ${mfaStatus.enabledAt ? new Date(mfaStatus.enabledAt).toLocaleDateString() : "Unknown"}`
                  : "Protect your account with an authenticator app"}
              </CardDescription>
            </div>
            <Badge variant={mfaStatus?.enabled ? "default" : "secondary"}>
              {mfaStatus?.enabled ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {!mfaStatus?.enabled ? (
            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Two-factor authentication adds an extra layer of security by requiring a code from your authenticator app in addition to your password.
                </AlertDescription>
              </Alert>
              
              <Button onClick={handleStartSetup} disabled={setupStep !== "idle"}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Enable Two-Factor Authentication
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription>
                  Your account is protected with two-factor authentication. You have {mfaStatus.backupCodesCount} backup codes remaining.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button variant="destructive" onClick={() => setSetupStep("idle")}>
                  <ShieldOff className="mr-2 h-4 w-4" />
                  Disable 2FA
                </Button>
                <Button variant="outline" onClick={() => regenerateBackupCodes.mutate({ token: "" })}>
                  <Key className="mr-2 h-4 w-4" />
                  Regenerate Backup Codes
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Flow */}
      {setupStep === "verifying" && qrCodeUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Set Up Authenticator App</CardTitle>
            <CardDescription>Scan the QR code with your authenticator app</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* QR Code */}
            <div className="flex flex-col items-center space-y-4">
              <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64 border rounded" />
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Or enter this code manually:</p>
                <div className="flex items-center gap-2 justify-center">
                  <code className="bg-muted px-3 py-1 rounded font-mono text-sm">{secret}</code>
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(secret)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Backup Codes */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">Backup Codes</h3>
                  <p className="text-sm text-muted-foreground">
                    Save these codes in a safe place. Each code can only be used once.
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={copyAllBackupCodes}>
                  <Copy className="mr-2 h-3 w-3" />
                  Copy All
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-muted px-3 py-2 rounded font-mono text-sm"
                  >
                    <span>{code}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(code)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification */}
            <div className="border-t pt-6">
              <Label htmlFor="verification-token">Enter Verification Code</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Enter the 6-digit code from your authenticator app to complete setup
              </p>
              <div className="flex gap-2">
                <Input
                  id="verification-token"
                  placeholder="000000"
                  value={verificationToken}
                  onChange={(e) => setVerificationToken(e.target.value)}
                  maxLength={6}
                  className="max-w-xs"
                />
                <Button
                  onClick={handleVerifyAndEnable}
                  disabled={verificationToken.length !== 6 || enableMFA.isPending}
                >
                  Verify and Enable
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disable 2FA */}
      {mfaStatus?.enabled && setupStep === "idle" && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Disable Two-Factor Authentication</CardTitle>
            <CardDescription>
              This will remove the extra security layer from your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Disabling 2FA will make your account less secure. Only disable if absolutely necessary.
              </AlertDescription>
            </Alert>

            <div>
              <Label htmlFor="disable-token">Enter Verification Code</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Enter a code from your authenticator app to confirm
              </p>
              <div className="flex gap-2">
                <Input
                  id="disable-token"
                  placeholder="000000"
                  value={disableToken}
                  onChange={(e) => setDisableToken(e.target.value)}
                  maxLength={6}
                  className="max-w-xs"
                />
                <Button
                  variant="destructive"
                  onClick={handleDisable}
                  disabled={disableToken.length !== 6 || disableMFA.isPending}
                >
                  Disable 2FA
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backup Codes Display (after regeneration) */}
      {backupCodes.length > 0 && mfaStatus?.enabled && setupStep === "idle" && (
        <Card>
          <CardHeader>
            <CardTitle>New Backup Codes</CardTitle>
            <CardDescription>
              Save these codes immediately. Your old backup codes are no longer valid.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <Button size="sm" variant="outline" onClick={copyAllBackupCodes}>
                <Copy className="mr-2 h-3 w-3" />
                Copy All Codes
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-muted px-3 py-2 rounded font-mono text-sm"
                >
                  <span>{code}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(code)}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              className="mt-4"
              onClick={() => setBackupCodes([])}
            >
              I've Saved These Codes
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
