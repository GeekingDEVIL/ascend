"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TrainHub() {
  const router = useRouter();
  useEffect(() => { router.replace("/workout"); }, [router]);
  return null;
}
