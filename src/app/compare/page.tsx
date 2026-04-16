"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Columns2,
  Shield,
  ShieldOff,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Wifi,
  WifiOff,
  CheckCircle,
  XCircle,
} from "lucide-react";
import PageShell from "@/components/PageShell";

type CompareMode = "protocol" | "password";

export default function ComparePage() {
  const [mode, setMode] = useState<CompareMode>("protocol");

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* العنوان */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <Columns2 className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold shimmer-text">وضع المقارنة</h1>
          </div>
          <p className="text-gray-500">قارن بين السيناريوهات الآمنة وغير الآمنة جنباً إلى جنب</p>
        </motion.div>

        {/* اختيار وضع المقارنة */}
        <div className="flex justify-center gap-4 mb-8">
          {([
            { key: "protocol", label: "HTTP مقابل HTTPS", icon: Wifi },
            { key: "password", label: "كلمات المرور", icon: Lock },
          ] as const).map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium cursor-pointer transition-all ${
                mode === m.key
                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                  : "bg-gray-800/50 text-gray-500 border border-gray-700/30 hover:bg-gray-800"
              }`}
            >
              <m.icon className="w-5 h-5" />
              {m.label}
            </button>
          ))}
        </div>

        {/* المقارنة */}
        {mode === "protocol" ? <ProtocolCompare /> : <PasswordCompare />}
      </div>
    </PageShell>
  );
}

function ProtocolCompare() {
  const scenarios = [
    {
      title: "HTTP - غير آمن",
      icon: WifiOff,
      color: "red",
      features: [
        { label: "تشفير البيانات", status: false, detail: "نص عادي - يمكن قراءته" },
        { label: "حماية من MITM", status: false, detail: "عُرضة للاعتراض" },
        { label: "شهادة SSL", status: false, detail: "غير متوفرة" },
        { label: "سلامة البيانات", status: false, detail: "يمكن التلاعب بها" },
        { label: "المصادقة", status: false, detail: "لا يوجد تحقق من الهوية" },
        { label: "ثقة المتصفح", status: false, detail: "تحذير \"غير آمن\"" },
      ],
    },
    {
      title: "HTTPS - آمن",
      icon: Shield,
      color: "green",
      features: [
        { label: "تشفير البيانات", status: true, detail: "مشفر بـ TLS 1.3" },
        { label: "حماية من MITM", status: true, detail: "اعتراض مستحيل عملياً" },
        { label: "شهادة SSL", status: true, detail: "شهادة موثقة" },
        { label: "سلامة البيانات", status: true, detail: "محمية من التلاعب" },
        { label: "المصادقة", status: true, detail: "هوية الخادم مؤكدة" },
        { label: "ثقة المتصفح", status: true, detail: "رمز القفل الأخضر 🔒" },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {scenarios.map((scenario, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: idx === 0 ? 50 : -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.15 }}
          className={`rounded-2xl p-6 border backdrop-blur-xl ${
            scenario.color === "red"
              ? "bg-red-950/20 border-red-500/20"
              : "bg-emerald-950/20 border-emerald-500/20"
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                scenario.color === "red"
                  ? "bg-red-500/20"
                  : "bg-emerald-500/20"
              }`}
            >
              <scenario.icon
                className={`w-6 h-6 ${
                  scenario.color === "red" ? "text-red-400" : "text-emerald-400"
                }`}
              />
            </div>
            <h3
              className={`text-xl font-bold ${
                scenario.color === "red" ? "text-red-400" : "text-emerald-400"
              }`}
            >
              {scenario.title}
            </h3>
          </div>

          {/* محاكاة البيانات */}
          <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800/50 mb-4 font-mono text-xs" dir="ltr">
            {scenario.color === "red" ? (
              <div className="space-y-1 text-red-400/80">
                <p>GET /login HTTP/1.1</p>
                <p>Host: example.com</p>
                <p className="text-red-300 font-bold">username=admin&password=123456</p>
                <p className="text-gray-600">← يمكن قراءة البيانات بسهولة</p>
              </div>
            ) : (
              <div className="space-y-1 text-emerald-400/80">
                <p>TLS 1.3 Handshake Complete</p>
                <p>Cipher: AES-256-GCM</p>
                <p className="text-emerald-300 font-bold">xK9#mP2...[ENCRYPTED]...f8$</p>
                <p className="text-gray-600">← مشفر بالكامل</p>
              </div>
            )}
          </div>

          {/* الميزات */}
          <div className="space-y-3">
            {scenario.features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800/30"
              >
                {f.status ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                )}
                <div className="flex-1">
                  <span className="text-sm text-gray-200">{f.label}</span>
                  <p className="text-xs text-gray-500">{f.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function PasswordCompare() {
  const scenarios = [
    {
      title: "كلمة مرور ضعيفة",
      icon: Unlock,
      color: "red",
      password: "123456",
      entropy: 19.5,
      crackTime: "أقل من ثانية",
      features: [
        { label: "الطول", value: "6 أحرف", bad: true },
        { label: "التعقيد", value: "أرقام فقط", bad: true },
        { label: "في قوائم المعروفة", value: "نعم - الأولى عالمياً", bad: true },
        { label: "قابلة للتخمين", value: "نعم - بسهولة", bad: true },
        { label: "مقاومة القاموس", value: "صفر", bad: true },
      ],
    },
    {
      title: "كلمة مرور قوية",
      icon: Lock,
      color: "green",
      password: "H&k9$mP2!xR@5",
      entropy: 85.6,
      crackTime: "+100 سنة",
      features: [
        { label: "الطول", value: "13 حرفاً", bad: false },
        { label: "التعقيد", value: "أحرف + أرقام + رموز", bad: false },
        { label: "في قوائم المعروفة", value: "لا", bad: false },
        { label: "قابلة للتخمين", value: "مستحيل عملياً", bad: false },
        { label: "مقاومة القاموس", value: "ممتازة", bad: false },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {scenarios.map((scenario, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.15 }}
          className={`rounded-2xl p-6 border backdrop-blur-xl ${
            scenario.color === "red"
              ? "bg-red-950/20 border-red-500/20"
              : "bg-emerald-950/20 border-emerald-500/20"
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                scenario.color === "red" ? "bg-red-500/20" : "bg-emerald-500/20"
              }`}
            >
              <scenario.icon
                className={`w-6 h-6 ${
                  scenario.color === "red" ? "text-red-400" : "text-emerald-400"
                }`}
              />
            </div>
            <h3
              className={`text-xl font-bold ${
                scenario.color === "red" ? "text-red-400" : "text-emerald-400"
              }`}
            >
              {scenario.title}
            </h3>
          </div>

          {/* كلمة المرور */}
          <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800/50 mb-4 text-center">
            <p className="text-xs text-gray-500 mb-1">كلمة المرور</p>
            <p className={`font-mono text-2xl font-bold ${
              scenario.color === "red" ? "text-red-400" : "text-emerald-400"
            }`} dir="ltr">
              {scenario.password}
            </p>
          </div>

          {/* الاحصائيات */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-800/40 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">الإنتروبي</p>
              <p className={`text-lg font-bold ${
                scenario.color === "red" ? "text-red-400" : "text-emerald-400"
              }`}>
                {scenario.entropy} bit
              </p>
            </div>
            <div className="bg-gray-800/40 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">وقت الاختراق</p>
              <p className={`text-lg font-bold ${
                scenario.color === "red" ? "text-red-400" : "text-emerald-400"
              }`}>
                {scenario.crackTime}
              </p>
            </div>
          </div>

          {/* التفاصيل */}
          <div className="space-y-2">
            {scenario.features.map((f, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800/30 text-sm">
                <span className="text-gray-400">{f.label}</span>
                <span className={f.bad ? "text-red-400" : "text-emerald-400"}>
                  {f.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
