"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Play,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Eye,
  Gauge,
  Info,
  Wrench,
  Bug,
  Lock,
  Send,
  FileWarning,
  MailOpen,
  MailX,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowLeftRight,
  Server,
} from "lucide-react";
import PageShell from "@/components/PageShell";

/* ───── types & constants ───── */
type Phase =
  | "idle"
  | "composing"
  | "sending"
  | "intercepting"
  | "modifying"
  | "delivering"
  | "complete";
type Speed = "slow" | "normal" | "fast";

const SPEED_MAP: Record<Speed, number> = { slow: 2, normal: 1, fast: 0.5 };

const PHASE_LABELS: Record<Phase, string> = {
  idle: "في الانتظار",
  composing: "كتابة الرسالة",
  sending: "إرسال البريد",
  intercepting: "اعتراض الرسالة",
  modifying: "تعديل المحتوى",
  delivering: "تسليم الرسالة",
  complete: "اكتمل الهجوم",
};

const PHASE_LIST: Phase[] = [
  "idle",
  "composing",
  "sending",
  "intercepting",
  "modifying",
  "delivering",
  "complete",
];

const SVG_PHASE_LABELS: Record<Phase, string> = {
  idle: "Ready",
  composing: "Composing",
  sending: "Sending Email",
  intercepting: "Intercepting",
  modifying: "Modifying Content",
  delivering: "Delivering",
  complete: "Attack Complete",
};

const ORIGINAL_ACCOUNT = "SA80 1234 5678 9012 3456 7890";
const ATTACKER_ACCOUNT = "SA99 6660 0013 0066 6000 1337";
const ORIGINAL_IBAN = "SABB1234567890";
const ATTACKER_IBAN = "HACK6660001337";
const ORIGINAL_BENEFICIARY = "شركة التوريدات العالمية";
const ATTACKER_BENEFICIARY = "مؤسسة الخدمات التقنية";

const emailHeaders = [
  "From: CEO <ceo@company.com>",
  "To: finance@company.com",
  "Subject: =?UTF-8?B?2KrYrdmI2YrZhCDZhdin2YTZiiDYudin2KzZhA==?=",
  "Date: Wed, 16 Apr 2026 10:30:00 +0300",
  "Message-ID: <abc123@mail.company.com>",
  "X-Mailer: Microsoft Outlook 16.0",
  "MIME-Version: 1.0",
  "Content-Type: text/html; charset=UTF-8",
  "Received: from mail.company.com (192.168.1.10)",
  "  by smtp.attacker.com (10.0.0.66)",
  "DKIM-Signature: v=1; a=rsa-sha256; d=company.com",
  "Return-Path: <ceo@company.com>",
];

const suspiciousIndices = [8, 9, 10]; // Received & DKIM lines

const smtpHops = [
  { label: "Sender MUA", sub: "Outlook", icon: "💻" },
  { label: "Sender MTA", sub: "mail.company.com", icon: "📮" },
  { label: "Attacker MTA", sub: "smtp.attacker.com", icon: "💀" },
  { label: "Recipient MTA", sub: "mx.company.com", icon: "📬" },
  { label: "Recipient MUA", sub: "Webmail", icon: "📧" },
];

const analysisCards = [
  {
    icon: Info,
    title: "كيف يعمل اعتراض البريد (BEC)",
    color: "cyan",
    items: [
      "المهاجم يتسلل إلى خادم SMTP الوسيط أو يقوم بهجوم MitM",
      "يراقب المراسلات التجارية لفهم السياق والعلاقات",
      "يعترض رسائل محددة تحتوي على تفاصيل مالية",
      "يعدل محتوى الرسالة (أرقام حسابات، تفاصيل تحويل)",
      "يعيد إرسال الرسالة المعدلة للمستلم دون علمه",
    ],
  },
  {
    icon: Wrench,
    title: "الأدوات والتقنيات المستخدمة",
    color: "purple",
    items: [
      "Social Engineering Toolkit (SET)",
      "أدوات تحليل ترويسات البريد الإلكتروني",
      "SMTP relay manipulation & open relays",
      "DNS spoofing لتحويل حركة البريد",
      "Ettercap / mitmproxy لاعتراض SMTP",
    ],
  },
  {
    icon: Bug,
    title: "طرق الكشف والتحليل",
    color: "yellow",
    items: [
      "التحقق من سجلات DKIM/SPF/DMARC",
      "تحليل سلسلة Received في الترويسات",
      "مراقبة تغييرات مفاجئة في تفاصيل الحسابات",
      "كشف الشذوذ في أنماط المراسلة",
      "فحص Message-ID وتناسق النطاقات",
    ],
  },
  {
    icon: Lock,
    title: "الحماية والوقاية",
    color: "green",
    items: [
      "تفعيل التشفير من الطرف للطرف (PGP/S-MIME)",
      "إعداد سجلات DKIM و SPF و DMARC",
      "التحقق الهاتفي قبل التحويلات المالية الكبيرة",
      "استخدام STARTTLS لتشفير SMTP",
      "تدريب الموظفين على هجمات BEC",
    ],
  },
];

/* ───── component ───── */
export default function EmailHijackingPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [speed, setSpeed] = useState<Speed>("normal");
  const [progress, setProgress] = useState(0);
  const [dkimEnabled, setDkimEnabled] = useState(false);
  const [pgpEnabled, setPgpEnabled] = useState(false);
  const [envelopeX, setEnvelopeX] = useState(0);
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [showModified, setShowModified] = useState(false);
  const [charReplaceProgress, setCharReplaceProgress] = useState(0);
  const [activeSmtpHop, setActiveSmtpHop] = useState(-1);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const mult = SPEED_MAP[speed];
  const phaseIdx = PHASE_LIST.indexOf(phase);

  const cleanup = useCallback(() => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const t = (delay: number, fn: () => void) => {
    const id = setTimeout(fn, delay);
    timerRef.current.push(id);
  };

  const startSimulation = () => {
    cleanup();
    setProgress(0);
    setEnvelopeX(0);
    setEnvelopeOpen(false);
    setShowModified(false);
    setCharReplaceProgress(0);
    setActiveSmtpHop(-1);

    if (pgpEnabled) {
      setPhase("composing");
      t(1500 * mult, () => setPhase("sending"));
      t(2000 * mult, () => { setActiveSmtpHop(0); });
      t(2500 * mult, () => { setActiveSmtpHop(1); setEnvelopeX(25); });
      t(3500 * mult, () => { setPhase("intercepting"); setActiveSmtpHop(2); setEnvelopeX(50); });
      t(5500 * mult, () => {
        setPhase("complete");
        setActiveSmtpHop(4);
        setEnvelopeX(100);
      });
      const total = 6000 * mult;
      for (let i = 0; i <= 50; i++) {
        t((i / 50) * total, () => setProgress(Math.min((i / 50) * 100, 100)));
      }
      return;
    }

    setPhase("composing");
    t(2500 * mult, () => { setPhase("sending"); setActiveSmtpHop(0); });
    t(3500 * mult, () => { setActiveSmtpHop(1); setEnvelopeX(20); });
    t(5000 * mult, () => { setPhase("intercepting"); setActiveSmtpHop(2); setEnvelopeX(48); setEnvelopeOpen(true); });
    t(7500 * mult, () => { setPhase("modifying"); });
    for (let i = 0; i <= 10; i++) {
      t((7500 + i * 300) * mult, () => setCharReplaceProgress(i * 10));
    }
    t(11000 * mult, () => { setShowModified(true); setEnvelopeOpen(false); });
    t(12000 * mult, () => { setPhase("delivering"); setActiveSmtpHop(3); setEnvelopeX(75); });
    t(14000 * mult, () => { setActiveSmtpHop(4); setEnvelopeX(100); });
    t(15000 * mult, () => { setPhase("complete"); });

    if (dkimEnabled) {
      t(15500 * mult, () => {});
    }

    const total = 16000 * mult;
    for (let i = 0; i <= 80; i++) {
      t((i / 80) * total, () => setProgress(Math.min((i / 80) * 100, 100)));
    }
  };

  const reset = () => {
    cleanup();
    setPhase("idle");
    setProgress(0);
    setEnvelopeX(0);
    setEnvelopeOpen(false);
    setShowModified(false);
    setCharReplaceProgress(0);
    setActiveSmtpHop(-1);
  };

  const isActive = phase !== "idle";
  const blocked = pgpEnabled && (phase === "intercepting" || phase === "complete") && pgpEnabled;
  const flagged = dkimEnabled && phase === "complete";

  /* ───── interpolated account during modification ───── */
  const getInterpolatedAccount = () => {
    const orig = ORIGINAL_ACCOUNT.replace(/\s/g, "");
    const atk = ATTACKER_ACCOUNT.replace(/\s/g, "");
    const p = charReplaceProgress / 100;
    const switchIdx = Math.floor(p * orig.length);
    let result = "";
    for (let i = 0; i < orig.length; i++) {
      result += i < switchIdx ? atk[i] || orig[i] : orig[i];
    }
    return result.replace(/(.{4})/g, "$1 ").trim();
  };

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
        {/* ===== HEADER ===== */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <Mail className="w-9 h-9 text-cyan-400" />
            <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-cyan-400 via-purple-400 to-red-400 bg-clip-text text-transparent">
              اعتراض وتعديل البريد الإلكتروني
            </h1>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
            هجوم اعتراض البريد الإلكتروني (BEC) يسمح للمهاجم باعتراض الرسائل أثناء
            انتقالها عبر خوادم SMTP وتعديل محتواها، مثل تغيير تفاصيل التحويلات المالية
          </p>
        </motion.div>

        {/* ===== INTERACTIVE EMAIL FLOW SVG ===== */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-950/80 border border-gray-700/50 rounded-2xl p-4 mb-8 overflow-hidden"
        >
          <h2 className="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            المشهد التفاعلي لاعتراض البريد
          </h2>
          <svg viewBox="0 0 900 400" className="w-full h-auto">
            <defs>
              <filter id="glow-cyan-e">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glow-red-e">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="grad-cyan-e" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="grad-red-e" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
              <linearGradient id="grad-green-e" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#16a34a" />
              </linearGradient>
            </defs>

            {/* connection lines */}
            <line x1="150" y1="200" x2="750" y2="200" stroke="#1f2937" strokeWidth="2" strokeDasharray="6 4" />
            <line x1="450" y1="200" x2="450" y2="100" stroke="#1f2937" strokeWidth="2" strokeDasharray="6 4" />

            {/* Sender */}
            <g>
              <rect x="60" y="160" width="140" height="80" rx="12" fill="#111827" stroke={phaseIdx >= 1 ? "#22d3ee" : "#374151"} strokeWidth="2" />
              <text x="130" y="195" textAnchor="middle" fill="#22d3ee" fontSize="14" fontWeight="bold">Sender</text>
              <text x="130" y="220" textAnchor="middle" fill="#9ca3af" fontSize="9">ceo@company.com</text>
              {phaseIdx >= 1 && (
                <motion.circle cx="130" cy="155" r="4" fill="#22d3ee" initial={{ scale: 0 }} animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 2 }} />
              )}
            </g>

            {/* Attacker */}
            <g>
              <rect x="370" y="50" width="160" height="80" rx="12" fill="#111827" stroke={phaseIdx >= 3 ? "#ef4444" : "#374151"} strokeWidth="2" />
              <text x="450" y="82" textAnchor="middle" fill="#ef4444" fontSize="14" fontWeight="bold">☠ Attacker</text>
              <text x="450" y="105" textAnchor="middle" fill="#9ca3af" fontSize="9">smtp.attacker.com</text>
              {phaseIdx >= 3 && phaseIdx < 6 && (
                <motion.rect x="370" y="50" width="160" height="80" rx="12" fill="none" stroke="#ef4444" strokeWidth="2"
                  initial={{ opacity: 0.3 }} animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} />
              )}
            </g>

            {/* Recipient */}
            <g>
              <rect x="670" y="160" width="150" height="80" rx="12" fill="#111827" stroke={phaseIdx >= 5 ? "#22c55e" : "#374151"} strokeWidth="2" />
              <text x="745" y="195" textAnchor="middle" fill="#22c55e" fontSize="14" fontWeight="bold">Recipient</text>
              <text x="745" y="220" textAnchor="middle" fill="#9ca3af" fontSize="9">finance@company.com</text>
            </g>

            {/* Envelope */}
            {isActive && (
              <motion.g
                animate={{ x: (envelopeX / 100) * 550 + 150 - 20 }}
                transition={{ type: "spring", stiffness: 50, damping: 15 }}
              >
                {/* envelope body */}
                <rect x="0" y="180" width="40" height="28" rx="3" fill={showModified ? "#fca5a5" : "#fde68a"} stroke={showModified ? "#ef4444" : "#f59e0b"} strokeWidth="1.5" />
                {/* envelope flap */}
                <motion.path
                  d={envelopeOpen ? "M0,180 L20,168 L40,180" : "M0,180 L20,195 L40,180"}
                  fill={envelopeOpen ? "none" : showModified ? "#fecaca" : "#fef3c7"}
                  stroke={showModified ? "#ef4444" : "#f59e0b"}
                  strokeWidth="1.5"
                  transition={{ duration: 0.5 }}
                />
                {/* seal */}
                {!envelopeOpen && (
                  <circle cx="20" cy={showModified ? "190" : "190"} r="4" fill={showModified ? "#ef4444" : "#f59e0b"} />
                )}
                {/* PGP lock icon on envelope */}
                {pgpEnabled && (
                  <text x="20" y="200" fontSize="12" textAnchor="middle">🔒</text>
                )}
              </motion.g>
            )}

            {/* Intercept line when active */}
            {phaseIdx >= 3 && phaseIdx <= 4 && !pgpEnabled && (
              <motion.line x1="450" y1="130" x2="450" y2="185"
                stroke="#ef4444" strokeWidth="2"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 0.5 }}
              />
            )}

            {/* PGP shield block */}
            {pgpEnabled && phaseIdx >= 3 && (
              <g>
                <motion.rect x="410" y="140" width="80" height="35" rx="6" fill="#16a34a" fillOpacity="0.2" stroke="#22c55e" strokeWidth="2"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                <text x="450" y="162" textAnchor="middle" fill="#22c55e" fontSize="11" fontWeight="bold">🔒 Encrypted</text>
              </g>
            )}

            {/* Phase label */}
            <text x="450" y="310" textAnchor="middle" fill="#d1d5db" fontSize="14" fontWeight="bold">
              {SVG_PHASE_LABELS[phase]}
            </text>

            {/* composing email preview */}
            {phase === "composing" && (
              <motion.g initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <rect x="40" y="260" width="220" height="90" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                <text x="55" y="280" fill="#94a3b8" fontSize="9">From: ceo@company.com</text>
                <text x="55" y="295" fill="#94a3b8" fontSize="9">To: finance@company.com</text>
                <text x="55" y="310" fill="#fbbf24" fontSize="9">Subject: Urgent Transfer</text>
                <text x="55" y="330" fill="#d1d5db" fontSize="8">Please transfer amount to account...</text>
              </motion.g>
            )}

            {/* modifying preview */}
            {phase === "modifying" && !pgpEnabled && (
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <rect x="340" y="260" width="230" height="100" rx="8" fill="#1e293b" stroke="#ef4444" strokeWidth="1.5" />
                <text x="355" y="280" fill="#ef4444" fontSize="10" fontWeight="bold">⚠ Modifying Content...</text>
                <text x="355" y="300" fill="#94a3b8" fontSize="9">Original Account:</text>
                <text x="355" y="315" fill="#4ade80" fontSize="8" textDecoration="line-through">{ORIGINAL_ACCOUNT}</text>
                <text x="355" y="332" fill="#94a3b8" fontSize="9">Modified Account:</text>
                <motion.text x="355" y="347" fill="#ef4444" fontSize="8" fontWeight="bold"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                  {getInterpolatedAccount()}
                </motion.text>
              </motion.g>
            )}

            {/* DKIM flag at complete */}
            {flagged && (
              <motion.g initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                <rect x="620" y="260" width="220" height="40" rx="8" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" />
                <text x="730" y="285" textAnchor="middle" fill="#fca5a5" fontSize="10" fontWeight="bold">⚠ DKIM/SPF Verification Failed</text>
              </motion.g>
            )}
          </svg>
        </motion.div>

        {/* ===== CONTROL PANEL ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-5 mb-8"
        >
          <div className="flex flex-wrap items-center gap-4 justify-between">
            {/* buttons */}
            <div className="flex gap-3">
              <button
                onClick={isActive ? reset : startSimulation}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  isActive
                    ? "bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30"
                    : "bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-600/30"
                }`}
              >
                {isActive ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isActive ? "إعادة تعيين" : "بدء المحاكاة"}
              </button>
            </div>

            {/* speed */}
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-sm">السرعة:</span>
              {(["slow", "normal", "fast"] as Speed[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    speed === s
                      ? "bg-cyan-600/30 text-cyan-300 border border-cyan-500/40"
                      : "bg-gray-800 text-gray-500 border border-gray-700 hover:border-gray-600"
                  }`}
                >
                  {s === "slow" ? "بطيء" : s === "normal" ? "عادي" : "سريع"}
                </button>
              ))}
            </div>

            {/* toggles */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm text-gray-400">DKIM/SPF/DMARC</span>
                <div
                  onClick={() => !isActive && setDkimEnabled(!dkimEnabled)}
                  className={`w-10 h-5 rounded-full transition-all relative cursor-pointer ${
                    dkimEnabled ? "bg-green-600" : "bg-gray-700"
                  }`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${dkimEnabled ? "right-0.5" : "right-5"}`} />
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm text-gray-400">تشفير PGP</span>
                <div
                  onClick={() => !isActive && setPgpEnabled(!pgpEnabled)}
                  className={`w-10 h-5 rounded-full transition-all relative cursor-pointer ${
                    pgpEnabled ? "bg-green-600" : "bg-gray-700"
                  }`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${pgpEnabled ? "right-0.5" : "right-5"}`} />
                </div>
              </label>
            </div>
          </div>

          {/* Phase indicator + progress */}
          <div className="mt-4">
            <div className="flex items-center gap-1 mb-2 overflow-x-auto pb-1">
              {PHASE_LIST.map((p, i) => (
                <div key={p} className="flex items-center shrink-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    i <= phaseIdx
                      ? i === phaseIdx
                        ? "bg-cyan-600/30 border-cyan-400 text-cyan-300"
                        : "bg-cyan-900/30 border-cyan-700 text-cyan-500"
                      : "bg-gray-800 border-gray-700 text-gray-600"
                  }`}>
                    {i + 1}
                  </div>
                  {i < PHASE_LIST.length - 1 && (
                    <div className={`w-6 h-0.5 mx-0.5 ${i < phaseIdx ? "bg-cyan-700" : "bg-gray-800"}`} />
                  )}
                </div>
              ))}
              <span className="text-sm text-cyan-400 mr-2 shrink-0">{PHASE_LABELS[phase]}</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-linear-to-r from-cyan-500 to-purple-500 rounded-full"
                style={{ width: `${progress}%` }}
                transition={{ ease: "linear" }}
              />
            </div>
          </div>
        </motion.div>

        {/* ===== EMAIL COMPARISON ===== */}
        <AnimatePresence>
          {(phase === "complete" || phase === "delivering") && !pgpEnabled && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="grid md:grid-cols-2 gap-6 mb-8"
            >
              {/* Original */}
              <div className="bg-gray-950/80 border-2 border-green-600/50 rounded-2xl p-5">
                <h3 className="text-green-400 font-bold text-lg mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  الرسالة الأصلية
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-700/50">
                    <p className="text-gray-400 text-xs mb-1">من:</p>
                    <p className="text-gray-200">CEO &lt;ceo@company.com&gt;</p>
                  </div>
                  <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-700/50">
                    <p className="text-gray-400 text-xs mb-1">إلى:</p>
                    <p className="text-gray-200">finance@company.com</p>
                  </div>
                  <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-700/50">
                    <p className="text-gray-400 text-xs mb-1">الموضوع:</p>
                    <p className="text-yellow-300">تحويل مالي عاجل</p>
                  </div>
                  <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-700/50">
                    <p className="text-gray-400 text-xs mb-1">المحتوى:</p>
                    <p className="text-gray-300 leading-relaxed text-xs">
                      الرجاء تحويل مبلغ 250,000 ريال إلى الحساب التالي لإتمام صفقة التوريد:
                    </p>
                    <div className="mt-2 p-2 bg-green-900/20 rounded border border-green-700/30">
                      <p className="text-gray-400 text-xs">رقم الحساب:</p>
                      <p className="text-green-400 font-mono text-xs font-bold">{ORIGINAL_ACCOUNT}</p>
                      <p className="text-gray-400 text-xs mt-1">IBAN:</p>
                      <p className="text-green-400 font-mono text-xs font-bold">{ORIGINAL_IBAN}</p>
                      <p className="text-gray-400 text-xs mt-1">المستفيد:</p>
                      <p className="text-green-400 text-xs font-bold">{ORIGINAL_BENEFICIARY}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modified */}
              <div className="bg-gray-950/80 border-2 border-red-600/50 rounded-2xl p-5">
                <h3 className="text-red-400 font-bold text-lg mb-4 flex items-center gap-2">
                  <MailX className="w-5 h-5" />
                  الرسالة المعدّلة
                  {flagged && (
                    <span className="mr-auto bg-red-900/40 text-red-400 text-xs px-2 py-1 rounded-full border border-red-700/50">
                      ⚠ مشبوهة
                    </span>
                  )}
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-700/50">
                    <p className="text-gray-400 text-xs mb-1">من:</p>
                    <p className="text-gray-200">CEO &lt;ceo@company.com&gt;</p>
                  </div>
                  <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-700/50">
                    <p className="text-gray-400 text-xs mb-1">إلى:</p>
                    <p className="text-gray-200">finance@company.com</p>
                  </div>
                  <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-700/50">
                    <p className="text-gray-400 text-xs mb-1">الموضوع:</p>
                    <p className="text-yellow-300">تحويل مالي عاجل</p>
                  </div>
                  <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-700/50">
                    <p className="text-gray-400 text-xs mb-1">المحتوى:</p>
                    <p className="text-gray-300 leading-relaxed text-xs">
                      الرجاء تحويل مبلغ 250,000 ريال إلى الحساب التالي لإتمام صفقة التوريد:
                    </p>
                    <div className="mt-2 p-2 bg-red-900/20 rounded border border-red-700/30">
                      <p className="text-gray-400 text-xs">رقم الحساب:</p>
                      <p className="text-red-400 font-mono text-xs font-bold bg-yellow-900/30 px-1 rounded">{ATTACKER_ACCOUNT}</p>
                      <p className="text-gray-400 text-xs mt-1">IBAN:</p>
                      <p className="text-red-400 font-mono text-xs font-bold bg-yellow-900/30 px-1 rounded">{ATTACKER_IBAN}</p>
                      <p className="text-gray-400 text-xs mt-1">المستفيد:</p>
                      <p className="text-red-400 text-xs font-bold bg-yellow-900/30 px-1 rounded">{ATTACKER_BENEFICIARY}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== PGP BLOCK MESSAGE ===== */}
        <AnimatePresence>
          {pgpEnabled && phase === "complete" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-green-900/20 border-2 border-green-500/40 rounded-2xl p-6 mb-8 text-center"
            >
              <Lock className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <h3 className="text-green-400 font-bold text-xl mb-2">التشفير من الطرف للطرف (PGP) منع الهجوم!</h3>
              <p className="text-gray-400 max-w-lg mx-auto">
                المهاجم اعترض الرسالة لكنها مشفرة بالكامل. لا يمكنه قراءة أو تعديل المحتوى
                بدون المفتاح الخاص للمستلم. الرسالة وصلت سليمة ومحمية.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== EMAIL HEADER INSPECTOR ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-950/80 border border-gray-700/50 rounded-2xl p-5 mb-8"
        >
          <h2 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
            <FileWarning className="w-5 h-5" />
            فاحص ترويسات البريد الإلكتروني
          </h2>
          <div className="bg-gray-900/80 rounded-xl p-4 font-mono text-xs leading-relaxed overflow-x-auto border border-gray-800">
            {emailHeaders.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className={`py-0.5 px-2 rounded ${
                  suspiciousIndices.includes(i)
                    ? "bg-red-900/30 text-red-300 border-r-2 border-red-500"
                    : "text-gray-400"
                }`}
              >
                {line}
                {suspiciousIndices.includes(i) && (
                  <span className="mr-2 text-red-400 text-[10px]">⚠ مشبوه</span>
                )}
              </motion.div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs bg-red-900/30 text-red-400 px-2 py-1 rounded-full border border-red-700/40">
              ⚠ سلسلة Received تمر عبر خادم مشبوه
            </span>
            <span className="text-xs bg-yellow-900/30 text-yellow-400 px-2 py-1 rounded-full border border-yellow-700/40">
              ⚠ توقيع DKIM قد لا يتطابق بعد التعديل
            </span>
          </div>
        </motion.div>

        {/* ===== SMTP FLOW DIAGRAM ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-gray-950/80 border border-gray-700/50 rounded-2xl p-5 mb-8"
        >
          <h2 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5" />
            مسار ترحيل SMTP
          </h2>
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
            {smtpHops.map((hop, i) => (
              <div key={i} className="flex items-center shrink-0">
                <motion.div
                  className={`flex flex-col items-center p-3 rounded-xl border-2 min-w-25 transition-all ${
                    i === 2
                      ? activeSmtpHop >= 2
                        ? "border-red-500 bg-red-950/40 shadow-lg shadow-red-900/20"
                        : "border-red-800/40 bg-gray-900/60"
                      : activeSmtpHop >= i
                        ? "border-cyan-500 bg-cyan-950/30"
                        : "border-gray-700/50 bg-gray-900/60"
                  }`}
                  animate={activeSmtpHop === i ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ repeat: activeSmtpHop === i ? Infinity : 0, duration: 1 }}
                >
                  <span className="text-2xl mb-1">{hop.icon}</span>
                  <span className={`text-xs font-bold ${i === 2 ? "text-red-400" : "text-gray-300"}`}>
                    {hop.label}
                  </span>
                  <span className="text-[10px] text-gray-500 mt-0.5">{hop.sub}</span>
                </motion.div>
                {i < smtpHops.length - 1 && (
                  <div className="flex flex-col items-center mx-1 shrink-0">
                    <motion.div
                      className={`w-8 h-0.5 ${
                        activeSmtpHop > i ? (i === 1 || i === 2 ? "bg-red-500" : "bg-cyan-500") : "bg-gray-700"
                      }`}
                      animate={activeSmtpHop === i ? { opacity: [0.4, 1, 0.4] } : {}}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                    />
                    <span className={`text-[9px] mt-0.5 ${
                      activeSmtpHop > i && (i === 0 || i === 3)
                        ? "text-green-500"
                        : activeSmtpHop > i
                          ? "text-red-500"
                          : "text-gray-600"
                    }`}>
                      {activeSmtpHop > i && (i === 0 || i === 3) ? "STARTTLS ✓" : activeSmtpHop > i ? "بدون TLS ✗" : "SMTP"}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
            <Server className="w-3.5 h-3.5" />
            <span>المهاجم يتحكم في MTA وسيط - لا يتم تشفير الاتصال بين MTA المرسل و MTA المهاجم</span>
          </div>
        </motion.div>

        {/* ===== ANALYSIS CARDS ===== */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {analysisCards.map((card, i) => {
            const Icon = card.icon;
            const colorMap: Record<string, { border: string; text: string; bg: string; icon: string }> = {
              cyan:   { border: "border-cyan-700/40", text: "text-cyan-400", bg: "bg-cyan-900/10", icon: "text-cyan-400" },
              purple: { border: "border-purple-700/40", text: "text-purple-400", bg: "bg-purple-900/10", icon: "text-purple-400" },
              yellow: { border: "border-yellow-700/40", text: "text-yellow-400", bg: "bg-yellow-900/10", icon: "text-yellow-400" },
              green:  { border: "border-green-700/40", text: "text-green-400", bg: "bg-green-900/10", icon: "text-green-400" },
            };
            const c = colorMap[card.color];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className={`bg-gray-950/80 border ${c.border} rounded-2xl p-5`}
              >
                <h3 className={`${c.text} font-bold text-base mb-3 flex items-center gap-2`}>
                  <Icon className={`w-5 h-5 ${c.icon}`} />
                  {card.title}
                </h3>
                <ul className="space-y-2">
                  {card.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-400">
                      <span className={`mt-1.5 w-1.5 h-1.5 rounded-full ${c.bg.replace("/10", "/60")} shrink-0`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
