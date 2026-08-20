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
      <div className="min-h-screen bg-[#04050a] flex items-center justify-center text-white/40 text-sm font-mono">
        Loading...
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
          <main className="flex-1 min-h-screen min-w-0">{children}</main>
          <MobileNav />
        </div>
      </AuthGuard>
    </AuthProvider>
  );
}
