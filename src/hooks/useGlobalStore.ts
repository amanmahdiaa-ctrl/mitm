"use client";

import { useState, useCallback } from "react";
import type { LogEntry, DetectionAlert, AttackType, DashboardStats } from "@/types";

// مخزن عام مشترك عبر الصفحات
let globalLogs: LogEntry[] = [];
let globalAlerts: DetectionAlert[] = [];
let listeners: (() => void)[] = [];

function notify() {
  listeners.forEach((fn) => fn());
}

export function useGlobalStore() {
  const [, forceUpdate] = useState(0);

  const subscribe = useCallback(() => {
    const listener = () => forceUpdate((n) => n + 1);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  // استخدم useEffect داخل المكون إذا أردت الاشتراك

  const addLog = useCallback((entry: LogEntry) => {
    globalLogs = [entry, ...globalLogs];
    notify();
  }, []);

  const addAlert = useCallback((alert: DetectionAlert) => {
    globalAlerts = [alert, ...globalAlerts];
    notify();
  }, []);

  const triggerAlert = useCallback(
    (message: string, severity: DetectionAlert["severity"], attackType: AttackType) => {
      const alert: DetectionAlert = {
        id: crypto.randomUUID(),
        time: new Date().toLocaleTimeString("ar-SA"),
        message,
        severity,
        attackType,
      };
      addAlert(alert);
      return alert;
    },
    [addAlert]
  );

  const getStats = useCallback((): DashboardStats => {
    const totalAttacks = globalLogs.length;
    const stolenData = globalLogs.filter((l) => l.status === "intercepted").length;
    const blockedAttacks = globalLogs.filter((l) => l.status === "secure").length;
    const securityScore =
      totalAttacks === 0 ? 100 : Math.round((blockedAttacks / totalAttacks) * 100);
    return { totalAttacks, stolenData, securityScore, blockedAttacks };
  }, []);

  return {
    logs: globalLogs,
    alerts: globalAlerts,
    addLog,
    addAlert,
    triggerAlert,
    getStats,
    subscribe,
  };
}
