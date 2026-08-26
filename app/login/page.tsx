"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import AsciiCanvas from "../components/AsciiCanvas";

const TAGLINES = [
  "YOUR BODY IS YOUR MACHINE",
  "DISCIPLINE IS FREEDOM",
  "ASCEND BEYOND LIMITS",
  "BUILT DIFFERENT",
];

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.4 0-13.8 4.2-17 10.3z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.3 35.4 26.8 36 24 36c-5.2 0-9.7-3.1-11.3-7.6l-6.5 5C9.7 39.7 16.3 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.3 5.3C40.8 36.1 44 30.5 44 24c0-1.3-.1-2.7-.4-3.5z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function Typewriter({ texts, speed = 80, deleteSpeed = 40, delay = 2200 }: { texts: string[]; speed?: number; deleteSpeed?: number; delay?: number }) {
  const [display, setDisplay] = useState("");
  const [idx, setIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[idx] || "";
    const timeout = setTimeout(() => {
      if (!deleting) {
        if (charIdx < current.length) {
          setDisplay(current.slice(0, charIdx + 1));
          setCharIdx((c) => c + 1);
        } else {
          setTimeout(() => setDeleting(true), delay);
        }
      } else {
        if (display.length > 0) {
          setDisplay((d) => d.slice(0, -1));
        } else {
          setDeleting(false);
          setCharIdx(0);
          setIdx((i) => (i + 1) % texts.length);
        }
      }
    }, deleting ? deleteSpeed : speed);
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, display, idx, texts, speed, deleteSpeed, delay]);

  return (
    <span className="text-white/50 font-mono text-[10px] tracking-[0.25em]">
      {display}<span className="animate-pulse text-[rgb(var(--accent-rgb))]">|</span>
    </span>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [isSignIn, setIsSignIn] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isReturning, setIsReturning] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      if (localStorage.getItem("ascend_has_signed_in")) setIsReturning(true);
    } catch {}
  }, []);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); setLoading(false); return; }
    try { localStorage.setItem("ascend_has_signed_in", "1"); } catch {}
    router.push("/");
    router.refresh();
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { data: existing } = await supabase.from("profiles").select("username").eq("username", username).maybeSingle();
    if (existing) { setError("Username already taken"); setLoading(false); return; }
    const { error: err } = await supabase.auth.signUp({
      email, password,
      options: { data: { username }, emailRedirectTo: `${window.location.origin}/` },
    });
    if (err) { setError(err.message); setLoading(false); return; }
    setLoading(false);
    setSubmitted(true);
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/` } });
  }

  async function handleApple() {
    await supabase.auth.signInWithOAuth({ provider: "apple", options: { redirectTo: `${window.location.origin}/` } });
  }

  function toggle() {
    setIsSignIn((v) => !v);
    setError(null);
    setEmail("");
    setPassword("");
    setUsername("");
    setShowPassword(false);
  }

  const heading = isSignIn
    ? isReturning ? "Welcome Back" : "Sign In"
    : "Begin Your Ascent";
  const subtitle = isSignIn
    ? isReturning ? "Continue your journey" : "Sign in to your account"
    : "Create your account to start training";

  if (submitted) {
    return (
      <main className="relative min-h-screen text-white overflow-hidden">
        <AsciiCanvas src="/ascii-bg.jpeg" />
        <div className="fixed inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-[1]" />
        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <div
            className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-black/60 backdrop-blur-xl p-8 text-center"
            style={{ animation: "fadeSlideUp 0.5s ease-out" }}
          >
            <div className="w-12 h-12 mx-auto mb-4 rounded-lg border border-[rgb(var(--accent-rgb)/.3)] flex items-center justify-center text-[rgb(var(--accent-rgb))] font-bold">A</div>
            <h1 className="text-xl font-bold text-white mb-2">Check Your Email</h1>
            <p className="text-white/50 text-sm mb-6">
              We sent a confirmation link to <span className="text-white font-medium">{email}</span>
            </p>
            <button onClick={() => { setSubmitted(false); setIsSignIn(true); }} className="text-[rgb(var(--accent-rgb))] text-sm hover:underline">
              ← Back to Sign In
            </button>
          </div>
        </div>
        <style>{`@keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen text-white overflow-hidden">
      <AsciiCanvas src="/ascii-bg.jpeg" />

      {/* Gradient overlay — heavier at bottom for form readability */}
      <div className="fixed inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 z-[1]" />
      {/* Side fades */}
      <div className="fixed inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50 z-[1]" />

      <style>{`
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        input[type="password"]::-ms-reveal, input[type="password"]::-ms-clear { display: none; }
      `}</style>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top branding — visible on all sizes */}
        <div
          className="flex flex-col items-center pt-12 md:pt-16 pb-4"
          style={{ animation: mounted ? "fadeSlideUp 0.6s ease-out" : "none" }}
        >
          <div className="w-11 h-11 rounded-lg border border-white/[0.12] bg-white/[0.04] flex items-center justify-center text-white font-bold text-lg mb-3">
            A
          </div>
          <span className="text-[10px] tracking-[0.35em] text-white/30 font-mono mb-2">ASCEND</span>
          <Typewriter texts={TAGLINES} />
        </div>

        {/* Form card — centered on desktop, bottom-pinned on mobile */}
        <div className="flex-1 flex items-end md:items-center justify-center px-5 pb-8 md:pb-12">
          <div
            className="w-full max-w-[400px] rounded-2xl border border-white/[0.08] bg-black/60 backdrop-blur-xl p-6 md:p-8"
            style={{ animation: mounted ? "fadeSlideUp 0.7s ease-out 0.1s both" : "none" }}
          >
            {/* Header */}
            <h1 className="text-2xl font-bold text-white mb-1">{heading}</h1>
            <p className="text-white/40 text-sm mb-6">{subtitle}</p>

            {/* Form */}
            <form onSubmit={isSignIn ? handleSignIn : handleSignUp} className="space-y-3">
              {!isSignIn && (
                <div>
                  <label className="text-xs text-white/50 font-medium mb-1.5 block">Username</label>
                  <input
                    type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    className="w-full rounded-xl bg-white/[0.06] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 transition"
                  />
                </div>
              )}
              <div>
                <label className="text-xs text-white/50 font-medium mb-1.5 block">Email</label>
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" autoComplete="email"
                  className="w-full rounded-xl bg-white/[0.06] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 transition"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 font-medium mb-1.5 block">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} required
                    minLength={isSignIn ? undefined : 6}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder={isSignIn ? "Enter your password" : "Min 6 characters"}
                    autoComplete={isSignIn ? "current-password" : "new-password"}
                    className="w-full rounded-xl bg-white/[0.06] border border-white/[0.08] px-4 py-3 pr-11 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 transition"
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</p>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-white text-black font-semibold text-sm py-3.5 hover:bg-white/90 transition disabled:opacity-50 mt-1"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    {isSignIn ? "Sign In" : "Create Account"}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <span className="h-px flex-1 bg-white/[0.08]" />
              <span className="text-white/25 text-[11px] font-mono tracking-wider">OR</span>
              <span className="h-px flex-1 bg-white/[0.08]" />
            </div>

            {/* Social buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button" onClick={handleGoogle}
                className="flex items-center justify-center gap-2 rounded-xl bg-white/[0.06] border border-white/[0.08] py-3 text-sm text-white/70 hover:bg-white/[0.1] hover:text-white transition"
              >
                <GoogleIcon />
                <span className="hidden sm:inline">Google</span>
              </button>
              <button
                type="button" onClick={handleApple}
                className="flex items-center justify-center gap-2 rounded-xl bg-white/[0.06] border border-white/[0.08] py-3 text-sm text-white/70 hover:bg-white/[0.1] hover:text-white transition"
              >
                <AppleIcon />
                <span className="hidden sm:inline">Apple</span>
              </button>
            </div>

            {/* Toggle */}
            <p className="text-center text-white/35 text-sm mt-5">
              {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
              <button onClick={toggle} className="text-[rgb(var(--accent-rgb))] hover:text-[rgb(var(--accent-light-rgb))] font-medium transition">
                {isSignIn ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
