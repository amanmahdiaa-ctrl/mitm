"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LockOpen,
  Lock,
  Play,
  RotateCcw,
  Terminal,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Eye,
  Gauge,
  Info,
  Wrench,
  Bug,
  Globe,
  Monitor,
  Server,
  Skull,
  ArrowLeftRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import PageShell from "@/components/PageShell";

type Phase = "idle" | "requesting" | "stripping" | "intercepting" | "capturing" | "complete";
type Speed = "slow" | "normal" | "fast";

const SPEED_MAP: Record<Speed, number> = { slow: 2, normal: 1, fast: 0.5 };

const terminalLines = [
  { cmd: "$ sslstrip -l 8080", phase: "requesting" as Phase },
  { cmd: "[*] تهيئة sslstrip على المنفذ 8080...", phase: "requesting" as Phase },
  { cmd: "$ iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080", phase: "requesting" as Phase },
  { cmd: "[✓] تم إعادة توجيه المنفذ 80 → 8080", phase: "stripping" as Phase },
  { cmd: "$ mitmproxy --mode transparent", phase: "stripping" as Phase },
  { cmd: "[*] وضع الشفافية مفعّل...", phase: "stripping" as Phase },
  { cmd: "[>] اعتراض: GET https://bank.example.com/login → تجريد إلى HTTP", phase: "intercepting" as Phase },
  { cmd: "[>] تحويل HTTPS → HTTP في الاستجابة للضحية", phase: "intercepting" as Phase },
  { cmd: "[!] طلب وارد: POST http://bank.example.com/login", phase: "capturing" as Phase },
  { cmd: "[!] البيانات المكشوفة: username=admin&password=secret123", phase: "capturing" as Phase },
  { cmd: "[!] الكوكيز: session_id=abc123xyz; auth_token=eyJhbG...", phase: "capturing" as Phase },
  { cmd: "[✓] تم التقاط 12 طلب HTTP تحتوي بيانات حساسة", phase: "complete" as Phase },
  { cmd: "[✓] تم حفظ البيانات في /tmp/sslstrip.log", phase: "complete" as Phase },
];

const encryptedText = "\\x16\\x03\\x03\\x00\\x8a\\x02\\x00\\x00\\x86\\x03\\x03\\x5f\\xa2...";
const plainText = "POST /login HTTP/1.1\\nusername=admin&password=secret123";

export default function SslStrippingPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [speed, setSpeed] = useState<Speed>("normal");
  const [hstsEnabled, setHstsEnabled] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);
  const [progress, setProgress] = useState(0);
  const [lockState, setLockState] = useState<"locked" | "shaking" | "breaking" | "broken">("locked");
  const [addressBar, setAddressBar] = useState<"https" | "http">("https");
  const [hstsBlocked, setHstsBlocked] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const mult = SPEED_MAP[speed];

  const cleanup = useCallback(() => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const startSimulation = () => {
    cleanup();
    setHstsBlocked(false);
    setLockState("locked");
    setAddressBar("https");
    setVisibleLines(0);
    setProgress(0);

    if (hstsEnabled) {
      setPhase("requesting");
      const t1 = setTimeout(() => setLockState("shaking"), 1500 * mult);
      const t2 = setTimeout(() => {
        setHstsBlocked(true);
        setLockState("locked");
        setPhase("idle");
      }, 3500 * mult);
      timerRef.current.push(t1, t2);
      return;
    }

    setPhase("requesting");

    const phases: { p: Phase; delay: number }[] = [
      { p: "requesting", delay: 0 },
      { p: "stripping", delay: 3000 * mult },
      { p: "intercepting", delay: 6000 * mult },
      { p: "capturing", delay: 10000 * mult },
      { p: "complete", delay: 14000 * mult },
    ];

    phases.forEach(({ p, delay }) => {
      const t = setTimeout(() => setPhase(p), delay);
      timerRef.current.push(t);
    });

    const tLockShake = setTimeout(() => setLockState("shaking"), 2500 * mult);
    const tLockBreak = setTimeout(() => setLockState("breaking"), 4000 * mult);
    const tLockBroken = setTimeout(() => {
      setLockState("broken");
      setAddressBar("http");
    }, 5500 * mult);
    timerRef.current.push(tLockShake, tLockBreak, tLockBroken);

    const totalDuration = 15000 * mult;
    const progressInterval = 100;
    const steps = totalDuration / progressInterval;
    for (let i = 0; i <= steps; i++) {
      const t = setTimeout(() => setProgress(Math.min((i / steps) * 100, 100)), i * progressInterval);
      timerRef.current.push(t);
    }

    terminalLines.forEach((_, idx) => {
      const lineDelay = ((idx + 1) / terminalLines.length) * totalDuration;
      const t = setTimeout(() => setVisibleLines(idx + 1), lineDelay);
      timerRef.current.push(t);
    });
  };

  const reset = () => {
    cleanup();
    setPhase("idle");
    setVisibleLines(0);
    setProgress(0);
    setLockState("locked");
    setAddressBar("https");
    setHstsBlocked(false);
  };

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [visibleLines]);

  const phaseLabel: Record<Phase, string> = {
    idle: "في الانتظار",
    requesting: "إرسال الطلب",
    stripping: "تجريد SSL",
    intercepting: "اعتراض الاتصال",
    capturing: "التقاط البيانات",
    complete: "اكتمل الهجوم",
  };

  const phaseIndex = (["idle", "requesting", "stripping", "intercepting", "capturing", "complete"] as Phase[]).indexOf(phase);
  const isActive = phase !== "idle";
  const isStripped = phaseIndex >= 2;

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
        {/* ===== HEADER ===== */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <LockOpen className="w-9 h-9 text-red-400" />
            <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-red-400 via-yellow-400 to-cyan-400 bg-clip-text text-transparent">
              هجوم تجريد SSL
            </h1>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
            هجوم تجريد SSL يقوم بتحويل اتصال HTTPS الآمن إلى HTTP غير مشفر، مما يسمح
            للمهاجم بقراءة جميع البيانات المرسلة بما في ذلك كلمات المرور والمعلومات الحساسة
          </p>
        </motion.div>

        {/* ===== HSTS BLOCKED BANNER ===== */}
        <AnimatePresence>
          {hstsBlocked && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-6 bg-green-500/10 border border-green-500/40 rounded-xl p-4 flex items-center gap-3"
            >
              <ShieldCheck className="w-7 h-7 text-green-400 shrink-0" />
              <div>
                <p className="text-green-300 font-bold">تم حظر الهجوم بواسطة HSTS!</p>
                <p className="text-green-400/70 text-sm">
                  سياسة HSTS أجبرت المتصفح على استخدام HTTPS فقط. لا يمكن تخفيض الاتصال.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== SVG VISUAL SCENE ===== */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-950/80 border border-gray-700/50 rounded-2xl p-4 mb-8 overflow-hidden"
        >
          <h2 className="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            المشهد التفاعلي للهجوم
          </h2>

          <svg viewBox="0 0 900 480" className="w-full h-auto">
            <defs>
              <filter id="glow-cyan-ssl">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="glow-red-ssl">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="glow-green-ssl">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <linearGradient id="ssl-grad-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="ssl-grad-red" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
              <linearGradient id="ssl-grad-green" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#16a34a" />
              </linearGradient>
            </defs>

            {/* Connection lines */}
            {/* Victim → Attacker (HTTP - red dashed) */}
            {isActive && (
              <motion.line
                x1="200" y1="180" x2="450" y2="360"
                stroke={isStripped ? "#ef4444" : "#6b7280"}
                strokeWidth="2" strokeDasharray="6 4"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.7 }}
                transition={{ duration: 1.5 * mult }}
              />
            )}

            {/* Attacker → Server (HTTPS - green solid) */}
            {isActive && phaseIndex >= 2 && (
              <motion.line
                x1="550" y1="360" x2="750" y2="180"
                stroke="#22c55e" strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.8 }}
                transition={{ duration: 1 * mult }}
              />
            )}

            {/* Direct path (original - faint) */}
            <line x1="200" y1="160" x2="750" y2="160" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
            {phase === "idle" && (
              <text x="475" y="150" fill="#4b5563" fontSize="10" textAnchor="middle">Original HTTPS Connection</text>
            )}

            {/* === VICTIM BROWSER === */}
            <g>
              <motion.rect
                x="50" y="110" width="200" height="130" rx="12"
                fill="#111827" stroke="#22d3ee" strokeWidth="2"
                filter="url(#glow-cyan-ssl)"
                animate={{ strokeOpacity: isActive ? 1 : 0.5 }}
              />
              {/* Browser bar mockup */}
              <rect x="60" y="120" width="180" height="26" rx="6" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
              <motion.text
                x="150" y="137" fill={addressBar === "https" ? "#22c55e" : "#ef4444"}
                fontSize="9" fontWeight="bold" textAnchor="middle"
                animate={{ fill: addressBar === "https" ? "#22c55e" : "#ef4444" }}
              >
                {addressBar === "https" ? "🔒 https://bank.example.com" : "⚠ http://bank.example.com"}
              </motion.text>
              <Monitor className="w-4 h-4" x="142" y="157" />
              <text x="150" y="170" fill="#22d3ee" fontSize="11" fontWeight="bold" textAnchor="middle">Victim Browser</text>
              <text x="150" y="195" fill="#9ca3af" fontSize="9" textAnchor="middle">192.168.1.105</text>
              <text x="150" y="212" fill="#6b7280" fontSize="8" textAnchor="middle">
                {isStripped ? "⚠ Unencrypted connection" : "Believes connection is secure"}
              </text>
              {isStripped && (
                <motion.rect
                  x="50" y="110" width="200" height="130" rx="12"
                  fill="transparent" stroke="#fbbf24" strokeWidth="2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </g>

            {/* === ATTACKER (MITM) === */}
            <g>
              <motion.rect
                x="350" y="300" width="200" height="130" rx="12"
                fill="#1a0a0a" stroke="#ef4444" strokeWidth="2"
                filter="url(#glow-red-ssl)"
                animate={{
                  stroke: isActive ? ["#ef4444", "#ff6b6b", "#ef4444"] : "#ef4444",
                  strokeWidth: isActive ? [2, 3, 2] : 2,
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <text x="450" y="330" fill="#ef4444" fontSize="12" fontWeight="bold" textAnchor="middle">☠ Attacker (MITM)</text>
              <text x="450" y="352" fill="#9ca3af" fontSize="9" textAnchor="middle">192.168.1.77</text>
              <text x="450" y="370" fill="#fbbf24" fontSize="9" textAnchor="middle" opacity="0.8">
                {phase === "idle" ? "sslstrip Ready" : phase === "requesting" ? "Intercepting request..." : phase === "stripping" ? "Stripping SSL..." : phase === "intercepting" ? "Reading data..." : phase === "capturing" ? "Capturing passwords..." : "Captured ✓"}
              </text>

              {/* HTTPS lock on attacker side (to real server) */}
              {phaseIndex >= 2 && (
                <motion.g initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring" }}>
                  <rect x="520" y="395" width="24" height="18" rx="3" fill="#22c55e" opacity="0.3" />
                  <text x="532" y="408" fill="#22c55e" fontSize="10" textAnchor="middle">🔒</text>
                </motion.g>
              )}

              {/* HTTP label on victim side */}
              {isStripped && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <rect x="356" y="395" width="40" height="18" rx="3" fill="#ef4444" opacity="0.2" />
                  <text x="376" y="408" fill="#ef4444" fontSize="8" fontWeight="bold" textAnchor="middle">HTTP</text>
                </motion.g>
              )}
            </g>

            {/* === SECURE SERVER === */}
            <g>
              <motion.rect
                x="650" y="110" width="200" height="130" rx="12"
                fill="#111827" stroke="#22c55e" strokeWidth="2"
                filter="url(#glow-green-ssl)"
                animate={{ strokeOpacity: isActive ? 1 : 0.5 }}
              />
              <text x="750" y="145" fill="#22c55e" fontSize="11" fontWeight="bold" textAnchor="middle">Secure Server</text>
              <text x="750" y="165" fill="#9ca3af" fontSize="9" textAnchor="middle">bank.example.com</text>
              <text x="750" y="185" fill="#6b7280" fontSize="8" textAnchor="middle">TLS 1.3 | SHA-256</text>
              <text x="750" y="205" fill="#22c55e" fontSize="18" textAnchor="middle">🔒</text>
              <text x="750" y="225" fill="#4ade80" fontSize="8" textAnchor="middle">Valid SSL Certificate</text>
            </g>

            {/* Lock breaking animation */}
            {lockState === "breaking" && (
              <g>
                {[...Array(8)].map((_, i) => (
                  <motion.circle
                    key={`particle-${i}`}
                    cx={450} cy={270}
                    r={3}
                    fill={i % 2 === 0 ? "#ef4444" : "#fbbf24"}
                    initial={{ x: 0, y: 0, opacity: 1 }}
                    animate={{
                      x: Math.cos((i * Math.PI) / 4) * 60,
                      y: Math.sin((i * Math.PI) / 4) * 60,
                      opacity: 0,
                      scale: 0,
                    }}
                    transition={{ duration: 1 * mult, ease: "easeOut" }}
                  />
                ))}
                <motion.text
                  x="450" y="275" fill="#ef4444" fontSize="28" textAnchor="middle"
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{ scale: [1, 1.5, 0], opacity: [1, 1, 0], rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 1.2 * mult }}
                >
                  🔓
                </motion.text>
                {/* Crack lines */}
                {[...Array(6)].map((_, i) => (
                  <motion.line
                    key={`crack-${i}`}
                    x1={450} y1={265}
                    x2={450 + Math.cos((i * Math.PI) / 3) * 40}
                    y2={265 + Math.sin((i * Math.PI) / 3) * 40}
                    stroke="#fbbf24" strokeWidth="2"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                    transition={{ duration: 0.8 * mult, delay: i * 0.1 }}
                  />
                ))}
              </g>
            )}

            {/* Data packets flowing: Victim → Attacker (HTTP plain) */}
            {(phase === "intercepting" || phase === "capturing" || phase === "complete") && (
              <>
                {[0, 1.2, 2.4].map((delay, i) => (
                  <motion.g key={`pkt-http-${i}`}>
                    <motion.rect
                      width="80" height="20" rx="4" fill="#ef444480"
                      initial={{ x: 200, y: 170, opacity: 0 }}
                      animate={{ x: 400, y: 330, opacity: [0, 1, 1, 0] }}
                      transition={{ duration: 1.5 * mult, delay: delay * mult, repeat: Infinity, repeatDelay: 1.5 * mult }}
                    />
                    <motion.text
                      fontSize="7" fill="#fca5a5" fontWeight="bold"
                      initial={{ x: 215, y: 184, opacity: 0 }}
                      animate={{ x: 415, y: 344, opacity: [0, 1, 1, 0] }}
                      transition={{ duration: 1.5 * mult, delay: delay * mult, repeat: Infinity, repeatDelay: 1.5 * mult }}
                    >
                      HTTP | plain text
                    </motion.text>
                  </motion.g>
                ))}
              </>
            )}

            {/* Data packets flowing: Attacker → Server (HTTPS encrypted) */}
            {(phase === "intercepting" || phase === "capturing" || phase === "complete") && (
              <>
                {[0.6, 1.8, 3.0].map((delay, i) => (
                  <motion.g key={`pkt-https-${i}`}>
                    <motion.rect
                      width="80" height="20" rx="4" fill="#22c55e60"
                      initial={{ x: 500, y: 340, opacity: 0 }}
                      animate={{ x: 700, y: 170, opacity: [0, 1, 1, 0] }}
                      transition={{ duration: 1.5 * mult, delay: delay * mult, repeat: Infinity, repeatDelay: 1.5 * mult }}
                    />
                    <motion.text
                      fontSize="7" fill="#86efac" fontWeight="bold"
                      initial={{ x: 515, y: 354, opacity: 0 }}
                      animate={{ x: 715, y: 184, opacity: [0, 1, 1, 0] }}
                      transition={{ duration: 1.5 * mult, delay: delay * mult, repeat: Infinity, repeatDelay: 1.5 * mult }}
                    >
                      HTTPS | encrypted
                    </motion.text>
                  </motion.g>
                ))}
              </>
            )}

            {/* Labels on connection paths */}
            {isStripped && (
              <>
                <motion.text
                  x="290" y="290" fill="#ef4444" fontSize="10" fontWeight="bold" textAnchor="middle"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transform="rotate(-35, 290, 290)"
                >
                  Unencrypted HTTP ⚠
                </motion.text>
                <motion.text
                  x="660" y="290" fill="#22c55e" fontSize="10" fontWeight="bold" textAnchor="middle"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transform="rotate(35, 660, 290)"
                >
                  Encrypted HTTPS 🔒
                </motion.text>
              </>
            )}

            {/* Split view: encrypted vs plain text */}
            {phaseIndex >= 3 && (
              <motion.g initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                {/* Encrypted side */}
                <rect x="60" y="420" width="180" height="50" rx="6" fill="#052e16" stroke="#22c55e40" strokeWidth="1" />
                <text x="150" y="438" fill="#22c55e" fontSize="8" fontWeight="bold" textAnchor="middle">Encrypted HTTPS</text>
                <text x="150" y="455" fill="#4ade80" fontSize="7" textAnchor="middle" opacity="0.7">
                  \x16\x03\x03\x00\x8a\x02\x00...
                </text>
                {/* Plain side */}
                <rect x="260" y="420" width="180" height="50" rx="6" fill="#450a0a" stroke="#ef444440" strokeWidth="1" />
                <text x="350" y="438" fill="#ef4444" fontSize="8" fontWeight="bold" textAnchor="middle">Exposed HTTP</text>
                <text x="350" y="455" fill="#fca5a5" fontSize="7" textAnchor="middle" opacity="0.9">
                  username=admin&password=***
                </text>
                {/* Arrow between */}
                <motion.text
                  x="245" y="450" fill="#fbbf24" fontSize="14" textAnchor="middle"
                  animate={{ x: [240, 250, 240] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  →
                </motion.text>
              </motion.g>
            )}
          </svg>
        </motion.div>

        {/* ===== INTERACTIVE BROWSER DEMO ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gray-950/80 border border-gray-700/50 rounded-2xl p-6 mb-8"
        >
          <h2 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            محاكاة شريط العنوان
          </h2>

          {/* Address bar */}
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-4 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 bg-gray-800 rounded-lg px-4 py-2 flex items-center gap-2 border border-gray-600">
                <AnimatePresence mode="wait">
                  {lockState === "locked" && (
                    <motion.div key="lock" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0, rotate: 90 }}>
                      <Lock className="w-4 h-4 text-green-400" />
                    </motion.div>
                  )}
                  {lockState === "shaking" && (
                    <motion.div
                      key="shake"
                      animate={{ x: [-3, 3, -3, 3, -2, 2, 0], rotate: [-5, 5, -5, 5, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      <Lock className="w-4 h-4 text-yellow-400" />
                    </motion.div>
                  )}
                  {lockState === "breaking" && (
                    <motion.div
                      key="break"
                      animate={{ scale: [1, 1.3, 0], rotate: [0, 45, -45], opacity: [1, 1, 0] }}
                      transition={{ duration: 0.8 }}
                    >
                      <LockOpen className="w-4 h-4 text-red-400" />
                    </motion.div>
                  )}
                  {lockState === "broken" && (
                    <motion.div key="broken" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <motion.span
                  className="text-sm font-mono"
                  animate={{ color: addressBar === "https" ? "#4ade80" : "#f87171" }}
                >
                  {addressBar === "https" ? "https://" : "http://"}
                </motion.span>
                <span className="text-sm text-gray-300 font-mono">bank.example.com/login</span>
              </div>
            </div>

            {/* Status text */}
            <motion.p
              className="text-xs text-center"
              animate={{ color: addressBar === "https" ? "#4ade80" : "#f87171" }}
            >
              {addressBar === "https" ? "✓ الاتصال آمن ومشفر" : "⚠ تحذير: الاتصال غير آمن - البيانات مكشوفة!"}
            </motion.p>
          </div>

          {/* Side by side panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-bold text-sm">اتصال HTTPS مشفر</span>
              </div>
              <div className="bg-gray-950 rounded-lg p-3 font-mono text-xs leading-relaxed">
                <p className="text-green-500/60">TLS 1.3 | AES-256-GCM</p>
                <p className="text-green-500/40 mt-1 break-all">
                  \x16\x03\x03\x00\x8a\x02\x00\x00\x86\x03\x03
                  \x5f\xa2\x8d\x3c\x1e\x29\xab\xff\xc4\x92\x01
                  \x4b\x7e\xd9\x12\x88\xa3\xcc\xf5\x6a...
                </p>
                <p className="text-green-500/30 mt-1">****encrypted_payload****</p>
              </div>
            </div>

            <motion.div
              className="bg-red-500/5 border border-red-500/20 rounded-xl p-4"
              animate={isStripped ? { borderColor: ["#ef444430", "#ef4444", "#ef444430"] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="flex items-center gap-2 mb-3">
                <LockOpen className="w-4 h-4 text-red-400" />
                <span className="text-red-400 font-bold text-sm">HTTP مجرّد (مكشوف)</span>
              </div>
              <div className="bg-gray-950 rounded-lg p-3 font-mono text-xs leading-relaxed">
                <p className="text-red-400">HTTP/1.1 POST /login</p>
                <p className="text-red-300 mt-1">Host: bank.example.com</p>
                <p className="text-red-300">Content-Type: application/x-www-form-urlencoded</p>
                <p className="text-yellow-400 mt-2 font-bold">
                  username=admin&amp;password=secret123
                </p>
                <p className="text-yellow-300 mt-1">
                  Cookie: session_id=abc123xyz
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ===== CONTROL PANEL ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-950/80 border border-gray-700/50 rounded-2xl p-6 mb-8"
        >
          <h2 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
            <Gauge className="w-5 h-5" />
            لوحة التحكم
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            {/* Start / Reset */}
            <button
              onClick={phase === "idle" ? startSimulation : reset}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
                phase === "idle"
                  ? "bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white"
                  : "bg-linear-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white"
              }`}
            >
              {phase === "idle" ? <Play className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
              {phase === "idle" ? "بدء المحاكاة" : "إعادة تعيين"}
            </button>

            {/* Speed */}
            <div className="flex items-center gap-2 bg-gray-900 rounded-xl px-4 py-2">
              <Gauge className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-gray-400 text-sm shrink-0">السرعة:</span>
              <div className="flex gap-1 flex-1">
                {(["slow", "normal", "fast"] as Speed[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`flex-1 text-xs py-1.5 rounded-lg transition-all ${
                      speed === s ? "bg-cyan-500/20 text-cyan-400 font-bold" : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {s === "slow" ? "بطيء" : s === "normal" ? "عادي" : "سريع"}
                  </button>
                ))}
              </div>
            </div>

            {/* HSTS Toggle */}
            <button
              onClick={() => { setHstsEnabled(!hstsEnabled); reset(); }}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm border transition-all ${
                hstsEnabled
                  ? "bg-green-500/10 border-green-500/40 text-green-400"
                  : "bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600"
              }`}
            >
              {hstsEnabled ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
              HSTS {hstsEnabled ? "مفعّل" : "معطّل"}
            </button>

            {/* Phase display */}
            <div className="bg-gray-900 rounded-xl px-4 py-2 flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${phase === "idle" ? "bg-gray-500" : phase === "complete" ? "bg-green-500" : "bg-cyan-500 animate-pulse"}`} />
              <span className="text-sm text-gray-300">{phaseLabel[phase]}</span>
            </div>
          </div>

          {/* Phase Steps */}
          <div className="flex items-center gap-1 mb-4">
            {(["idle", "requesting", "stripping", "intercepting", "capturing", "complete"] as Phase[]).map((p, i) => (
              <div key={p} className="flex-1 flex items-center gap-1">
                <div className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                  i <= phaseIndex ? (i <= 1 ? "bg-cyan-500" : i <= 3 ? "bg-yellow-500" : "bg-red-500") : "bg-gray-800"
                }`} />
                {i < 5 && <div className="w-1" />}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-gray-500 px-1">
            <span>انتظار</span><span>طلب</span><span>تجريد</span><span>اعتراض</span><span>التقاط</span><span>مكتمل</span>
          </div>

          {/* Progress bar */}
          <div className="mt-4 bg-gray-800 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-linear-to-r from-cyan-500 via-yellow-500 to-red-500"
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>
        </motion.div>

        {/* ===== LIVE TERMINAL FEED ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-gray-950/80 border border-gray-700/50 rounded-2xl p-6 mb-8"
        >
          <h2 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            الطرفية المباشرة
          </h2>

          <div
            ref={terminalRef}
            className="bg-black rounded-xl p-4 font-mono text-xs leading-relaxed h-64 overflow-y-auto border border-gray-800 scroll-smooth"
            dir="ltr"
          >
            <p className="text-green-500 mb-2">┌──(attacker㉿kali)-[~]</p>
            <p className="text-green-500 mb-3">└─$ # SSL Stripping Attack Simulation</p>
            {terminalLines.slice(0, visibleLines).map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`mb-1 ${
                  line.cmd.startsWith("$") ? "text-green-400" :
                  line.cmd.startsWith("[✓]") ? "text-cyan-400" :
                  line.cmd.startsWith("[!]") ? "text-red-400 font-bold" :
                  line.cmd.startsWith("[>]") ? "text-yellow-400" :
                  line.cmd.startsWith("[*]") ? "text-blue-400" :
                  "text-gray-400"
                }`}
              >
                {line.cmd}
              </motion.p>
            ))}
            {isActive && phase !== "complete" && (
              <motion.span
                className="inline-block w-2 h-4 bg-green-400"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
            )}
          </div>
        </motion.div>

        {/* ===== ANALYSIS CARDS ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5" />
            تحليل الهجوم
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1 */}
            <div className="bg-gray-950/80 border border-gray-700/50 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Bug className="w-5 h-5 text-red-400" />
                <h3 className="text-red-400 font-bold">كيف يعمل تجريد SSL</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                ابتكر <span className="text-cyan-400">Moxie Marlinspike</span> هذه التقنية عام 2009. يقوم المهاجم بالوقوف بين
                الضحية والخادم كوسيط (MITM). عندما يطلب الخادم توجيه المستخدم إلى HTTPS، يعترض المهاجم
                هذا التوجيه ويُبقي الاتصال مع الضحية عبر HTTP العادي، بينما يتصل هو بالخادم عبر HTTPS.
                الضحية لا يلاحظ الفرق إذا لم ينتبه لشريط العنوان.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-gray-950/80 border border-gray-700/50 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Wrench className="w-5 h-5 text-yellow-400" />
                <h3 className="text-yellow-400 font-bold">الأدوات المستخدمة</h3>
              </div>
              <ul className="text-gray-400 text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 shrink-0">•</span>
                  <span><span className="text-cyan-400 font-mono">sslstrip</span> — أداة Moxie الأصلية لتجريد SSL من الاتصالات</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 shrink-0">•</span>
                  <span><span className="text-cyan-400 font-mono">mitmproxy</span> — وكيل اعتراض تفاعلي يدعم تعديل الحزم</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 shrink-0">•</span>
                  <span><span className="text-cyan-400 font-mono">bettercap</span> — إطار عمل شامل لهجمات الشبكة يتضمن وحدة SSLstrip</span>
                </li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="bg-gray-950/80 border border-gray-700/50 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-5 h-5 text-green-400" />
                <h3 className="text-green-400 font-bold">لماذا يوقفه HSTS</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                <span className="text-green-400 font-bold">HTTP Strict Transport Security</span> يُجبر المتصفح على استخدام HTTPS
                حصراً لمدة محددة. عندما يتلقى المتصفح ترويسة HSTS من الخادم، يرفض تلقائياً أي اتصال HTTP
                مستقبلي مع هذا النطاق. حتى لو حاول المهاجم إزالة التوجيه إلى HTTPS، سيرفض المتصفح
                الاتصال غير الآمن. قائمة <span className="text-cyan-400">HSTS Preload</span> تحمي حتى من الزيارة الأولى.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-gray-950/80 border border-gray-700/50 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-cyan-400" />
                <h3 className="text-cyan-400 font-bold">طرق الحماية</h3>
              </div>
              <ul className="text-gray-400 text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span>تفعيل HSTS مع خيار includeSubDomains و preload</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span>التحقق دائماً من وجود رمز القفل في شريط العنوان</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span>استخدام VPN على الشبكات العامة</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span>تجنب إدخال بيانات حساسة على صفحات HTTP</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span>تثبيت إضافات المتصفح مثل HTTPS Everywhere</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* ===== ENCRYPTION COMPARISON ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-gray-950/80 border border-gray-700/50 rounded-2xl p-6 mb-8"
        >
          <h2 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5" />
            مقارنة التشفير
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            {/* Encrypted Packet */}
            <div className="relative">
              <div className="bg-green-500/5 border border-green-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-bold">حزمة مشفرة (TLS)</span>
                </div>
                <div className="bg-black/60 rounded-lg p-3 font-mono text-[10px] leading-relaxed" dir="ltr">
                  <p className="text-green-600">── TLS Record Layer ──</p>
                  <p className="text-green-500/50">Content Type: Application Data (23)</p>
                  <p className="text-green-500/50">Version: TLS 1.3 (0x0304)</p>
                  <p className="text-green-500/50">Length: 287</p>
                  <p className="text-green-600 mt-2">── Encrypted Payload ──</p>
                  <p className="text-green-500/30 break-all">
                    17 03 03 01 1f 8c 4e 2b c7 a3 f1 d0 92 5e 3a 17
                    b8 41 cc 09 d4 e6 7f 52 a8 3b 19 c0 d2 f5 88 67
                    3c aa 0e 71 b6 29 d8 45 f3 9c 2a 80 16 e7 4b...
                  </p>
                </div>
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full font-bold">
                محمي ✓
              </div>
            </div>

            {/* Stripped Packet */}
            <div className="relative">
              <motion.div
                className="bg-red-500/5 border border-red-500/30 rounded-xl p-4"
                animate={isStripped ? { boxShadow: ["0 0 0px #ef4444", "0 0 20px #ef444440", "0 0 0px #ef4444"] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <LockOpen className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 font-bold">حزمة مجرّدة (HTTP)</span>
                </div>
                <div className="bg-black/60 rounded-lg p-3 font-mono text-[10px] leading-relaxed" dir="ltr">
                  <p className="text-red-500">── HTTP Request ──</p>
                  <p className="text-red-400">POST /login HTTP/1.1</p>
                  <p className="text-red-400/70">Host: bank.example.com</p>
                  <p className="text-red-400/70">Content-Type: application/x-www-form-urlencoded</p>
                  <p className="text-red-500 mt-2">── Exposed Body ──</p>
                  <p className="text-yellow-400 font-bold">username=admin</p>
                  <p className="text-yellow-400 font-bold">password=secret123</p>
                  <p className="text-yellow-300">session_token=eyJhbGciOiJIUzI1NiJ9...</p>
                </div>
              </motion.div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-500/20 text-red-400 text-xs px-3 py-1 rounded-full font-bold">
                مكشوف ✗
              </div>
            </div>
          </div>

          {/* TLS Handshake Diagram */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
            <h3 className="text-sm font-bold text-gray-300 mb-3 text-center">مخطط مصافحة TLS — الاعتراض</h3>
            <svg viewBox="0 0 800 220" className="w-full h-auto" style={{ direction: "ltr" }}>
              {/* Client label */}
              <rect x="30" y="10" width="100" height="30" rx="6" fill="#111827" stroke="#22d3ee" strokeWidth="1.5" />
              <text x="80" y="30" fill="#22d3ee" fontSize="11" textAnchor="middle" fontWeight="bold">Client</text>

              {/* Attacker label */}
              <rect x="350" y="10" width="100" height="30" rx="6" fill="#1a0a0a" stroke="#ef4444" strokeWidth="1.5" />
              <text x="400" y="30" fill="#ef4444" fontSize="11" textAnchor="middle" fontWeight="bold">Attacker</text>

              {/* Server label */}
              <rect x="670" y="10" width="100" height="30" rx="6" fill="#111827" stroke="#22c55e" strokeWidth="1.5" />
              <text x="720" y="30" fill="#22c55e" fontSize="11" textAnchor="middle" fontWeight="bold">Server</text>

              {/* Vertical lines */}
              <line x1="80" y1="45" x2="80" y2="210" stroke="#22d3ee" strokeWidth="1" opacity="0.3" />
              <line x1="400" y1="45" x2="400" y2="210" stroke="#ef4444" strokeWidth="1" opacity="0.3" />
              <line x1="720" y1="45" x2="720" y2="210" stroke="#22c55e" strokeWidth="1" opacity="0.3" />

              {/* Client → Server [via Attacker]: ClientHello (HTTP) */}
              <line x1="80" y1="70" x2="400" y2="70" stroke="#ef4444" strokeWidth="1.5" markerEnd="url(#arr)" />
              <text x="240" y="64" fill="#fca5a5" fontSize="9" textAnchor="middle">HTTP Request (Exposed)</text>

              {/* Attacker → Server: ClientHello (HTTPS) */}
              <line x1="400" y1="95" x2="720" y2="95" stroke="#22c55e" strokeWidth="1.5" />
              <text x="560" y="89" fill="#86efac" fontSize="9" textAnchor="middle">TLS ClientHello (Encrypted)</text>

              {/* Server → Attacker: ServerHello */}
              <line x1="720" y1="120" x2="400" y2="120" stroke="#22c55e" strokeWidth="1.5" />
              <text x="560" y="114" fill="#86efac" fontSize="9" textAnchor="middle">TLS ServerHello + Cert</text>

              {/* Attacker → Client: HTTP response (stripped) */}
              <line x1="400" y1="145" x2="80" y2="145" stroke="#ef4444" strokeWidth="1.5" />
              <text x="240" y="139" fill="#fca5a5" fontSize="9" textAnchor="middle">HTTP Response (Unencrypted)</text>

              {/* X mark - indicating interception */}
              <motion.text
                x="400" y="180" fill="#fbbf24" fontSize="18" textAnchor="middle" fontWeight="bold"
                animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ⚡ SSL Stripping ⚡
              </motion.text>

              {/* interrupted line */}
              <line x1="80" y1="200" x2="720" y2="200" stroke="#fbbf24" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
              <text x="400" y="215" fill="#6b7280" fontSize="8" textAnchor="middle">
                Direct Secure Connection - Disabled
              </text>
            </svg>
          </div>
        </motion.div>

        {/* Footer spacer */}
        <div className="h-8" />
      </div>
    </PageShell>
  );
}