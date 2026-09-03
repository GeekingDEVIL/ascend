"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";
import ActiveSessionBar from "../components/ActiveSessionBar";
import { AuthProvider, useAuth } from "../lib/AuthProvider";
import { applyAccent } from "../lib/theme";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#04050a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border border-white/10 flex items-center justify-center font-bold text-sm text-white/30 rounded shimmer">A</div>
          <div className="h-1 w-24 rounded-full bg-white/[0.06] shimmer" />
        </div>
      </div>
    );
  }
  if (!user) return null;
  return <>{children}</>;
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    applyAccent(localStorage.getItem("ascend_accent"));
  }, []);

  return (
    <AuthProvider>
      <AuthGuard>
        <ActiveSessionBar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 min-h-screen min-w-0 relative">
            <div className="page-ambient" />
            <div className="relative z-10">{children}</div>
          </main>
          <MobileNav />
        </div>
      </AuthGuard>
    </AuthProvider>
  );
}
