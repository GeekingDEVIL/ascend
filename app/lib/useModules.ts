"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "./AuthProvider";
import { useSex } from "./useSex";
import { supabase } from "./supabase";
import {
  type ModuleKey,
  CORE_MODULES,
  MODULE_REGISTRY,
  ALL_MODULES,
  DEFAULT_ENABLED,
} from "./modules";

const MODULES_KEY = "ascend_modules";
const MODULES_EVENT = "ascend:modules-changed";

export function useModules() {
  const { user } = useAuth();
  const { sex } = useSex();
  const [optionalKeys, setOptionalKeys] = useState<ModuleKey[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(MODULES_KEY);
      if (stored) {
        try { return JSON.parse(stored) as ModuleKey[]; } catch { /* fall through */ }
      }
    }
    return DEFAULT_ENABLED.filter(
      (k) => !CORE_MODULES.some((m) => m.key === k),
    );
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_modules")
      .select("module_key")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const keys = data.map((r) => r.module_key as ModuleKey);
          setOptionalKeys(keys);
          localStorage.setItem(MODULES_KEY, JSON.stringify(keys));
        }
        setLoaded(true);
      });
  }, [user]);

  useEffect(() => {
    const handler = () => {
      const stored = localStorage.getItem(MODULES_KEY);
      if (stored) {
        try { setOptionalKeys(JSON.parse(stored)); } catch { /* ignore */ }
      }
    };
    window.addEventListener(MODULES_EVENT, handler);
    return () => window.removeEventListener(MODULES_EVENT, handler);
  }, []);

  const coreKeys = useMemo(
    () => CORE_MODULES.map((m) => m.key),
    [],
  );

  const enabledKeys = useMemo(
    () => [...coreKeys, ...optionalKeys].filter((k) => {
      const mod = MODULE_REGISTRY[k];
      if (mod.sexGate && mod.sexGate !== sex) return false;
      return true;
    }),
    [coreKeys, optionalKeys, sex],
  );

  const visibleModules = useMemo(
    () => ALL_MODULES.filter((m) => !m.sexGate || m.sexGate === sex),
    [sex],
  );

  const isEnabled = useCallback(
    (key: ModuleKey) => enabledKeys.includes(key),
    [enabledKeys],
  );

  const toggleModule = useCallback(
    async (key: ModuleKey) => {
      const mod = MODULE_REGISTRY[key];
      if (mod.core) return;

      const alreadyOn = optionalKeys.includes(key);
      const next = alreadyOn
        ? optionalKeys.filter((k) => k !== key)
        : [...optionalKeys, key];

      setOptionalKeys(next);
      localStorage.setItem(MODULES_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(MODULES_EVENT));

      if (!user) return;
      if (alreadyOn) {
        await supabase
          .from("user_modules")
          .delete()
          .eq("user_id", user.id)
          .eq("module_key", key);
      } else {
        await supabase
          .from("user_modules")
          .upsert({ user_id: user.id, module_key: key });
      }
    },
    [user, optionalKeys],
  );

  return { enabledKeys, visibleModules, isEnabled, toggleModule, loaded };
}
