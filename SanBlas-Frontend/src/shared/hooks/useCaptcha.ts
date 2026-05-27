import { useRef, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

export const useCaptcha = () => {
  const captchaRef = useRef<ReCAPTCHA>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
  };

  const handleCaptchaExpired = () => {
    setCaptchaToken(null);
  };

  const resetCaptcha = () => {
    setCaptchaToken(null);
    captchaRef.current?.reset();
  };

  return {
    captchaRef,
    captchaToken,
    handleCaptchaChange,
    handleCaptchaExpired,
    resetCaptcha,
    setCaptchaToken,
  };
};