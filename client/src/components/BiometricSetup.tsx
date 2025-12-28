import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Fingerprint, Smartphone, Trash2, Plus, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  isBiometricSupported,
  isPlatformAuthenticatorAvailable,
  registerBiometric,
  getBiometricCredentials,
  removeBiometricCredential,
  hasBiometricCredentials,
  type BiometricCredential,
} from '@/services/biometricAuth';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export function BiometricSetup() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isSupported, setIsSupported] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [credentials, setCredentials] = useState<BiometricCredential[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isCheckingSupport, setIsCheckingSupport] = useState(true);

  useEffect(() => {
    checkSupport();
    if (user) {
      loadCredentials();
    }
  }, [user]);

  const checkSupport = async () => {
    setIsCheckingSupport(true);
    const supported = isBiometricSupported();
    setIsSupported(supported);

    if (supported) {
      const available = await isPlatformAuthenticatorAvailable();
      setIsAvailable(available);
    }
    setIsCheckingSupport(false);
  };

  const loadCredentials = () => {
    if (!user) return;
    const creds = getBiometricCredentials(user.id.toString());
    setCredentials(creds);
  };

  const handleRegister = async () => {
    if (!user) return;

    setIsRegistering(true);
    try {
      const result = await registerBiometric(
        user.id.toString(),
        user.email,
        user.fullName || user.email
      );

      if (result.success) {
        toast.success('Biometric authentication enabled!', {
          description: 'You can now use fingerprint or Face ID to sign in',
        });
        loadCredentials();
      } else {
        toast.error('Failed to enable biometric authentication', {
          description: result.error,
        });
      }
    } catch (error: any) {
      toast.error('Registration failed', {
        description: error.message,
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleRemove = (credentialId: string) => {
    if (!user) return;

    const success = removeBiometricCredential(user.id.toString(), credentialId);
    if (success) {
      toast.success('Biometric credential removed');
      loadCredentials();
    } else {
      toast.error('Failed to remove credential');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isCheckingSupport) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="w-5 h-5" />
            Biometric Authentication
          </CardTitle>
          <CardDescription>Checking device support...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="w-5 h-5" />
            Biometric Authentication
          </CardTitle>
          <CardDescription>
            Use fingerprint or Face ID for faster, more secure login
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Biometric authentication is not supported on this device or browser.
              Please use a modern browser on a device with biometric capabilities.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!isAvailable) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="w-5 h-5" />
            Biometric Authentication
          </CardTitle>
          <CardDescription>
            Use fingerprint or Face ID for faster, more secure login
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No biometric authenticator found on this device. Please ensure your device
              has fingerprint or Face ID enabled in system settings.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="w-5 h-5" />
          Biometric Authentication
        </CardTitle>
        <CardDescription>
          Use fingerprint or Face ID for faster, more secure login
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        {credentials.length > 0 ? (
          <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Biometric authentication is enabled on this device
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Enable biometric authentication for faster and more secure access to your account
            </AlertDescription>
          </Alert>
        )}

        {/* Registered Devices */}
        {credentials.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Registered Devices
            </h4>
            {credentials.map((credential) => (
              <div
                key={credential.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 dark:bg-gray-900"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{credential.deviceName}</p>
                    <p className="text-xs text-muted-foreground">
                      Added {formatDate(credential.createdAt)}
                      {credential.counter > 0 && ` • Used ${credential.counter} times`}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(credential.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add New Device */}
        <div className="pt-2">
          <Button
            onClick={handleRegister}
            disabled={isRegistering}
            className="w-full"
            variant={credentials.length > 0 ? 'outline' : 'default'}
          >
            {isRegistering ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Setting up...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                {credentials.length > 0 ? 'Add Another Device' : 'Enable Biometric Login'}
              </>
            )}
          </Button>
        </div>

        {/* Info */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            <strong>How it works:</strong> Your biometric data never leaves your device.
            We use industry-standard WebAuthn protocol to verify your identity securely.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
