"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cookie,
  Play,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  Monitor,
  Server,
  Skull,
  Eye,
  Gauge,
  Info,
  Wrench,
  Bug,
  Lock,
  ToggleLeft,
  ToggleRight,
  Globe,
  User,
  KeyRound,
} from "lucide-react";
import PageShell from "@/components/PageShell";

type Phase = "idle" | "auth" | "cookie-set" | "sniffing" | "stolen" | "hijacked";
type Speed = "slow" | "normal" | "fast";

const SPEED_MAP: Record<Speed, number> = { slow: 2, normal: 1, fast: 0.5 };

const SESSION_ID = "abc123def456";
const FULL_COOKIE = `PHPSESSID=${SESSION_ID}`;

const terminalLines = [
  { cmd: "$ wireshark -i eth0 -f \"tcp port 80\"", phase: "auth" as Phase },
  { cmd: "[*] بدء التقاط الحزم على الواجهة eth0...", phase: "auth" as Phase },
  { cmd: "$ tshark -i eth0 -Y \"http.cookie\" -T fields -e http.cookie", phase: "sniffing" as Phase },
  { cmd: "[*] مراقبة ملفات تعريف الارتباط في حركة المرور...", phase: "sniffing" as Phase },
  { cmd: `[!] تم التقاط Cookie: ${FULL_COOKIE}`, phase: "sniffing" as Phase },
  { cmd: "$ ferret -i eth0", phase: "sniffing" as Phase },
  { cmd: "[*] استخراج بيانات الجلسات من الحزم...", phase: "stolen" as Phase },
  { cmd: "$ hamster", phase: "stolen" as Phase },
  { cmd: "[*] تشغيل خادم Hamster على المنفذ 1234...", phase: "stolen" as Phase },
  { cmd: `[✓] تم استنساخ الجلسة بنجاح! PHPSESSID=${SESSION_ID}`, phase: "stolen" as Phase },
  { cmd: `$ curl -H "Cookie: ${FULL_COOKIE}" https://target.com/dashboard`, phase: "hijacked" as Phase },
  { cmd: "[>] HTTP/1.1 200 OK — مرحباً بك يا أحمد!", phase: "hijacked" as Phase },
  { cmd: "[!] تم اختطاف الجلسة — المهاجم يتصفح كالضحية", phase: "hijacked" as Phase },
];

const phaseLabels: Record<Phase, string> = {
  idle: "في الانتظار",
  auth: "مصادقة الضحية",
  "cookie-set": "إرسال الكوكيز",
  sniffing: "التنصت على الشبكة",
  stolen: "سرقة الكوكيز",
  hijacked: "اختطاف الجلسة",
};

const PHASE_LIST: Phase[] = ["auth", "cookie-set", "sniffing", "stolen", "hijacked"];

const svgPhaseLabels: Record<Phase, string> = {
  idle: "Idle",
  auth: "Victim Authentication",
  "cookie-set": "Sending Cookie",
  sniffing: "Network Sniffing",
  stolen: "Cookie Stolen",
  hijacked: "Session Hijacked",
};

export default function SessionHijackingPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [speed, setSpeed] = useState<Speed>("normal");
  const [visibleLines, setVisibleLines] = useState(0);
  const [progress, setProgress] = useState(0);
  const [httpOnly, setHttpOnly] = useState(false);
  const [secure, setSecure] = useState(false);
  const [sameSite, setSameSite] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const mult = SPEED_MAP[speed];
  const anyProtection = httpOnly || secure || sameSite;

  const cleanup = useCallback(() => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const startSimulation = () => {
    cleanup();
    setVisibleLines(0);
    setProgress(0);
    setBlocked(false);
    setPhase("auth");

    if (anyProtection) {
      const phases: { p: Phase; delay: number }[] = [
        { p: "auth", delay: 0 },
        { p: "cookie-set", delay: 2500 * mult },
        { p: "sniffing", delay: 5000 * mult },
      ];
      phases.forEach(({ p, delay }) => {
        timerRef.current.push(setTimeout(() => setPhase(p), delay));
      });
      timerRef.current.push(setTimeout(() => setBlocked(true), 7000 * mult));
      timerRef.current.push(setTimeout(() => setPhase("idle"), 10000 * mult));
      const total = 10000 * mult;
      const steps = total / 100;
      for (let i = 0; i <= steps; i++) {
        timerRef.current.push(setTimeout(() => setProgress(Math.min((i / steps) * 100, 100)), i * 100));
      }
      for (let i = 0; i < 6; i++) {
        timerRef.current.push(setTimeout(() => setVisibleLines(i + 1), ((i + 1) / 6) * total));
      }
      return;
    }

    const phases: { p: Phase; delay: number }[] = [
      { p: "auth", delay: 0 },
      { p: "cookie-set", delay: 2500 * mult },
      { p: "sniffing", delay: 5000 * mult },
      { p: "stolen", delay: 8500 * mult },
      { p: "hijacked", delay: 12000 * mult },
    ];
    phases.forEach(({ p, delay }) => {
      timerRef.current.push(setTimeout(() => setPhase(p), delay));
    });

    const totalDuration = 15000 * mult;
    const steps = totalDuration / 100;
    for (let i = 0; i <= steps; i++) {
      timerRef.current.push(setTimeout(() => setProgress(Math.min((i / steps) * 100, 100)), i * 100));
    }
    terminalLines.forEach((_, idx) => {
      const lineDelay = ((idx + 1) / terminalLines.length) * totalDuration;
      timerRef.current.push(setTimeout(() => setVisibleLines(idx + 1), lineDelay));
    });
  };

  const reset = () => {
    cleanup();
    setPhase("idle");
    setVisibleLines(0);
    setProgress(0);
    setBlocked(false);
  };

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [visibleLines]);

  const phaseIndex = PHASE_LIST.indexOf(phase);
  const cookieVisible = phase !== "idle" && phase !== "auth";
  const attackerHasCookie = phase === "stolen" || phase === "hijacked";
  const isHijacked = phase === "hijacked";

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
        {/* ===== HEADER ===== */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Cookie className="w-9 h-9 text-amber-400" />
            <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              اختطاف الجلسات
            </h1>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
            هجوم اختطاف الجلسات يسمح للمهاجم بسرقة ملف تعريف الارتباط (Cookie) الخاص بالجلسة
            واستخدامه لانتحال هوية الضحية والوصول إلى حسابه دون الحاجة لكلمة المرور
          </p>
        </motion.div>

        {/* ===== SVG VISUAL SCENE ===== */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-950/80 border border-gray-700/50 rounded-2xl p-4 mb-8 overflow-hidden"
        >
          <h2 className="text-lg font-bold text-amber-400 mb-3 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            المشهد التفاعلي للهجوم
          </h2>
          <svg viewBox="0 0 900 500" className="w-full h-auto">
            <defs>
              <filter id="glow-amber">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="glow-red">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="glow-green">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <linearGradient id="cookie-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <linearGradient id="grad-red" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
            </defs>

            {/* === VICTIM === */}
            <g>
              <motion.rect
                x="30" y="120" width="210" height="140" rx="14"
                fill="#111827" stroke="#22d3ee" strokeWidth="2"
                filter="url(#glow-amber)"
                animate={{ strokeOpacity: phase === "idle" ? 0.5 : 1 }}
              />
              <User x={125} y={128} width={20} height={20} color="#22d3ee" />
              <text x="135" y="162" fill="#22d3ee" fontSize="12" fontWeight="bold" textAnchor="middle">Victim</text>
              <text x="135" y="180" fill="#9ca3af" fontSize="10" textAnchor="middle">192.168.1.50</text>
              {/* Browser bar */}
              <rect x="42" y="192" width="186" height="55" rx="6" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
              <rect x="48" y="198" width="174" height="14" rx="3" fill="#1e293b" />
              <text x="135" y="209" fill="#6b7280" fontSize="7" textAnchor="middle">🔒 https://example.com/dashboard</text>
              {cookieVisible && (
                <motion.text
                  x="135" y="235" fill="#f59e0b" fontSize="8" textAnchor="middle" fontFamily="monospace"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                >
                  🍪 PHPSESSID={SESSION_ID}
                </motion.text>
              )}
              {isHijacked && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <rect x="48" y="228" width="174" height="14" rx="2" fill="#7f1d1d" />
                  <text x="135" y="238" fill="#fca5a5" fontSize="7" textAnchor="middle">⚠ Active sessions: 2</text>
                </motion.g>
              )}
            </g>

            {/* === WEB SERVER === */}
            <g>
              <motion.rect
                x="660" y="120" width="210" height="140" rx="14"
                fill="#111827" stroke="#22c55e" strokeWidth="2"
                filter="url(#glow-green)"
                animate={{ strokeOpacity: phase === "idle" ? 0.5 : 1 }}
              />
              <Server x={755} y={128} width={20} height={20} color="#22c55e" />
              <text x="765" y="162" fill="#22c55e" fontSize="12" fontWeight="bold" textAnchor="middle">Web Server</text>
              <text x="765" y="180" fill="#9ca3af" fontSize="10" textAnchor="middle">example.com</text>
              <rect x="672" y="192" width="186" height="55" rx="6" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
              <text x="765" y="210" fill="#4ade80" fontSize="8" textAnchor="middle">Active Sessions</text>
              <text x="765" y="226" fill="#6b7280" fontSize="8" textAnchor="middle">
                {isHijacked ? "ahmed: 2 sessions" : cookieVisible ? "ahmed: 1 session" : "—"}
              </text>
              {isHijacked && (
                <motion.text
                  x="765" y="240" fill="#ef4444" fontSize="7" textAnchor="middle"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  ⚠ IP mismatch detected!
                </motion.text>
              )}
            </g>

            {/* === ATTACKER === */}
            <g>
              <motion.rect
                x="345" y="320" width="210" height="140" rx="14"
                fill="#1a0a0a" stroke="#ef4444" strokeWidth="2"
                filter="url(#glow-red)"
                animate={{
                  stroke: phase === "idle" ? "#ef4444" : ["#ef4444", "#ff6b6b", "#ef4444"],
                  strokeWidth: phase !== "idle" ? [2, 3, 2] : 2,
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <Skull x={440} y={328} width={20} height={20} color="#ef4444" />
              <text x="450" y="362" fill="#ef4444" fontSize="12" fontWeight="bold" textAnchor="middle">Attacker</text>
              <text x="450" y="380" fill="#9ca3af" fontSize="10" textAnchor="middle">192.168.1.77</text>
              {/* Attacker browser */}
              <rect x="357" y="392" width="186" height="55" rx="6" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
              {attackerHasCookie ? (
                <>
                  <rect x="363" y="398" width="174" height="14" rx="3" fill="#1e293b" />
                  <text x="450" y="409" fill="#6b7280" fontSize="7" textAnchor="middle">🔓 https://example.com/dashboard</text>
                  <motion.text
                    x="450" y="435" fill="#ef4444" fontSize="8" textAnchor="middle" fontFamily="monospace"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  >
                    🍪 PHPSESSID={SESSION_ID}
                  </motion.text>
                </>
              ) : (
                <text x="450" y="425" fill="#6b7280" fontSize="9" textAnchor="middle">
                  {phase === "sniffing" ? "Sniffing..." : "Ready to attack"}
                </text>
              )}
            </g>

            {/* Cookie SVG shape */}
            {cookieVisible && (
              <g>
                {/* Cookie flying from server to victim: phase cookie-set */}
                {phase === "cookie-set" && (
                  <motion.g
                    initial={{ x: 660, y: 180 }}
                    animate={{ x: 200, y: 180 }}
                    transition={{ duration: 2 * mult }}
                  >
                    <circle r="18" fill="url(#cookie-grad)" />
                    <circle cx="-6" cy="-5" r="3" fill="#78350f" />
                    <circle cx="5" cy="2" r="2.5" fill="#78350f" />
                    <circle cx="-2" cy="8" r="2" fill="#78350f" />
                    <circle cx="8" cy="-8" r="2" fill="#78350f" />
                    <motion.circle
                      r="22" fill="none" stroke="#f59e0b" strokeWidth="1.5"
                      animate={{ r: [22, 30, 22], opacity: [0.8, 0.2, 0.8] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  </motion.g>
                )}

                {/* Cookie duplicate flying to attacker: phase sniffing→stolen */}
                {(phase === "sniffing" || phase === "stolen") && !blocked && (
                  <>
                    {/* Network line between victim and server */}
                    <motion.line
                      x1="240" y1="190" x2="660" y2="190"
                      stroke="#374151" strokeWidth="1.5" strokeDasharray="6 4"
                      initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
                    />
                    {/* Sniffing packet indicators */}
                    {[0, 0.6, 1.2].map((delay, i) => (
                      <motion.circle
                        key={`sniff-${i}`}
                        r="4" fill="#f59e0b"
                        initial={{ cx: 240, cy: 190, opacity: 0 }}
                        animate={{ cx: 660, cy: 190, opacity: [0, 1, 1, 0] }}
                        transition={{ duration: 1.8 * mult, delay: delay * mult, repeat: Infinity, repeatDelay: 0.5 * mult }}
                      />
                    ))}
                    {/* Intercepted cookie copy flying to attacker */}
                    {phase === "stolen" && (
                      <motion.g
                        initial={{ x: 450, y: 190 }}
                        animate={{ x: 450, y: 340 }}
                        transition={{ duration: 1.5 * mult }}
                      >
                        <circle r="14" fill="url(#cookie-grad)" opacity="0.9" />
                        <circle cx="-4" cy="-3" r="2.5" fill="#78350f" />
                        <circle cx="4" cy="2" r="2" fill="#78350f" />
                        <circle cx="-1" cy="6" r="1.5" fill="#78350f" />
                        {/* Crack line */}
                        <motion.line
                          x1="-10" y1="-10" x2="10" y2="10"
                          stroke="#ef4444" strokeWidth="2"
                          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                          transition={{ duration: 0.8 * mult, delay: 0.5 * mult }}
                        />
                      </motion.g>
                    )}
                  </>
                )}
              </g>
            )}

            {/* Blocked shield animation */}
            {blocked && (
              <motion.g initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}>
                <circle cx="450" cy="250" r="50" fill="#064e3b" opacity="0.5" />
                <ShieldCheck x={425} y={225} width={50} height={50} color="#22c55e" />
                <motion.text
                  x="450" y="320" textAnchor="middle" fill="#4ade80" fontSize="13" fontWeight="bold"
                  animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1, repeat: Infinity }}
                >
                  {httpOnly ? "HttpOnly blocks JavaScript access" : secure ? "Secure blocks HTTP transmission" : "SameSite blocks cross-site requests"}
                </motion.text>
              </motion.g>
            )}

            {/* Scan pulses from attacker in sniffing phase */}
            {phase === "sniffing" && !blocked && (
              <>
                {[0, 0.5, 1].map((delay, i) => (
                  <motion.circle
                    key={`pulse-${i}`}
                    cx="450" cy="390"
                    fill="none" stroke="#ef4444" strokeWidth="1"
                    initial={{ r: 10, opacity: 0.6 }}
                    animate={{ r: 180, opacity: 0 }}
                    transition={{ duration: 2 * mult, delay: delay * mult, repeat: Infinity }}
                  />
                ))}
              </>
            )}

            {/* Phase label */}
            <motion.text
              x="450" y="485" textAnchor="middle"
              fill={phase === "hijacked" ? "#ef4444" : blocked ? "#22c55e" : "#f59e0b"}
              fontSize="13" fontWeight="bold"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {blocked ? "Attack blocked successfully!" : svgPhaseLabels[phase]}
            </motion.text>
          </svg>
        </motion.div>

        {/* ===== SESSION TOKEN INSPECTOR ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gray-950/80 border border-gray-700/50 rounded-2xl p-5 mb-8"
        >
          <h2 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
            <KeyRound className="w-5 h-5" />
            فاحص رمز الجلسة
          </h2>
          <div className="bg-black/80 rounded-xl p-4 font-mono text-sm space-y-2 mb-4" dir="ltr">
            <div className="flex flex-wrap gap-1">
              <span className="text-purple-400">Cookie:</span>
              <span className="text-amber-400">PHPSESSID={SESSION_ID};</span>
              <span className="text-gray-500">path=/;</span>
              <span className="text-gray-500">domain=.example.com;</span>
              <motion.span
                className={`px-1.5 py-0.5 rounded text-xs font-bold ${httpOnly ? "bg-green-900/60 text-green-400 border border-green-600" : "bg-red-900/40 text-red-400 border border-red-700"}`}
                animate={httpOnly ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5 }}
              >
                HttpOnly{httpOnly ? " ✓" : " ✗"}
              </motion.span>
            </div>
            <div className="flex flex-wrap gap-1">
              <span className="text-purple-400">Set-Cookie:</span>
              <span className="text-amber-400">session_token=eyJhbGci....;</span>
              <motion.span
                className={`px-1.5 py-0.5 rounded text-xs font-bold ${secure ? "bg-green-900/60 text-green-400 border border-green-600" : "bg-red-900/40 text-red-400 border border-red-700"}`}
                animate={secure ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5 }}
              >
                Secure{secure ? " ✓" : " ✗"}
              </motion.span>
              <motion.span
                className={`px-1.5 py-0.5 rounded text-xs font-bold ${sameSite ? "bg-green-900/60 text-green-400 border border-green-600" : "bg-red-900/40 text-red-400 border border-red-700"}`}
                animate={sameSite ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5 }}
              >
                SameSite={sameSite ? "Strict ✓" : "None ✗"}
              </motion.span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className={`rounded-xl p-3 border text-center text-sm ${httpOnly ? "bg-green-950/40 border-green-700 text-green-400" : "bg-gray-900 border-gray-700 text-gray-400"}`}>
              <p className="font-bold mb-1">HttpOnly</p>
              <p className="text-xs">يمنع JavaScript من قراءة الكوكيز</p>
            </div>
            <div className={`rounded-xl p-3 border text-center text-sm ${secure ? "bg-green-950/40 border-green-700 text-green-400" : "bg-gray-900 border-gray-700 text-gray-400"}`}>
              <p className="font-bold mb-1">Secure</p>
              <p className="text-xs">يُرسل فقط عبر اتصال HTTPS مشفّر</p>
            </div>
            <div className={`rounded-xl p-3 border text-center text-sm ${sameSite ? "bg-green-950/40 border-green-700 text-green-400" : "bg-gray-900 border-gray-700 text-gray-400"}`}>
              <p className="font-bold mb-1">SameSite</p>
              <p className="text-xs">يمنع إرسال الكوكيز مع طلبات المواقع الأخرى</p>
            </div>
          </div>
        </motion.div>

        {/* ===== CONTROL PANEL ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-6 mb-8"
        >
          <h2 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
            <Gauge className="w-5 h-5" />
            لوحة التحكم
          </h2>
          <div className="flex flex-wrap items-center gap-4 mb-5">
            <button
              onClick={startSimulation}
              disabled={phase !== "idle" && phase !== "hijacked"}
              className="flex items-center gap-2 bg-linear-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold transition-all"
            >
              <Play className="w-4 h-4" />
              بدء الهجوم
            </button>
            <button
              onClick={reset}
              disabled={phase === "idle"}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              إعادة التعيين
            </button>
            <div className="flex items-center gap-2 mr-auto">
              <span className="text-gray-400 text-sm">السرعة:</span>
              {(["slow", "normal", "fast"] as Speed[]).map((s) => (
                <button
                  key={s}
                  onClick={() => phase === "idle" && setSpeed(s)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    speed === s ? "bg-amber-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {s === "slow" ? "بطيء" : s === "normal" ? "عادي" : "سريع"}
                </button>
              ))}
            </div>
          </div>

          {/* Security toggles */}
          <div className="flex flex-wrap gap-4 mb-5">
            {([
              { label: "HttpOnly", val: httpOnly, set: setHttpOnly },
              { label: "Secure", val: secure, set: setSecure },
              { label: "SameSite", val: sameSite, set: setSameSite },
            ] as const).map(({ label, val, set }) => (
              <button
                key={label}
                onClick={() => phase === "idle" && set(!val)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                  val ? "bg-green-900/40 border-green-600 text-green-400" : "bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500"
                }`}
              >
                {val ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                {label}
                {val ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
              </button>
            ))}
          </div>

          {/* Phase indicators */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {PHASE_LIST.map((p, i) => {
              const active = phaseIndex >= i;
              return (
                <div key={p} className="flex items-center gap-2">
                  <motion.div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0 ${
                      active ? "bg-amber-600/30 border-amber-400 text-amber-300" : "bg-gray-800 border-gray-600 text-gray-500"
                    }`}
                    animate={phase === p ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    {i + 1}
                  </motion.div>
                  <span className={`text-xs ${active ? "text-amber-300" : "text-gray-600"}`}>
                    {phaseLabels[p]}
                  </span>
                  {i < 4 && <div className={`w-6 h-0.5 ${active ? "bg-amber-600" : "bg-gray-700"}`} />}
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
            <motion.div
              className="h-full bg-linear-to-r from-amber-500 via-orange-500 to-red-500 rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <p className="text-gray-500 text-xs mt-1 text-left" dir="ltr">{Math.round(progress)}%</p>
        </motion.div>

        {/* ===== TERMINAL FEED ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-black/90 border border-gray-700/50 rounded-2xl p-5 mb-8 font-mono"
        >
          <div className="flex items-center gap-2 mb-3">
            <Terminal className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-bold text-sm">سجل الأوامر المباشر</span>
            <div className="flex gap-1.5 mr-auto">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="w-3 h-3 rounded-full bg-green-500" />
            </div>
          </div>
          <div
            ref={terminalRef}
            className="h-56 overflow-y-auto space-y-1 text-sm scrollbar-thin scrollbar-thumb-gray-700"
            dir="ltr"
          >
            <AnimatePresence>
              {terminalLines.slice(0, visibleLines).map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className={
                    line.cmd.startsWith("$") ? "text-green-400"
                    : line.cmd.startsWith("[✓]") ? "text-yellow-400"
                    : line.cmd.startsWith("[!]") ? "text-red-400"
                    : line.cmd.startsWith("[>]") ? "text-purple-400"
                    : line.cmd.startsWith("[*]") ? "text-cyan-400"
                    : "text-gray-400"
                  }
                >
                  {line.cmd}
                </motion.div>
              ))}
            </AnimatePresence>
            {phase !== "idle" && phase !== "hijacked" && (
              <motion.span
                className="inline-block w-2 h-4 bg-green-400"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
            )}
          </div>
        </motion.div>

        {/* ===== DUAL BROWSER VIEW ===== */}
        <AnimatePresence>
          {(isHijacked || attackerHasCookie) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
            >
              {/* Victim browser */}
              <div className="bg-gray-950/80 border border-cyan-700/50 rounded-2xl overflow-hidden">
                <div className="bg-gray-800/80 px-4 py-2 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1 bg-gray-700 rounded px-3 py-1 text-xs text-gray-300 font-mono" dir="ltr">
                    🔒 https://example.com/dashboard
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-cyan-400 font-bold mb-1">متصفح الضحية</p>
                  <div className="bg-gray-900 rounded-xl p-4 space-y-2">
                    <p className="text-white text-sm">👋 مرحباً بك يا أحمد!</p>
                    <p className="text-gray-400 text-xs">لوحة التحكم — حسابك الشخصي</p>
                    <div className="flex gap-3 text-xs">
                      <span className="bg-cyan-900/40 text-cyan-300 px-2 py-1 rounded">الرصيد: $5,230</span>
                      <span className="bg-gray-800 text-gray-400 px-2 py-1 rounded">الرسائل: 3</span>
                    </div>
                    {isHijacked && (
                      <motion.p
                        className="text-red-400 text-xs mt-2"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      >
                        ⚠ تنبيه: تم رصد جلسة نشطة من موقع جغرافي مختلف
                      </motion.p>
                    )}
                  </div>
                </div>
              </div>

              {/* Attacker browser */}
              <div className="bg-gray-950/80 border border-red-700/50 rounded-2xl overflow-hidden">
                <div className="bg-gray-800/80 px-4 py-2 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1 bg-gray-700 rounded px-3 py-1 text-xs text-gray-300 font-mono" dir="ltr">
                    🔓 https://example.com/dashboard
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-red-400 font-bold mb-1">متصفح المهاجم</p>
                  <div className="bg-gray-900 rounded-xl p-4 space-y-2">
                    <motion.p className="text-white text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      👋 مرحباً بك يا أحمد!
                    </motion.p>
                    <motion.p className="text-gray-400 text-xs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                      لوحة التحكم — حسابك الشخصي
                    </motion.p>
                    <motion.div className="flex gap-3 text-xs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                      <span className="bg-red-900/40 text-red-300 px-2 py-1 rounded">الرصيد: $5,230</span>
                      <span className="bg-gray-800 text-gray-400 px-2 py-1 rounded">الرسائل: 3</span>
                    </motion.div>
                    <motion.p
                      className="text-red-500 text-xs font-bold mt-2"
                      initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.5, 1] }}
                      transition={{ delay: 0.8, duration: 1 }}
                    >
                      ☠ المهاجم يتحكم بالحساب بالكامل!
                    </motion.p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== ANALYSIS CARDS ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* How it works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-5"
          >
            <h3 className="text-lg font-bold text-amber-400 mb-3 flex items-center gap-2">
              <Info className="w-5 h-5" />
              كيف يعمل اختطاف الجلسات
            </h3>
            <ul className="space-y-2 text-gray-300 text-sm list-disc list-inside">
              <li><span className="text-amber-300 font-bold">Sidejacking:</span> التنصت على الشبكة والتقاط كوكيز الجلسة من حزم HTTP غير المشفّرة</li>
              <li><span className="text-amber-300 font-bold">XSS:</span> حقن سكربت خبيث لسرقة document.cookie وإرساله للمهاجم</li>
              <li><span className="text-amber-300 font-bold">Session Fixation:</span> إجبار الضحية على استخدام معرّف جلسة يعرفه المهاجم مسبقاً</li>
              <li><span className="text-amber-300 font-bold">Man-in-the-Browser:</span> استخدام برمجيات خبيثة للتلاعب بالجلسة داخل المتصفح</li>
            </ul>
          </motion.div>

          {/* Tools */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-5"
          >
            <h3 className="text-lg font-bold text-orange-400 mb-3 flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              أدوات الهجوم
            </h3>
            <ul className="space-y-2 text-gray-300 text-sm list-disc list-inside">
              <li><span className="text-orange-300 font-bold">Wireshark:</span> التقاط وتحليل حزم الشبكة واستخراج الكوكيز</li>
              <li><span className="text-orange-300 font-bold">Hamster + Ferret:</span> أداة متخصصة في اختطاف جلسات HTTP</li>
              <li><span className="text-orange-300 font-bold">Firesheep:</span> إضافة Firefox لسرقة جلسات الشبكات اللاسلكية المفتوحة</li>
              <li><span className="text-orange-300 font-bold">Burp Suite:</span> اعتراض وتعديل طلبات HTTP والتلاعب بالكوكيز</li>
            </ul>
          </motion.div>

          {/* Detection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-5"
          >
            <h3 className="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2">
              <Bug className="w-5 h-5" />
              طرق الكشف
            </h3>
            <ul className="space-y-2 text-gray-300 text-sm list-disc list-inside">
              <li><span className="text-cyan-300 font-bold">جلسات متعددة:</span> رصد تسجيل دخول نفس الحساب من أكثر من جهاز في وقت واحد</li>
              <li><span className="text-cyan-300 font-bold">تغيّر عنوان IP:</span> مراقبة تغيّر عنوان IP أثناء الجلسة النشطة</li>
              <li><span className="text-cyan-300 font-bold">بصمة المتصفح:</span> مقارنة User-Agent وبصمة الجهاز مع بداية الجلسة</li>
              <li><span className="text-cyan-300 font-bold">أنماط الاستخدام:</span> تحليل السلوك غير الطبيعي في التصفح وسرعة الطلبات</li>
            </ul>
          </motion.div>

          {/* Protection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-5"
          >
            <h3 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              طرق الحماية
            </h3>
            <ul className="space-y-2 text-gray-300 text-sm list-disc list-inside">
              <li><span className="text-green-300 font-bold">كوكيز آمنة:</span> استخدام أعلام HttpOnly و Secure و SameSite</li>
              <li><span className="text-green-300 font-bold">تجديد الجلسة:</span> إعادة توليد معرّف الجلسة بعد تسجيل الدخول (Session Regeneration)</li>
              <li><span className="text-green-300 font-bold">ربط الرمز:</span> ربط الجلسة بعنوان IP وبصمة المتصفح (Token Binding)</li>
              <li><span className="text-green-300 font-bold">HTTPS إلزامي:</span> فرض HTTPS لمنع التنصت على حزم الشبكة وتشفير الكوكيز</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </PageShell>
  );
}
