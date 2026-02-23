'use client';
import { EyeIcon, EyeSlashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showAlert, setShowAlert] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isFormFilled = username.trim() !== '' && password.trim() !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    setLoading(false);

    if (res.ok) {
      window.location.href = '/';
    } else {
      const data = await res.json();
      setError(data.error || 'Login failed');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#00573f] p-6">
      {/* Dog + decorative vectors — bottom-right, desktop only */}
      <div
        className="pointer-events-none absolute hidden lg:block"
        style={{
          width: 286,
          height: 400,
          left: 'calc(50% + 360px)',
          bottom: 0
        }}
      >
        {/* Decorative vector 1 */}
        <div
          className="absolute flex items-center justify-center"
          style={{ inset: '2.52% 14.21% 92.51% 79.22%' }}
        >
          <div style={{ width: 5.78, height: 21.56, transform: 'rotate(42.21deg)', flexShrink: 0 }}>
            <img src="/login-vector1.svg" alt="" className="block size-full" />
          </div>
        </div>
        {/* Decorative vector 2 */}
        <div
          className="absolute flex items-center justify-center"
          style={{ inset: '0 23.22% 95.71% 70.83%' }}
        >
          <div style={{ width: 10.94, height: 13.24, transform: 'rotate(42.21deg)', flexShrink: 0 }}>
            <img src="/login-vector2.svg" alt="" className="block size-full" />
          </div>
        </div>
        {/* Decorative vector 3 */}
        <div
          className="absolute flex items-center justify-center"
          style={{ inset: '8.89% 9.38% 86.59% 84.27%' }}
        >
          <div style={{ width: 13.36, height: 12.29, transform: 'rotate(42.21deg)', flexShrink: 0 }}>
            <img src="/login-vector3.svg" alt="" className="block size-full" />
          </div>
        </div>
        {/* Dog image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/dog-login.png"
          alt=""
          className="absolute inset-0 size-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />
      </div>

      {/* Login card */}
      <div className="relative z-10 flex w-full max-w-[378px] flex-col gap-6 rounded-lg bg-white p-10 shadow-2xl">
        {/* Logo */}
        <div className="flex h-24 w-full items-center justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-affinity.png"
            alt="Affinity Pet Care"
            className="h-full w-auto object-contain"
          />
        </div>

        {/* Title */}
        <h1 className="text-center text-[18px] font-bold leading-[24px] text-[#1b1818]">
          Affinity Pet Care Login
        </h1>

        {/* Info alert */}
        {showAlert && (
          <div className="flex items-start gap-4 rounded border border-[#bee5eb] bg-[#e0f2f5] px-3 py-2">
            <p className="flex-1 text-[12px] leading-[18px] text-[#146c7b]">
              <span className="mr-1">👋</span>
              <span>Hi </span>
              <strong>Trade Portal</strong>
              <span> user! First time here?{'\n'}We need you to </span>
              <strong className="underline">create your new password</strong>
              <span> to access the new portal.</span>
            </p>
            <button
              type="button"
              onClick={() => setShowAlert(false)}
              className="mt-0.5 shrink-0 text-[#146c7b] hover:text-[#0d4f5a]"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email field */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-bold leading-[18px] text-[#1b1818]">Email</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your email"
              className="h-10 w-full rounded border border-[#d6d1d1] px-3 text-[14px] leading-[19px] text-[#1b1818] placeholder:text-[#a59c9c] focus:border-[#00573f] focus:outline-none focus:ring-1 focus:ring-[#00573f]"
            />
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-bold leading-[18px] text-[#1b1818]">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="h-10 w-full rounded border border-[#d6d1d1] px-3 pr-10 text-[14px] leading-[19px] text-[#1b1818] placeholder:text-[#a59c9c] focus:border-[#00573f] focus:outline-none focus:ring-1 focus:ring-[#00573f]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a59c9c] hover:text-[#665c5c]"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Remember me + Reset password */}
          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 cursor-pointer rounded border-[#a59c9c] accent-[#00573f]"
              />
              <span className="text-[14px] leading-[19px] text-[#1c1717]">Remember me</span>
            </label>
            <button
              type="button"
              className="text-[14px] font-bold leading-[19px] text-[#665c5c] underline hover:text-[#1b1818]"
            >
              Reset your password
            </button>
          </div>

          {/* Error message */}
          {error && (
            <p className="rounded bg-red-50 px-3 py-2 text-center text-sm text-red-600">
              {error}
            </p>
          )}

          {/* Login button */}
          <button
            type="submit"
            disabled={loading || !isFormFilled}
            className={`h-10 w-full rounded text-[16px] font-bold uppercase tracking-[0.16px] transition-colors ${
              isFormFilled && !loading
                ? 'bg-[#00573f] text-white hover:bg-[#004530]'
                : 'cursor-not-allowed bg-[#edecec] text-[#a59c9c]'
            }`}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {/* Create account */}
        <p className="text-center text-[14px] leading-[19px] text-[#665c5c]">
          If you are new to Affinity Pet Care, please{' '}
          <a href="#" className="font-bold underline hover:text-[#1b1818]">
            create an account
          </a>{' '}
          for Trade, Breeder or Vet access.
        </p>

        {/* Policy links */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-[#edecec] pt-4 text-[12px] font-bold leading-[18px] text-[#665c5c]">
          <a href="#" className="underline hover:text-[#1b1818]">
            Privacy Policy
          </a>
          <a href="#" className="underline hover:text-[#1b1818]">
            Manage or reject cookies
          </a>
        </div>
      </div>
    </div>
  );
}
