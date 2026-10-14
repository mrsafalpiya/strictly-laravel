import { useCallback, useState } from 'react';
import { useRouteHttp } from '@/lib/requests';
import { qrCode, recoveryCodes, secretKey } from '@/routes/two-factor';

export type UseTwoFactorAuthReturn = {
    qrCodeSvg: string | null;
    manualSetupKey: string | null;
    recoveryCodesList: string[];
    hasSetupData: boolean;
    errors: string[];
    clearErrors: () => void;
    clearSetupData: () => void;
    clearTwoFactorAuthData: () => void;
    fetchQrCode: () => Promise<void>;
    fetchSetupKey: () => Promise<void>;
    fetchSetupData: () => Promise<void>;
    fetchRecoveryCodes: () => Promise<void>;
};

export const OTP_MAX_LENGTH = 6;

export const useTwoFactorAuth = (): UseTwoFactorAuthReturn => {
    // Response types are declared for Fortify's JSON endpoints in config/types.php (and checked by the tests).
    const { submit: requestQrCode } = useRouteHttp(qrCode(), {});
    const { submit: requestSecretKey } = useRouteHttp(secretKey(), {});
    const { submit: requestRecoveryCodes } = useRouteHttp(recoveryCodes(), {});

    const [qrCodeSvg, setQrCodeSvg] = useState<string | null>(null);
    const [manualSetupKey, setManualSetupKey] = useState<string | null>(null);
    const [recoveryCodesList, setRecoveryCodesList] = useState<string[]>([]);
    const [errors, setErrors] = useState<string[]>([]);

    const hasSetupData = qrCodeSvg !== null && manualSetupKey !== null;

    const clearErrors = useCallback((): void => {
        setErrors([]);
    }, []);

    const clearSetupData = useCallback((): void => {
        setManualSetupKey(null);
        setQrCodeSvg(null);
        setErrors([]);
    }, []);

    const clearTwoFactorAuthData = useCallback((): void => {
        setManualSetupKey(null);
        setQrCodeSvg(null);
        setErrors([]);
        setRecoveryCodesList([]);
    }, []);

    const fetchQrCode = useCallback(async (): Promise<void> => {
        try {
            const response = await requestQrCode();

            // Fortify answers `[]` when two-factor authentication isn't enabled.
            if (Array.isArray(response)) {
                throw new Error('Two-factor authentication is not enabled.');
            }

            setQrCodeSvg(response.svg);
        } catch {
            setErrors((prev) => [...prev, 'Failed to fetch QR code']);
            setQrCodeSvg(null);
        }
    }, [requestQrCode]);

    const fetchSetupKey = useCallback(async (): Promise<void> => {
        try {
            const { secretKey: key } = await requestSecretKey();

            setManualSetupKey(key);
        } catch {
            setErrors((prev) => [...prev, 'Failed to fetch a setup key']);
            setManualSetupKey(null);
        }
    }, [requestSecretKey]);

    const fetchRecoveryCodes = useCallback(async (): Promise<void> => {
        try {
            setErrors([]);
            setRecoveryCodesList(await requestRecoveryCodes());
        } catch {
            setErrors((prev) => [...prev, 'Failed to fetch recovery codes']);
            setRecoveryCodesList([]);
        }
    }, [requestRecoveryCodes]);

    const fetchSetupData = useCallback(async (): Promise<void> => {
        try {
            setErrors([]);
            await Promise.all([fetchQrCode(), fetchSetupKey()]);
        } catch {
            setQrCodeSvg(null);
            setManualSetupKey(null);
        }
    }, [fetchQrCode, fetchSetupKey]);

    return {
        qrCodeSvg,
        manualSetupKey,
        recoveryCodesList,
        hasSetupData,
        errors,
        clearErrors,
        clearSetupData,
        clearTwoFactorAuthData,
        fetchQrCode,
        fetchSetupKey,
        fetchSetupData,
        fetchRecoveryCodes,
    };
};
