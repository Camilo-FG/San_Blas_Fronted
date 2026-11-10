import { useCallback, useRef, useState } from 'react';

export interface CaptchaControl {
  reset: () => void;
}

export const useCaptcha = () => {
  const captchaRef = useRef<CaptchaControl | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
  };

  const handleCaptchaExpired = () => {
    setCaptchaToken(null);
  };

  const resetCaptcha = useCallback(() => {
    setCaptchaToken(null);
    captchaRef.current?.reset();
  }, []);

  return {
    captchaRef,
    captchaToken,
    handleCaptchaChange,
    handleCaptchaExpired,
    resetCaptcha,
    setCaptchaToken,
  };
};
