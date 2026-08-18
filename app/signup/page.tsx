"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "../lib/supabase";

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

function EmailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 6-10 7L2 6" />
    </svg>
  );
}

function FlatButton({ icon, children, onClick }: { icon: React.ReactNode; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 rounded-md bg-white text-[#1a1a1a] font-semibold text-sm py-4 px-5 hover:bg-white/90 transition"
    >
      {icon}
      {children}
    </button>
  );
}

function SideLine({ side }: { side: "left" | "right" }) {
  return (
    <div
      className={`absolute top-[-10px] bottom-[-10px] ${side === "left" ? "-left-3" : "-right-3"} w-px`}
      style={{ background: "linear-gradient(to bottom, transparent, rgba(103,232,249,0.6) 50%, transparent)" }}
    />
  );
}

function DividerWithHyphens() {
  return (
    <div className="flex items-center gap-2 my-5">
      <span className="text-cyan-300/50 text-xs leading-none">–</span>
      <span className="h-px flex-1 bg-cyan-400/25" />
      <span className="text-cyan-300/50 text-xs leading-none">–</span>
    </div>
  );
}

function BeamBorder({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full max-w-sm">
      <div className="relative p-[2px] rounded-md overflow-hidden">
        <style>{`@keyframes beamSpin { to { transform: rotate(360deg); } }`}</style>
        <div
          className="absolute inset-[-60%] animate-[beamSpin_6s_linear_infinite]"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0%, transparent 3%, #22d3ee 15%, #e0f7ff 25%, #22d3ee 35%, transparent 47%, transparent 53%, #22d3ee 65%, #e0f7ff 75%, #22d3ee 85%, transparent 97%, transparent 100%)",
          }}
        />
        <div className="relative rounded-md bg-[#0a1524] px-8 py-8">{children}</div>
      </div>
      <SideLine side="left" />
      <SideLine side="right" />
    </div>
  );
}

function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen bg-[#050914] text-white flex items-center justify-center p-6 overflow-hidden">
      <div className="pointer-events-none fixed top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-600/15 rounded-full blur-[150px]" />
      <div className="pointer-events-none fixed bottom-[-15%] right-[5%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[130px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.75)_100%)]" />
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 3px)" }}
      />
      <div className="relative z-10 w-full max-w-sm px-6">
        <BeamBorder>{children}</BeamBorder>
      </div>
    </main>
  );
}

export default function SignupPage() {
  const [mode, setMode] = useState<"select" | "email">("select");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data: existing } = await supabase.from("profiles").select("username").eq("username", username).maybeSingle();
    if (existing) {
      setError("username already exists");
      setLoading(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username }, emailRedirectTo: `${window.location.origin}/` },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setSubmitted(true);
  }

  async function handleGoogleSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
  }

  if (submitted) {
    return (
      <AuthCard>
        <h1 className="text-center text-lg font-bold tracking-wide text-cyan-100">Check Your Email</h1>
        <DividerWithHyphens />
        <p className="text-center text-white/60 text-sm">
          We sent a confirmation link to <span className="text-white">{email}</span>. Click it to activate your account.
        </p>
      </AuthCard>
    );
  }

  if (mode === "email") {
    return (
      <AuthCard>
        <button onClick={() => setMode("select")} className="text-cyan-300/70 text-xs font-mono hover:text-cyan-200 mb-4">
          ← Back
        </button>
        <h1 className="text-center text-lg font-bold tracking-wide text-cyan-100">Sign Up with Email</h1>
        <DividerWithHyphens />

        <form onSubmit={handleSignup} className="space-y-3">
          <input
            type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full rounded-md bg-white/5 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/50"
          />
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-md bg-white/5 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/50"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 6 characters)"
              className="w-full rounded-md bg-white/5 border border-white/10 px-4 py-3 pr-11 text-sm focus:outline-none focus:border-cyan-400/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-md px-3 py-2">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="w-full rounded-md bg-cyan-400 text-black font-bold text-sm py-3 hover:bg-cyan-300 transition disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <h1 className="text-center text-lg font-bold tracking-wide text-cyan-100">Create Account</h1>
      <DividerWithHyphens />

      <div className="space-y-3">
        <FlatButton icon={<GoogleIcon />} onClick={handleGoogleSignIn}>
          Sign up with Google
        </FlatButton>
        <FlatButton icon={<EmailIcon />} onClick={() => setMode("email")}>
          Sign up with Email
        </FlatButton>
      </div>

      <div className="h-px w-full bg-cyan-400/10 my-6" />
      <p className="text-center text-white/40 text-xs">
        Already have an account?{" "}
        <a href="/login" className="text-cyan-300 hover:underline">Log in</a>
      </p>
    </AuthCard>
  );
}