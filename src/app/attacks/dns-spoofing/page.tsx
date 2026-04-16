"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Play,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  Monitor,
  Server,
  Skull,
  Eye,
  Search,
  Gauge,
  Info,
  Wrench,
  Bug,
  Lock,
  LockOpen,
  ArrowLeftRight,
} from "lucide-react";
import PageShell from "@/components/PageShell";

type Phase = "idle" | "querying" | "intercepting" | "spoofing" | "redirected" | "complete";
type Speed = "slow" | "normal" | "fast";

const SPEED_MAP: Record<Speed, number> = { slow: 2, normal: 1, fast: 0.5 };

const REAL_IP = "93.184.216.34";
const FAKE_IP = "10.0.0.66";
const TARGET_DOMAIN = "bank.example.com";

const terminalLines = [
  { cmd: "$ dnsspoof -i eth0", phase: "querying" as Phase },
  { cmd: "[*] تشغيل خادم DNS المزيف على المنفذ 53...", phase: "querying" as Phase },
  { cmd: "$ ettercap -T -q -i eth0 -P dns_spoof", phase: "querying" as Phase },
  { cmd: "[*] تحميل إضافة dns_spoof...", phase: "querying" as Phase },
  { cmd: `$ dig ${TARGET_DOMAIN}`, phase: "intercepting" as Phase },
  { cmd: `;; QUESTION SECTION:`, phase: "intercepting" as Phase },
  { cmd: `;; ${TARGET_DOMAIN}.    IN    A`, phase: "intercepting" as Phase },
  { cmd: `[!] اعتراض استعلام DNS لـ ${TARGET_DOMAIN}`, phase: "intercepting" as Phase },
  { cmd: `[*] إرسال استجابة مزيفة: ${TARGET_DOMAIN} → ${FAKE_IP}`, phase: "spoofing" as Phase },
  { cmd: `;; ANSWER SECTION:`, phase: "spoofing" as Phase },
  { cmd: `;; ${TARGET_DOMAIN}.  300  IN  A  ${FAKE_IP}`, phase: "spoofing" as Phase },
  { cmd: `$ nslookup ${TARGET_DOMAIN}`, phase: "redirected" as Phase },
  { cmd: `Server:  10.0.0.66`, phase: "redirected" as Phase },
  { cmd: `Address: ${FAKE_IP}#53`, phase: "redirected" as Phase },
  { cmd: `[✓] الضحية متصل بالموقع المزيف!`, phase: "redirected" as Phase },
  { cmd: `[>] POST /login → username=admin&password=●●●●●●`, phase: "complete" as Phase },
  { cmd: `[!] تم اعتراض بيانات الدخول بنجاح`, phase: "complete" as Phase },
];

const phaseLabel: Record<Phase, string> = {
  idle: "في الانتظار",
  querying: "إرسال استعلام DNS",
  intercepting: "اعتراض الاستعلام",
  spoofing: "إرسال رد مزيف",
  redirected: "إعادة التوجيه",
  complete: "تم الاختراق",
};

const phaseLabelSvg: Record<Phase, string> = {
  idle: "Idle",
  querying: "DNS Query",
  intercepting: "Intercepting",
  spoofing: "Sending Fake Reply",
  redirected: "Redirected",
  complete: "Compromised",
};

export default function DnsSpoofingPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [speed, setSpeed] = useState<Speed>("normal");
  const [visibleLines, setVisibleLines] = useState(0);
  const [progress, setProgress] = useState(0);
  const [dnssecEnabled, setDnssecEnabled] = useState(false);
  const [dnssecBlocked, setDnssecBlocked] = useState(false);
  const [typedUser, setTypedUser] = useState("");
  const [typedPass, setTypedPass] = useState("");
  const [showCaptured, setShowCaptured] = useState(false);
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
    setVisibleLines(0);
    setProgress(0);
    setTypedUser("");
    setTypedPass("");
    setShowCaptured(false);
    setDnssecBlocked(false);
    setPhase("querying");

    if (dnssecEnabled) {
      const phases: { p: Phase; delay: number }[] = [
        { p: "querying", delay: 0 },
        { p: "intercepting", delay: 3000 * mult },
      ];
      phases.forEach(({ p, delay }) => {
        timerRef.current.push(setTimeout(() => setPhase(p), delay));
      });
      timerRef.current.push(setTimeout(() => setDnssecBlocked(true), 5000 * mult));
      timerRef.current.push(setTimeout(() => setPhase("idle"), 8000 * mult));

      const total = 8000 * mult;
      const steps = total / 100;
      for (let i = 0; i <= steps; i++) {
        timerRef.current.push(setTimeout(() => setProgress(Math.min((i / steps) * 100, 100)), i * 100));
      }
      // show only first 8 terminal lines
      for (let i = 0; i < 8; i++) {
        timerRef.current.push(setTimeout(() => setVisibleLines(i + 1), ((i + 1) / 8) * total));
      }
      return;
    }

    const phases: { p: Phase; delay: number }[] = [
      { p: "querying", delay: 0 },
      { p: "intercepting", delay: 3000 * mult },
      { p: "spoofing", delay: 6000 * mult },
      { p: "redirected", delay: 9000 * mult },
      { p: "complete", delay: 13000 * mult },
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

    // Auto-type credentials
    const creds = "admin";
    const passChars = "P@ssw0rd";
    creds.split("").forEach((ch, i) => {
      timerRef.current.push(setTimeout(() => setTypedUser((p) => p + ch), 13500 * mult + i * 200 * mult));
    });
    passChars.split("").forEach((ch, i) => {
      timerRef.current.push(setTimeout(() => setTypedPass((p) => p + ch), 14200 * mult + i * 150 * mult));
    });
    timerRef.current.push(setTimeout(() => setShowCaptured(true), 14800 * mult));
  };

  const reset = () => {
    cleanup();
    setPhase("idle");
    setVisibleLines(0);
    setProgress(0);
    setTypedUser("");
    setTypedPass("");
    setShowCaptured(false);
    setDnssecBlocked(false);
  };

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [visibleLines]);

  const phaseIndex = ["idle", "querying", "intercepting", "spoofing", "redirected", "complete"].indexOf(phase);
  const isPostSpoof = phase === "redirected" || phase === "complete";
  const resolvedIP = isPostSpoof || phase === "spoofing" ? FAKE_IP : REAL_IP;
  const sslValid = !isPostSpoof;

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
        {/* ===== HEADER ===== */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Globe className="w-9 h-9 text-cyan-400" />
            <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-cyan-400 via-purple-400 to-red-400 bg-clip-text text-transparent">
              تزييف استجابات DNS
            </h1>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
            هجوم تزييف DNS يسمح للمهاجم بتحويل اسم النطاق إلى عنوان IP مزيف، مما يوجّه الضحية
            إلى موقع خبيث يبدو مطابقاً للموقع الأصلي لسرقة بيانات الدخول والمعلومات الحساسة
          </p>
        </motion.div>

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
          <svg viewBox="0 0 920 520" className="w-full h-auto">
            <defs>
              <filter id="dns-glow-cyan">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="dns-glow-red">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="dns-glow-green">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* === BROWSER (top-left) === */}
            <g>
              <motion.rect x="30" y="30" width="220" height="140" rx="12" fill="#111827" stroke="#22d3ee" strokeWidth="2" filter="url(#dns-glow-cyan)" />
              {/* Address bar */}
              <rect x="42" y="45" width="196" height="22" rx="5" fill="#0f172a" stroke="#334155" strokeWidth="1" />
              <motion.circle cx="52" cy="56" r="4" fill={sslValid ? "#22c55e" : "#ef4444"} animate={{ fill: sslValid ? "#22c55e" : "#ef4444" }} />
              <text x="62" y="60" fill="#94a3b8" fontSize="8.5" fontFamily="monospace">{TARGET_DOMAIN}</text>
              {/* Browser icon */}
              <Monitor className="w-4 h-4" />
              <rect x="122" y="78" width="18" height="14" rx="2" fill="#22d3ee" opacity="0.7" />
              <text x="140" y="89" fill="#22d3ee" fontSize="10" fontWeight="bold" textAnchor="middle">Victim Browser</text>
              <text x="140" y="110" fill="#9ca3af" fontSize="9" textAnchor="middle">192.168.1.105</text>
              {/* Resolution result */}
              {phase !== "idle" && (
                <motion.text x="140" y="130" fill={isPostSpoof ? "#ef4444" : "#22c55e"} fontSize="8" textAnchor="middle" fontFamily="monospace"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  DNS → {resolvedIP}
                </motion.text>
              )}
              {isPostSpoof && (
                <motion.text x="140" y="155" fill="#fbbf24" fontSize="7.5" textAnchor="middle"
                  initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.5, 1] }} transition={{ duration: 1.5 }}>
                  ⚠ Connected to fake site!
                </motion.text>
              )}
            </g>

            {/* === LEGITIMATE DNS SERVER (top-right) === */}
            <g>
              <motion.rect x="660" y="30" width="220" height="130" rx="12" fill="#111827" stroke="#22c55e" strokeWidth="2" filter="url(#dns-glow-green)"
                animate={{ strokeOpacity: phase === "idle" ? 0.5 : 1 }} />
              <circle cx="695" cy="65" r="12" fill="none" stroke="#22c55e" strokeWidth="1.8" opacity="0.8" />
              <text x="695" y="69" fill="#22c55e" fontSize="10" textAnchor="middle" fontWeight="bold">D</text>
              <text x="770" y="69" fill="#22c55e" fontSize="10" fontWeight="bold" textAnchor="middle">Legit DNS Server</text>
              <text x="770" y="95" fill="#9ca3af" fontSize="9" textAnchor="middle">8.8.8.8</text>
              <text x="770" y="115" fill="#6b7280" fontSize="8" textAnchor="middle" fontFamily="monospace">
                {TARGET_DOMAIN} → {REAL_IP}
              </text>
              {phase === "intercepting" && (
                <motion.text x="770" y="145" fill="#fbbf24" fontSize="8" textAnchor="middle"
                  initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  Legit response blocked
                </motion.text>
              )}
            </g>

            {/* === ATTACKER DNS (center) === */}
            <g>
              <motion.rect x="360" y="220" width="200" height="130" rx="12" fill="#1a0a0a" stroke="#ef4444" strokeWidth="2" filter="url(#dns-glow-red)"
                animate={{ stroke: phase === "idle" ? "#ef4444" : ["#ef4444", "#ff6b6b", "#ef4444"], strokeWidth: phase !== "idle" ? [2, 3, 2] : 2 }}
                transition={{ duration: 1.5, repeat: Infinity }} />
              <text x="460" y="252" fill="#ef4444" fontSize="12" fontWeight="bold" textAnchor="middle">☠ Attacker DNS</text>
              <text x="460" y="275" fill="#9ca3af" fontSize="9" textAnchor="middle">{FAKE_IP}</text>
              <text x="460" y="295" fill="#6b7280" fontSize="8" textAnchor="middle" fontFamily="monospace">
                {TARGET_DOMAIN} → {FAKE_IP}
              </text>
              <text x="460" y="330" fill="#fbbf24" fontSize="9" textAnchor="middle" opacity="0.9">
                {phase === "idle" ? "Ready" : phase === "querying" ? "Waiting..." : phase === "intercepting" ? "Intercepting..." : phase === "spoofing" ? "Spoofing..." : phase === "redirected" ? "Spoofed" : "Complete ✓"}
              </text>
            </g>

            {/* === FAKE WEB SERVER (bottom-right) === */}
            <g>
              <motion.rect x="660" y="350" width="220" height="120" rx="12" fill="#1a0505" stroke="#ef4444" strokeWidth="1.5"
                animate={{ opacity: isPostSpoof ? 1 : 0.4 }} />
              <text x="770" y="385" fill="#ef4444" fontSize="11" fontWeight="bold" textAnchor="middle">Fake Web Server</text>
              <text x="770" y="408" fill="#9ca3af" fontSize="9" textAnchor="middle">{FAKE_IP}</text>
              <text x="770" y="430" fill="#6b7280" fontSize="8" textAnchor="middle">Cloned login page</text>
              {isPostSpoof && (
                <motion.rect x="700" y="440" width="140" height="18" rx="4" fill="#dc2626" opacity="0.3"
                  animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 1.2, repeat: Infinity }} />
              )}
              {isPostSpoof && (
                <motion.text x="770" y="453" fill="#fca5a5" fontSize="7.5" textAnchor="middle">Stealing credentials</motion.text>
              )}
            </g>

            {/* Phase 1: DNS Query - blue packet Browser → DNS Server */}
            {phase === "querying" && (
              <>
                <motion.line x1="250" y1="100" x2="660" y2="95" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
                {[0, 1, 2].map((d) => (
                  <motion.g key={`q-${d}`}>
                    <motion.rect width="65" height="18" rx="4" fill="#3b82f6"
                      initial={{ x: 250, y: 82, opacity: 0 }} animate={{ x: 630, y: 82, opacity: [0, 1, 1, 0] }}
                      transition={{ duration: 2 * mult, delay: d * 0.8 * mult, repeat: Infinity, repeatDelay: 0.5 * mult }} />
                    <motion.text fontSize="7" fill="white" fontWeight="bold"
                      initial={{ x: 258, y: 95, opacity: 0 }} animate={{ x: 638, y: 95, opacity: [0, 1, 1, 0] }}
                      transition={{ duration: 2 * mult, delay: d * 0.8 * mult, repeat: Infinity, repeatDelay: 0.5 * mult }}>
                      DNS Query
                    </motion.text>
                  </motion.g>
                ))}
              </>
            )}

            {/* Phase 2: Intercept - red hand catches packet */}
            {phase === "intercepting" && (
              <>
                {/* query line */}
                <motion.line x1="250" y1="100" x2="460" y2="235" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="5 3"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 * mult }} />
                {/* red intercept pulses */}
                {[0, 0.6, 1.2].map((d, i) => (
                  <motion.circle key={`int-${i}`} cx="460" cy="220" fill="none" stroke="#ef4444" strokeWidth="1.5"
                    initial={{ r: 8, opacity: 0.8 }} animate={{ r: 80, opacity: 0 }}
                    transition={{ duration: 1.5 * mult, delay: d * mult, repeat: Infinity }} />
                ))}
                {/* hand icon at intercept point */}
                <motion.text x="445" y="210" fill="#ef4444" fontSize="22"
                  animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
                  ✋
                </motion.text>
                {/* cross over legit DNS line */}
                <motion.line x1="460" y1="235" x2="660" y2="95" stroke="#374151" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.3" />
                <motion.text x="560" y="155" fill="#ef4444" fontSize="9" textAnchor="middle" fontWeight="bold"
                  animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  ✕ Blocked
                </motion.text>
              </>
            )}

            {/* Phase 3: Fake response - red packet Attacker → Browser */}
            {phase === "spoofing" && (
              <>
                <motion.line x1="360" y1="260" x2="250" y2="130" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.6" />
                {[0, 0.7, 1.4].map((d, i) => (
                  <motion.g key={`spoof-${i}`}>
                    <motion.rect width="75" height="18" rx="4" fill="#dc2626"
                      initial={{ x: 365, y: 245, opacity: 0 }} animate={{ x: 175, y: 112, opacity: [0, 1, 1, 0] }}
                      transition={{ duration: 1.5 * mult, delay: d * mult, repeat: Infinity, repeatDelay: 0.5 * mult }} />
                    <motion.text fontSize="7" fill="white" fontWeight="bold"
                      initial={{ x: 370, y: 258, opacity: 0 }} animate={{ x: 180, y: 125, opacity: [0, 1, 1, 0] }}
                      transition={{ duration: 1.5 * mult, delay: d * mult, repeat: Infinity, repeatDelay: 0.5 * mult }}>
                      Fake Reply
                    </motion.text>
                  </motion.g>
                ))}
                {/* IP being injected */}
                <motion.text x="300" y="185" fill="#fbbf24" fontSize="9" textAnchor="middle" fontFamily="monospace"
                  animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                  A: {TARGET_DOMAIN} → {FAKE_IP}
                </motion.text>
              </>
            )}

            {/* Phase 4 & 5: Redirected - Browser connects to fake server */}
            {isPostSpoof && (
              <>
                <motion.line x1="250" y1="140" x2="660" y2="400" stroke="#ef4444" strokeWidth="2" strokeDasharray="6 4"
                  initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.8 }}
                  transition={{ duration: 1.5 * mult }} />
                {/* data dots flowing */}
                {[0, 0.5, 1.0, 1.5].map((d, i) => (
                  <motion.circle key={`redir-${i}`} r="4" fill="#ef4444"
                    initial={{ cx: 250, cy: 140, opacity: 0 }}
                    animate={{ cx: 660, cy: 400, opacity: [0, 1, 1, 0.3] }}
                    transition={{ duration: 1.5 * mult, delay: d * mult, repeat: Infinity, repeatDelay: 0.3 * mult }} />
                ))}
              </>
            )}

            {/* Phase 5: Side-by-side comparison */}
            {phase === "complete" && (
              <>
                {/* Real site (green) */}
                <motion.g initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                  <rect x="40" y="380" width="130" height="95" rx="8" fill="#0f172a" stroke="#22c55e" strokeWidth="2" />
                  <text x="105" y="402" fill="#22c55e" fontSize="9" textAnchor="middle" fontWeight="bold">Real Site ✓</text>
                  <rect x="52" y="410" width="106" height="10" rx="2" fill="#1e293b" />
                  <text x="105" y="418" fill="#4ade80" fontSize="6" textAnchor="middle">🔒 {TARGET_DOMAIN}</text>
                  <rect x="52" y="425" width="106" height="6" rx="1" fill="#22c55e" opacity="0.2" />
                  <rect x="52" y="434" width="80" height="6" rx="1" fill="#22c55e" opacity="0.15" />
                  <rect x="52" y="443" width="106" height="18" rx="3" fill="#22c55e" opacity="0.15" />
                  <text x="105" y="455" fill="#22c55e" fontSize="7" textAnchor="middle">Login</text>
                  <text x="105" y="470" fill="#6b7280" fontSize="7" textAnchor="middle">IP: {REAL_IP}</text>
                </motion.g>
                {/* Fake site (red) */}
                <motion.g initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                  <rect x="190" y="380" width="130" height="95" rx="8" fill="#0f172a" stroke="#ef4444" strokeWidth="2" />
                  <text x="255" y="402" fill="#ef4444" fontSize="9" textAnchor="middle" fontWeight="bold">Fake Site ✕</text>
                  <rect x="202" y="410" width="106" height="10" rx="2" fill="#1e293b" />
                  <text x="255" y="418" fill="#fca5a5" fontSize="6" textAnchor="middle">🔓 {TARGET_DOMAIN}</text>
                  <rect x="202" y="425" width="106" height="6" rx="1" fill="#ef4444" opacity="0.2" />
                  <rect x="202" y="434" width="80" height="6" rx="1" fill="#ef4444" opacity="0.15" />
                  <rect x="202" y="443" width="106" height="18" rx="3" fill="#ef4444" opacity="0.15" />
                  <text x="255" y="455" fill="#ef4444" fontSize="7" textAnchor="middle">Login</text>
                  <text x="255" y="470" fill="#6b7280" fontSize="7" textAnchor="middle">IP: {FAKE_IP}</text>
                </motion.g>
                <motion.text x="170" y="435" fill="#fbbf24" fontSize="18" textAnchor="middle"
                  animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }}>
                  ≈
                </motion.text>
              </>
            )}

            {/* DNSSEC Blocked */}
            {dnssecBlocked && (
              <motion.g initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                <rect x="280" y="170" width="360" height="70" rx="12" fill="#052e16" stroke="#22c55e" strokeWidth="2" />
                <text x="460" y="198" fill="#4ade80" fontSize="13" textAnchor="middle" fontWeight="bold">🛡 DNSSEC: Fake response blocked!</text>
                <text x="460" y="220" fill="#86efac" fontSize="10" textAnchor="middle">Invalid signature — Attack failed</text>
              </motion.g>
            )}

            {/* Phase label */}
            <motion.text x="460" y="505" textAnchor="middle"
              fill={phase === "complete" ? "#ef4444" : dnssecBlocked ? "#22c55e" : "#fbbf24"}
              fontSize="13" fontWeight="bold"
              animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.5, repeat: Infinity }}>
              {dnssecBlocked ? "DNSSEC blocked the attack ✓" : phaseLabelSvg[phase]}
            </motion.text>
          </svg>
        </motion.div>

        {/* ===== INTERACTIVE BROWSER MOCKUP ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-gray-950/80 border border-gray-700/50 rounded-2xl p-5 mb-8"
        >
          <h2 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            محاكاة المتصفح
          </h2>
          <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-600/50 max-w-2xl mx-auto">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-900 border-b border-gray-700">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-1.5 mx-2" dir="ltr">
                <motion.div animate={{ color: sslValid && phase !== "idle" ? "#22c55e" : isPostSpoof ? "#ef4444" : "#6b7280" }}>
                  {sslValid && phase !== "idle" ? <Lock className="w-3.5 h-3.5" /> : isPostSpoof ? <LockOpen className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5 text-gray-600" />}
                </motion.div>
                <span className={`text-sm font-mono ${isPostSpoof ? "text-red-400" : "text-gray-300"}`}>
                  https://{TARGET_DOMAIN}
                </span>
                {isPostSpoof && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-400 mr-2">
                    ← {FAKE_IP}
                  </motion.span>
                )}
              </div>
            </div>
            {/* Page content */}
            <div className="p-6 min-h-50">
              {phase === "idle" && (
                <div className="text-center text-gray-500 py-8">
                  <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">ابدأ المحاكاة لرؤية الهجوم</p>
                </div>
              )}
              {(phase === "querying" || phase === "intercepting" || phase === "spoofing") && (
                <div className="text-center py-8">
                  <motion.div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-3"
                    animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                  <p className="text-gray-400 text-sm">جاري تحميل {TARGET_DOMAIN}...</p>
                  <p className="text-gray-600 text-xs mt-1">DNS lookup in progress</p>
                </div>
              )}
              {isPostSpoof && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xs mx-auto" dir="rtl">
                  <div className="text-center mb-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg">B</div>
                    <h3 className="text-white font-bold text-sm">تسجيل الدخول - البنك</h3>
                    <p className="text-gray-400 text-xs">أدخل بياناتك للمتابعة</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-gray-400 text-xs block mb-1">اسم المستخدم</label>
                      <div className="bg-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-white" dir="ltr">
                        {typedUser}<motion.span className="inline-block w-0.5 h-4 bg-cyan-400 align-middle" animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} />
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs block mb-1">كلمة المرور</label>
                      <div className="bg-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-white" dir="ltr">
                        {"●".repeat(typedPass.length)}<motion.span className="inline-block w-0.5 h-4 bg-cyan-400 align-middle" animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} />
                      </div>
                    </div>
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-bold">دخول</button>
                  </div>
                  {showCaptured && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                      className="mt-4 bg-red-950/50 border border-red-700/50 rounded-lg p-3 text-center">
                      <p className="text-red-400 text-xs font-bold">⚠ تم اعتراض البيانات من المهاجم!</p>
                      <p className="text-red-300 text-xs font-mono mt-1" dir="ltr">user: {typedUser} | pass: {typedPass}</p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ===== CONTROL PANEL ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-6 mb-8"
        >
          <h2 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
            <Gauge className="w-5 h-5" />
            لوحة التحكم
          </h2>
          <div className="flex flex-wrap items-center gap-4 mb-5">
            <button onClick={startSimulation} disabled={phase !== "idle" && phase !== "complete"}
              className="flex items-center gap-2 bg-linear-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold transition-all">
              <Play className="w-4 h-4" />
              بدء الهجوم
            </button>
            <button onClick={reset} disabled={phase === "idle"}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold transition-all">
              <RotateCcw className="w-4 h-4" />
              إعادة التعيين
            </button>
            <div className="flex items-center gap-2 mr-auto">
              <span className="text-gray-400 text-sm">السرعة:</span>
              {(["slow", "normal", "fast"] as Speed[]).map((s) => (
                <button key={s} onClick={() => phase === "idle" && setSpeed(s)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${speed === s ? "bg-cyan-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
                  {s === "slow" ? "بطيء" : s === "normal" ? "عادي" : "سريع"}
                </button>
              ))}
            </div>
          </div>

          {/* DNSSEC Toggle */}
          <div className="flex items-center gap-3 mb-5 bg-gray-800/60 rounded-xl p-3 border border-gray-700/30">
            <ShieldCheck className="w-5 h-5 text-green-400" />
            <span className="text-gray-300 text-sm font-bold">وضع DNSSEC:</span>
            <button onClick={() => phase === "idle" && setDnssecEnabled(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!dnssecEnabled ? "bg-red-600/30 text-red-300 border border-red-500/50" : "bg-gray-800 text-gray-500 hover:bg-gray-700"}`}>
              <LockOpen className="w-3 h-3 inline ml-1" />
              بدون DNSSEC
            </button>
            <button onClick={() => phase === "idle" && setDnssecEnabled(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${dnssecEnabled ? "bg-green-600/30 text-green-300 border border-green-500/50" : "bg-gray-800 text-gray-500 hover:bg-gray-700"}`}>
              <Lock className="w-3 h-3 inline ml-1" />
              مع DNSSEC
            </button>
          </div>

          {/* Phase indicators */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {(["querying", "intercepting", "spoofing", "redirected", "complete"] as Phase[]).map((p, i) => {
              const active = ["querying", "intercepting", "spoofing", "redirected", "complete"].indexOf(phase) >= i;
              return (
                <div key={p} className="flex items-center gap-2">
                  <motion.div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0 ${active ? "bg-cyan-600/30 border-cyan-400 text-cyan-300" : "bg-gray-800 border-gray-600 text-gray-500"}`}
                    animate={phase === p ? { scale: [1, 1.15, 1] } : {}} transition={{ duration: 0.8, repeat: Infinity }}>
                    {i + 1}
                  </motion.div>
                  <span className={`text-xs ${active ? "text-cyan-300" : "text-gray-600"}`}>{phaseLabel[p]}</span>
                  {i < 4 && <div className={`w-6 h-0.5 ${active ? "bg-cyan-600" : "bg-gray-700"}`} />}
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
            <motion.div className="h-full bg-linear-to-r from-cyan-500 via-purple-500 to-red-500 rounded-full"
              style={{ width: `${progress}%` }} transition={{ duration: 0.1 }} />
          </div>
          <p className="text-gray-500 text-xs mt-1 text-left" dir="ltr">{Math.round(progress)}%</p>
        </motion.div>

        {/* ===== TERMINAL FEED ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
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
          <div ref={terminalRef} className="h-56 overflow-y-auto space-y-1 text-sm scrollbar-thin scrollbar-thumb-gray-700" dir="ltr">
            <AnimatePresence>
              {terminalLines.slice(0, visibleLines).map((line, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
                  className={
                    line.cmd.startsWith("$") ? "text-green-400"
                    : line.cmd.startsWith("[✓]") ? "text-yellow-400"
                    : line.cmd.startsWith("[!]") ? "text-red-400"
                    : line.cmd.startsWith("[>]") ? "text-purple-400"
                    : line.cmd.startsWith("[*]") ? "text-cyan-400"
                    : line.cmd.startsWith(";;") ? "text-blue-400"
                    : "text-gray-400"
                  }>
                  {line.cmd}
                </motion.div>
              ))}
            </AnimatePresence>
            {phase !== "idle" && phase !== "complete" && (
              <motion.span className="inline-block w-2 h-4 bg-green-400"
                animate={{ opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity }} />
            )}
          </div>
        </motion.div>

        {/* ===== ANALYSIS CARDS ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* كيف يعمل الهجوم */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-5">
            <h3 className="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2">
              <Info className="w-5 h-5" />
              كيف يعمل تزييف DNS
            </h3>
            <ol className="space-y-2 text-gray-300 text-sm list-decimal list-inside">
              <li>الضحية يطلب عنوان IP لموقع <span className="text-cyan-300 font-mono">{TARGET_DOMAIN}</span></li>
              <li>المهاجم يعترض استعلام DNS قبل وصوله للخادم الشرعي</li>
              <li>يرسل المهاجم استجابة DNS مزيفة بعنوان IP خاطئ ({FAKE_IP})</li>
              <li>المتصفح يتصل بخادم المهاجم بدلاً من الخادم الحقيقي</li>
              <li>يعرض المهاجم صفحة مطابقة للموقع الأصلي</li>
              <li>الضحية يدخل بياناته دون أن يشك في شيء</li>
              <li>المهاجم يسجل جميع البيانات المدخلة</li>
            </ol>
          </motion.div>

          {/* الأدوات المستخدمة */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-5">
            <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              الأدوات المستخدمة
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "dnsspoof", desc: "أداة تزييف DNS من حزمة dsniff" },
                { name: "ettercap", desc: "إضافة dns_spoof لاعتراض وتزييف DNS" },
                { name: "dnschef", desc: "Proxy DNS قابل للتخصيص" },
                { name: "Responder", desc: "أداة LLMNR/NBT-NS/mDNS" },
              ].map((tool) => (
                <div key={tool.name} className="bg-gray-800/60 rounded-xl p-3 border border-gray-700/30">
                  <p className="text-cyan-300 font-mono text-sm font-bold">{tool.name}</p>
                  <p className="text-gray-500 text-xs mt-1">{tool.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* طرق الكشف */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-5">
            <h3 className="text-lg font-bold text-orange-400 mb-3 flex items-center gap-2">
              <Bug className="w-5 h-5" />
              طرق الكشف
            </h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <Search className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                <span><strong>DNSSEC Validation:</strong> التحقق من التوقيعات الرقمية لاستجابات DNS</span>
              </li>
              <li className="flex items-start gap-2">
                <Search className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                <span><strong>DNS Monitoring:</strong> مراقبة الاستعلامات والاستجابات المشبوهة</span>
              </li>
              <li className="flex items-start gap-2">
                <Search className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                <span><strong>Cache Inspection:</strong> فحص ذاكرة DNS المؤقتة للكشف عن التلاعب</span>
              </li>
              <li className="flex items-start gap-2">
                <Search className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                <span><strong>TTL Analysis:</strong> كشف قيم TTL غير طبيعية في الاستجابات</span>
              </li>
            </ul>
          </motion.div>

          {/* الحماية */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-5">
            <h3 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              الحماية
            </h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                <span><strong>DNSSEC:</strong> توقيع رقمي للتحقق من صحة استجابات DNS</span>
              </li>
              <li className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                <span><strong>DoH (DNS over HTTPS):</strong> تشفير استعلامات DNS عبر HTTPS</span>
              </li>
              <li className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                <span><strong>DoT (DNS over TLS):</strong> تشفير DNS عبر TLS على المنفذ 853</span>
              </li>
              <li className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                <span><strong>DNS Filtering:</strong> استخدام خوادم DNS موثوقة مع تصفية المحتوى</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* ===== DNS RESOLUTION DIAGRAM ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-6 mb-8"
        >
          <h2 className="text-lg font-bold text-purple-400 mb-5 flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5" />
            مقارنة مسار DNS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Normal path */}
            <div className="bg-gray-950/80 rounded-xl p-5 border border-green-900/30">
              <h3 className="text-green-400 font-bold text-sm mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                المسار الطبيعي (آمن)
              </h3>
              <div className="space-y-3" dir="ltr">
                {[
                  { label: "Browser", sub: "DNS Query", color: "border-cyan-600", arrow: true },
                  { label: "Root DNS (.)", sub: "Referral", color: "border-gray-600", arrow: true },
                  { label: "TLD DNS (.com)", sub: "Referral", color: "border-gray-600", arrow: true },
                  { label: "Auth DNS", sub: `A: ${REAL_IP}`, color: "border-green-600", arrow: true },
                  { label: "Real Server", sub: REAL_IP, color: "border-green-600", arrow: false },
                ].map((step, i) => (
                  <div key={i}>
                    <div className={`flex items-center gap-3 bg-gray-800/60 rounded-lg p-2.5 border-r-2 ${step.color}`}>
                      <div className="w-6 h-6 rounded-full bg-green-900/50 flex items-center justify-center text-green-400 text-xs font-bold shrink-0">{i + 1}</div>
                      <div>
                        <p className="text-gray-200 text-xs font-bold">{step.label}</p>
                        <p className="text-gray-500 text-xs">{step.sub}</p>
                      </div>
                    </div>
                    {step.arrow && <div className="text-center text-green-600 text-xs my-1">↓</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Spoofed path */}
            <div className="bg-gray-950/80 rounded-xl p-5 border border-red-900/30">
              <h3 className="text-red-400 font-bold text-sm mb-4 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                المسار المزيف (مخترق)
              </h3>
              <div className="space-y-3" dir="ltr">
                {[
                  { label: "Browser", sub: "DNS Query", color: "border-cyan-600", arrow: true },
                  { label: "Attacker Intercepts", sub: "Query captured!", color: "border-red-600", arrow: true },
                  { label: "Fake DNS Response", sub: `A: ${FAKE_IP}`, color: "border-red-600", arrow: true },
                  { label: "DNS Cache Poisoned", sub: "Cached fake IP", color: "border-yellow-600", arrow: true },
                  { label: "Fake Server", sub: FAKE_IP, color: "border-red-600", arrow: false },
                ].map((step, i) => (
                  <div key={i}>
                    <div className={`flex items-center gap-3 bg-gray-800/60 rounded-lg p-2.5 border-r-2 ${step.color}`}>
                      <div className={`w-6 h-6 rounded-full ${i > 0 && i < 4 ? "bg-red-900/50 text-red-400" : "bg-gray-700 text-gray-400"} flex items-center justify-center text-xs font-bold shrink-0`}>{i + 1}</div>
                      <div>
                        <p className="text-gray-200 text-xs font-bold">{step.label}</p>
                        <p className={`text-xs ${i > 0 && i < 4 ? "text-red-400" : "text-gray-500"}`}>{step.sub}</p>
                      </div>
                    </div>
                    {step.arrow && <div className="text-center text-red-600 text-xs my-1">↓</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DNS Hierarchy */}
          <div className="mt-6 bg-gray-950/80 rounded-xl p-5 border border-gray-800">
            <h3 className="text-gray-300 font-bold text-sm mb-4 text-center">تسلسل نظام DNS الهرمي</h3>
            <div className="flex items-center justify-center gap-3 flex-wrap" dir="ltr">
              {[
                { label: "Root (.)", color: "bg-purple-900/50 border-purple-500 text-purple-300" },
                { label: ".com TLD", color: "bg-blue-900/50 border-blue-500 text-blue-300" },
                { label: "example.com", color: "bg-cyan-900/50 border-cyan-500 text-cyan-300" },
                { label: "bank.example.com", color: "bg-green-900/50 border-green-500 text-green-300" },
              ].map((node, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`${node.color} border rounded-xl px-4 py-2 text-xs font-bold font-mono`}>{node.label}</div>
                  {i < 3 && <span className="text-gray-600 text-lg">→</span>}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ===== DNS CACHE COMPARISON ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-6 mb-8"
        >
          <h2 className="text-lg font-bold text-cyan-400 mb-5 flex items-center gap-2">
            <Server className="w-5 h-5" />
            ذاكرة DNS المؤقتة (قبل وبعد الهجوم)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-950/80 rounded-xl p-4 border border-gray-800">
              <h4 className="text-green-400 font-bold text-sm mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                قبل الهجوم (سليم)
              </h4>
              <table className="w-full text-xs font-mono" dir="ltr">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-800">
                    <th className="text-left pb-2">Domain</th>
                    <th className="text-left pb-2">IP Address</th>
                    <th className="text-left pb-2">TTL</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr><td className="py-1">{TARGET_DOMAIN}</td><td className="text-green-400">{REAL_IP}</td><td>300</td></tr>
                  <tr><td className="py-1">google.com</td><td className="text-green-400">142.250.80.46</td><td>250</td></tr>
                  <tr><td className="py-1">example.com</td><td className="text-green-400">93.184.216.34</td><td>180</td></tr>
                </tbody>
              </table>
            </div>
            <div className="bg-gray-950/80 rounded-xl p-4 border border-red-900/30">
              <h4 className="text-red-400 font-bold text-sm mb-3 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                بعد الهجوم (ملوّث)
              </h4>
              <table className="w-full text-xs font-mono" dir="ltr">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-800">
                    <th className="text-left pb-2">Domain</th>
                    <th className="text-left pb-2">IP Address</th>
                    <th className="text-left pb-2">TTL</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr><td className="py-1">{TARGET_DOMAIN}</td><td className="text-red-400 font-bold">{FAKE_IP} ⚠</td><td className="text-red-400">86400</td></tr>
                  <tr><td className="py-1">google.com</td><td className="text-green-400">142.250.80.46</td><td>250</td></tr>
                  <tr><td className="py-1">example.com</td><td className="text-green-400">93.184.216.34</td><td>180</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </PageShell>
  );
}
