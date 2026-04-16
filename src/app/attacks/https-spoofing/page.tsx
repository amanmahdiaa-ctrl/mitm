"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileKey,
  ShieldAlert,
  ShieldCheck,
  Play,
  RotateCcw,
  Terminal,
  Eye,
  Gauge,
  Info,
  Wrench,
  Bug,
  Lock,
  LockOpen,
  Monitor,
  Server,
  Skull,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Shield,
  Fingerprint,
  Globe,
} from "lucide-react";
import PageShell from "@/components/PageShell";

/* ───── types & constants ───── */
type Phase = "idle" | "generating" | "fakeChain" | "intercept" | "warning" | "complete";
type Speed = "slow" | "normal" | "fast";

const SPEED_MAP: Record<Speed, number> = { slow: 2, normal: 1, fast: 0.5 };

const terminalLines = [
  { cmd: "$ openssl genrsa -out attacker-ca.key 2048", phase: "generating" as Phase },
  { cmd: "[*] توليد مفتاح RSA للجهة المُصدّقة المزيفة...", phase: "generating" as Phase },
  { cmd: '$ openssl req -x509 -new -key attacker-ca.key -out attacker-ca.crt -subj "/CN=Attacker Root CA"', phase: "generating" as Phase },
  { cmd: "[✓] تم إنشاء شهادة الجذر المزيفة", phase: "fakeChain" as Phase },
  { cmd: '$ openssl req -new -key fake-server.key -out fake-server.csr -subj "/CN=bank.example.com"', phase: "fakeChain" as Phase },
  { cmd: "[*] إنشاء شهادة خادم مزيفة لـ bank.example.com ...", phase: "fakeChain" as Phase },
  { cmd: "$ openssl x509 -req -in fake-server.csr -CA attacker-ca.crt -CAkey attacker-ca.key -out fake-server.crt", phase: "fakeChain" as Phase },
  { cmd: "[✓] تم توقيع الشهادة المزيفة بالجذر المزيف", phase: "fakeChain" as Phase },
  { cmd: "$ mitmproxy --certs *=fake-server.crt --mode transparent", phase: "intercept" as Phase },
  { cmd: "[*] اعتراض مصافحة TLS مع bank.example.com ...", phase: "intercept" as Phase },
  { cmd: "[>] تقديم الشهادة المزيفة للضحية ...", phase: "intercept" as Phase },
  { cmd: "[!] المتصفح أظهر تحذير: NET::ERR_CERT_AUTHORITY_INVALID", phase: "warning" as Phase },
  { cmd: "[!] الضحية تجاوز التحذير! الاتصال محاصر.", phase: "complete" as Phase },
  { cmd: "[!] البيانات الملتقطة: POST /login  username=admin&password=secret123", phase: "complete" as Phase },
  { cmd: "[✓] تم فك تشفير 18 طلب HTTPS بنجاح", phase: "complete" as Phase },
];

const realCert = {
  subject: "CN=bank.example.com, O=Example Bank Inc.",
  issuer: "CN=DigiCert Global Root G2, O=DigiCert Inc.",
  validFrom: "2024-01-15",
  validTo: "2025-01-15",
  publicKey: "RSA 2048-bit",
  sha256: "A1:B2:C3:D4:E5:F6:78:9A:BC:DE:F0:12:34:56:78:9A",
  serial: "0A:1B:2C:3D:4E:5F:60:71",
};

const fakeCert = {
  subject: "CN=bank.example.com, O=Example Bank Inc.",
  issuer: "CN=Attacker Root CA, O=Evil Corp",
  validFrom: "2024-06-01",
  validTo: "2034-06-01",
  publicKey: "RSA 2048-bit",
  sha256: "FF:EE:DD:CC:BB:AA:99:88:77:66:55:44:33:22:11:00",
  serial: "01:00:00:00:00:00:00:01",
};

/* ───── component ───── */
export default function HttpsSpoofingPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [speed, setSpeed] = useState<Speed>("normal");
  const [visibleLines, setVisibleLines] = useState(0);
  const [progress, setProgress] = useState(0);
  const [certPinning, setCertPinning] = useState(false);
  const [hstsEnabled, setHstsEnabled] = useState(false);
  const [viewCert, setViewCert] = useState<"real" | "fake">("real");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [userProceeded, setUserProceeded] = useState(false);
  const [pinningBlocked, setPinningBlocked] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const mult = SPEED_MAP[speed];
  const phases: Phase[] = ["idle", "generating", "fakeChain", "intercept", "warning", "complete"];
  const phaseIndex = phases.indexOf(phase);
  const isActive = phase !== "idle";

  const cleanup = useCallback(() => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const startSimulation = () => {
    cleanup();
    setPinningBlocked(false);
    setAdvancedOpen(false);
    setUserProceeded(false);
    setVisibleLines(0);
    setProgress(0);

    if (certPinning) {
      setPhase("generating");
      const t1 = setTimeout(() => setPhase("fakeChain"), 2500 * mult);
      const t2 = setTimeout(() => setPhase("intercept"), 5000 * mult);
      const t3 = setTimeout(() => {
        setPinningBlocked(true);
        setPhase("idle");
      }, 7000 * mult);
      timerRef.current.push(t1, t2, t3);

      for (let i = 0; i <= 7; i++) {
        const t = setTimeout(() => setVisibleLines(Math.min(i + 1, 11)), (i * 1000) * mult);
        timerRef.current.push(t);
      }
      return;
    }

    setPhase("generating");

    const schedule: { p: Phase; delay: number }[] = [
      { p: "generating", delay: 0 },
      { p: "fakeChain", delay: 3000 * mult },
      { p: "intercept", delay: 6000 * mult },
      { p: "warning", delay: 9000 * mult },
      { p: "complete", delay: 13000 * mult },
    ];

    schedule.forEach(({ p, delay }) => {
      const t = setTimeout(() => setPhase(p), delay);
      timerRef.current.push(t);
    });

    const totalDuration = 15000 * mult;
    const steps = totalDuration / 100;
    for (let i = 0; i <= steps; i++) {
      const t = setTimeout(() => setProgress(Math.min((i / steps) * 100, 100)), i * 100);
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
    setPinningBlocked(false);
    setAdvancedOpen(false);
    setUserProceeded(false);
  };

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [visibleLines]);

  const phaseLabel: Record<Phase, string> = {
    idle: "في الانتظار",
    generating: "توليد الشهادة المزيفة",
    fakeChain: "بناء سلسلة الثقة المزيفة",
    intercept: "اعتراض مصافحة TLS",
    warning: "تحذير المتصفح",
    complete: "تم اعتراض البيانات",
  };

  /* ─── Certificate chain card ─── */
  const CertCard = ({ label, cn, color, trusted, glow }: {
    label: string; cn: string; color: string; trusted: boolean; glow?: boolean;
  }) => (
    <motion.div
      initial={{ opacity: 0, x: trusted ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`border rounded-lg p-2.5 text-xs ${
        trusted
          ? "bg-green-950/40 border-green-500/40"
          : "bg-red-950/40 border-red-500/40"
      } ${glow ? "shadow-[0_0_15px_rgba(239,68,68,0.3)]" : ""}`}
    >
      <div className="flex items-center gap-1.5 mb-1">
        {trusted ? (
          <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
        ) : (
          <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
        )}
        <span className={`font-bold ${trusted ? "text-green-300" : "text-red-300"}`}>{label}</span>
      </div>
      <p className={`${trusted ? "text-green-400/70" : "text-red-400/70"} text-[10px]`}>{cn}</p>
    </motion.div>
  );

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
        {/* ===== HEADER ===== */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <FileKey className="w-9 h-9 text-red-400" />
            <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-red-400 via-orange-400 to-cyan-400 bg-clip-text text-transparent">
              انتحال شهادة HTTPS
            </h1>
            <ShieldAlert className="w-9 h-9 text-orange-400" />
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
            هجوم انتحال شهادة HTTPS يقوم بإنشاء شهادة رقمية مزيفة لموقع ما، مما يسمح
            للمهاجم باعتراض الاتصال المشفر وقراءة البيانات الحساسة كأنها نص عادي
          </p>
        </motion.div>

        {/* ===== PINNING BLOCKED BANNER ===== */}
        <AnimatePresence>
          {pinningBlocked && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-6 bg-green-500/10 border border-green-500/40 rounded-xl p-4 flex items-center gap-3"
            >
              <ShieldCheck className="w-7 h-7 text-green-400 shrink-0" />
              <div>
                <p className="text-green-300 font-bold">تم حظر الهجوم بواسطة Certificate Pinning!</p>
                <p className="text-green-400/70 text-sm">
                  تثبيت الشهادة اكتشف أن البصمة الرقمية لا تتطابق. تم رفض الاتصال المزيف.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== CERTIFICATE CHAIN VISUAL ===== */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-950/80 border border-gray-700/50 rounded-2xl p-4 mb-6 overflow-hidden"
        >
          <h2 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            سلسلة الشهادات وعملية الانتحال
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Legitimate chain */}
            <div>
              <h3 className="text-sm font-bold text-green-400 mb-3 flex items-center gap-1.5">
                <Lock className="w-4 h-4" /> سلسلة الشهادات الأصلية
              </h3>
              <div className="space-y-1.5">
                <CertCard label="Root CA" cn="DigiCert Global Root G2" color="green" trusted />
                <div className="flex justify-center"><ArrowDown className="w-4 h-4 text-green-500/50" /></div>
                <CertCard label="Intermediate CA" cn="DigiCert SHA2 Extended Validation" color="green" trusted />
                <div className="flex justify-center"><ArrowDown className="w-4 h-4 text-green-500/50" /></div>
                <CertCard label="Server Certificate" cn="bank.example.com" color="green" trusted />
              </div>
            </div>

            {/* Fake chain - appears during attack */}
            <div>
              <h3 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-1.5">
                <LockOpen className="w-4 h-4" /> سلسلة الشهادات المزيفة
              </h3>
              <AnimatePresence>
                {phaseIndex >= 2 ? (
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-1.5"
                  >
                    <CertCard label="Fake Root CA ☠" cn="Attacker Root CA" color="red" trusted={false} glow />
                    <div className="flex justify-center"><ArrowDown className="w-4 h-4 text-red-500/50" /></div>
                    <CertCard label="Fake Server Cert ☠" cn="bank.example.com (مزيف)" color="red" trusted={false} glow />
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-2 bg-red-500/10 border border-red-500/30 rounded-lg p-2 text-xs text-red-300"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 inline ml-1" />
                      الجذر المزيف غير موجود في مخزن الشهادات الموثوقة
                    </motion.div>
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-center h-32 text-gray-600 text-sm border border-dashed border-gray-700 rounded-lg">
                    ابدأ المحاكاة لرؤية سلسلة الشهادات المزيفة
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* ===== TLS HANDSHAKE DIAGRAM ===== */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-gray-950/80 border border-gray-700/50 rounded-2xl p-4 mb-6"
        >
          <h2 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            مخطط مصافحة TLS
          </h2>
          <svg viewBox="0 0 800 320" className="w-full h-auto">
            <defs>
              <filter id="glow-hs-cyan">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="glow-hs-red">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Client column */}
            <rect x="30" y="10" width="120" height="36" rx="8" fill="#111827" stroke="#22d3ee" strokeWidth="1.5" />
            <text x="90" y="33" fill="#22d3ee" fontSize="12" fontWeight="bold" textAnchor="middle">Client</text>
            <line x1="90" y1="46" x2="90" y2="310" stroke="#22d3ee" strokeWidth="1" opacity="0.3" />

            {/* Attacker column (middle) */}
            <rect x="310" y="10" width="140" height="36" rx="8" fill="#1a0a0a" stroke="#ef4444" strokeWidth="1.5" />
            <text x="380" y="33" fill="#ef4444" fontSize="12" fontWeight="bold" textAnchor="middle">☠ Attacker</text>
            {isActive && <line x1="380" y1="46" x2="380" y2="310" stroke="#ef4444" strokeWidth="1" opacity="0.3" />}

            {/* Server column */}
            <rect x="610" y="10" width="130" height="36" rx="8" fill="#111827" stroke="#22c55e" strokeWidth="1.5" />
            <text x="675" y="33" fill="#22c55e" fontSize="12" fontWeight="bold" textAnchor="middle">Server</text>
            <line x1="675" y1="46" x2="675" y2="310" stroke="#22c55e" strokeWidth="1" opacity="0.3" />

            {/* Step 1: ClientHello */}
            <motion.g initial={{ opacity: 0.3 }} animate={{ opacity: phaseIndex >= 1 ? 1 : 0.3 }}>
              <line x1="90" y1="75" x2={isActive ? 380 : 675} y2="75" stroke="#22d3ee" strokeWidth="1.5" markerEnd="url(#arrowCyan)" />
              <text x={isActive ? 235 : 380} y="68" fill="#94a3b8" fontSize="9" textAnchor="middle">ClientHello</text>
            </motion.g>

            {/* Step 2: ServerHello */}
            <motion.g initial={{ opacity: 0.3 }} animate={{ opacity: phaseIndex >= 2 ? 1 : 0.3 }}>
              <line x1={isActive ? 380 : 675} y1="115" x2="90" y2="115" stroke={isActive ? "#ef4444" : "#22c55e"} strokeWidth="1.5" />
              <text x={isActive ? 235 : 380} y="108" fill="#94a3b8" fontSize="9" textAnchor="middle">ServerHello</text>
            </motion.g>

            {/* Step 3: Certificate */}
            <motion.g initial={{ opacity: 0.3 }} animate={{ opacity: phaseIndex >= 3 ? 1 : 0.3 }}>
              <line x1={isActive ? 380 : 675} y1="155" x2="90" y2="155" stroke={isActive ? "#ef4444" : "#22c55e"} strokeWidth="1.5" />
              <text x={isActive ? 235 : 380} y="148" fill={isActive && phaseIndex >= 3 ? "#fbbf24" : "#94a3b8"} fontSize="9" fontWeight={isActive && phaseIndex >= 3 ? "bold" : "normal"} textAnchor="middle">
                {isActive && phaseIndex >= 3 ? "⚠ Fake Certificate!" : "Certificate"}
              </text>
            </motion.g>

            {/* Step 4: Key Exchange */}
            <motion.g initial={{ opacity: 0.3 }} animate={{ opacity: phaseIndex >= 4 ? 1 : 0.3 }}>
              <line x1="90" y1="195" x2={isActive ? 380 : 675} y2="195" stroke="#22d3ee" strokeWidth="1.5" />
              <text x={isActive ? 235 : 380} y="188" fill="#94a3b8" fontSize="9" textAnchor="middle">ClientKeyExchange</text>
            </motion.g>

            {/* Step 5: Finished */}
            <motion.g initial={{ opacity: 0.3 }} animate={{ opacity: phaseIndex >= 5 ? 1 : 0.3 }}>
              <line x1="90" y1="235" x2={isActive ? 380 : 675} y2="235" stroke={phaseIndex >= 5 ? "#ef4444" : "#22d3ee"} strokeWidth="1.5" />
              <text x={isActive ? 235 : 380} y="228" fill="#94a3b8" fontSize="9" textAnchor="middle">Finished (Encrypted Data)</text>
            </motion.g>

            {/* Attacker → Server lines (during attack) */}
            {isActive && phaseIndex >= 2 && (
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
                <line x1="380" y1="75" x2="675" y2="85" stroke="#6b7280" strokeWidth="1" strokeDasharray="4 3" />
                <line x1="675" y1="120" x2="380" y2="110" stroke="#6b7280" strokeWidth="1" strokeDasharray="4 3" />
                <line x1="675" y1="160" x2="380" y2="150" stroke="#6b7280" strokeWidth="1" strokeDasharray="4 3" />
                <text x="528" y="100" fill="#6b7280" fontSize="8" textAnchor="middle">Real Connection</text>
              </motion.g>
            )}

            {/* Injection marker */}
            {isActive && phaseIndex >= 3 && (
              <motion.g
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <rect x="140" y="140" width="100" height="22" rx="4" fill="#ef4444" opacity="0.15" stroke="#ef4444" strokeWidth="1" />
                <text x="190" y="155" fill="#ef4444" fontSize="8" fontWeight="bold" textAnchor="middle">Cert Injection Here</text>
              </motion.g>
            )}

            {/* Arrow markers */}
            <defs>
              <marker id="arrowCyan" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#22d3ee" />
              </marker>
            </defs>
          </svg>
        </motion.div>

        {/* ===== BROWSER WARNING MOCKUP ===== */}
        <AnimatePresence>
          {phaseIndex >= 4 && !certPinning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -1 }}
              animate={{
                opacity: 1,
                scale: 1,
                rotate: 0,
                x: [0, -4, 4, -3, 3, 0],
              }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ x: { duration: 0.5, delay: 0.2 } }}
              className="bg-gray-900 border border-red-500/50 rounded-2xl p-5 mb-6 shadow-[0_0_30px_rgba(239,68,68,0.15)]"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-500/20 rounded-full p-2">
                  <ShieldAlert className="w-8 h-8 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-300">اتصالك ليس خاصاً</h3>
                  <p className="text-gray-400 text-sm">
                    يمكن للمهاجمين محاولة سرقة معلوماتك من bank.example.com
                  </p>
                </div>
              </div>

              <div className="bg-gray-950 border border-gray-700 rounded-xl p-4 mb-4 font-mono text-xs">
                <p className="text-red-400 font-bold mb-2">NET::ERR_CERT_AUTHORITY_INVALID</p>
                <p className="text-gray-400">
                  لا يمكن لهذا الموقع توفير اتصال آمن. أرسل bank.example.com استجابة غير صالحة.
                </p>
                <p className="text-gray-500 mt-1">
                  Subject: CN=bank.example.com
                </p>
                <p className="text-gray-500">
                  Issuer: CN=Attacker Root CA
                </p>
                <p className="text-gray-500">
                  Expires: 2034-06-01
                </p>
              </div>

              {/* Advanced section */}
              <button
                onClick={() => setAdvancedOpen(!advancedOpen)}
                className="text-sm text-gray-400 hover:text-gray-300 flex items-center gap-1 mb-3 transition-colors"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
                خيارات متقدمة
              </button>

              <AnimatePresence>
                {advancedOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-gray-950/60 border border-gray-700/50 rounded-lg p-3 mb-3 text-xs text-gray-400">
                      <p className="mb-2">
                        يستخدم هذا الخادم شهادة أمان صادرة من جهة غير معروفة لنظام التشغيل.
                        قد يعني هذا أن شخصاً ما يحاول اعتراض اتصالاتك.
                      </p>
                      <p className="text-red-400/70">
                        SHA-256 Fingerprint: FF:EE:DD:CC:BB:AA:99:88:77:66:55:44:33:22:11:00
                      </p>
                    </div>
                    <button
                      onClick={() => setUserProceeded(true)}
                      className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg text-sm hover:bg-red-500/20 transition-colors"
                    >
                      المتابعة إلى bank.example.com (غير آمن)
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* User proceeded feedback */}
              <AnimatePresence>
                {userProceeded && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2"
                  >
                    <Skull className="w-5 h-5 text-red-400 shrink-0" />
                    <p className="text-red-300 text-sm font-bold">
                      تم اختراق الاتصال! المهاجم يقرأ جميع البيانات المرسلة.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {!userProceeded && phase === "complete" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center gap-2"
                >
                  <ShieldCheck className="w-5 h-5 text-green-400 shrink-0" />
                  <p className="text-green-300 text-sm font-bold">
                    لم يتجاوز المستخدم التحذير — البيانات آمنة.
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* ===== CONTROL PANEL ===== */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-950/80 border border-gray-700/50 rounded-2xl p-4"
          >
            <h2 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <Gauge className="w-5 h-5" />
              لوحة التحكم
            </h2>

            {/* Start / Reset */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={startSimulation}
                disabled={isActive}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-linear-to-r from-red-600 to-orange-600 text-white font-bold text-sm disabled:opacity-40 hover:brightness-110 transition"
              >
                <Play className="w-4 h-4" /> بدء الهجوم
              </button>
              <button
                onClick={reset}
                className="flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl border border-gray-600 text-gray-300 text-sm hover:bg-gray-800 transition"
              >
                <RotateCcw className="w-4 h-4" /> إعادة
              </button>
            </div>

            {/* Speed */}
            <div className="mb-4">
              <label className="text-xs text-gray-400 mb-1.5 block">سرعة المحاكاة</label>
              <div className="flex gap-1.5">
                {(["slow", "normal", "fast"] as Speed[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                      speed === s ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "bg-gray-800 text-gray-500 border border-gray-700"
                    }`}
                  >
                    {s === "slow" ? "بطيء" : s === "normal" ? "عادي" : "سريع"}
                  </button>
                ))}
              </div>
            </div>

            {/* Phase indicator */}
            <div className="mb-4">
              <label className="text-xs text-gray-400 mb-1.5 block">المرحلة الحالية</label>
              <div className="space-y-1">
                {phases.slice(1).map((p, i) => (
                  <div
                    key={p}
                    className={`flex items-center gap-2 text-xs py-1 px-2 rounded-lg transition ${
                      phaseIndex > i + 1 ? "text-green-400 bg-green-500/5" : phaseIndex === i + 1 ? "text-yellow-300 bg-yellow-500/10 font-bold" : "text-gray-600"
                    }`}
                  >
                    {phaseIndex > i + 1 ? <CheckCircle className="w-3 h-3" /> : phaseIndex === i + 1 ? <AlertTriangle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-gray-700" />}
                    {phaseLabel[p]}
                  </div>
                ))}
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-linear-to-r from-red-500 to-orange-500 rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "linear", duration: 0.1 }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-left" dir="ltr">{Math.round(progress)}%</p>
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300 flex items-center gap-1.5">
                  <Fingerprint className="w-4 h-4 text-purple-400" />
                  Certificate Pinning
                </span>
                <button
                  onClick={() => setCertPinning(!certPinning)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${certPinning ? "bg-purple-500" : "bg-gray-700"}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${certPinning ? "right-0.5" : "right-5.5"}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-blue-400" />
                  HSTS مفعّل
                </span>
                <button
                  onClick={() => setHstsEnabled(!hstsEnabled)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${hstsEnabled ? "bg-blue-500" : "bg-gray-700"}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${hstsEnabled ? "right-0.5" : "right-5.5"}`} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* ===== TERMINAL ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="lg:col-span-2 bg-gray-950/80 border border-gray-700/50 rounded-2xl p-4"
          >
            <h2 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              طرفية الهجوم
            </h2>
            <div
              ref={terminalRef}
              className="bg-black/80 rounded-xl p-3 h-64 overflow-y-auto font-mono text-xs border border-gray-800 scrollbar-thin scrollbar-thumb-gray-700"
              dir="ltr"
            >
              {terminalLines.slice(0, visibleLines).map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`mb-0.5 ${
                    line.cmd.startsWith("[✓]")
                      ? "text-green-400"
                      : line.cmd.startsWith("[!]")
                      ? "text-red-400"
                      : line.cmd.startsWith("[>]")
                      ? "text-yellow-400"
                      : line.cmd.startsWith("[*]")
                      ? "text-cyan-400"
                      : "text-gray-300"
                  }`}
                >
                  {line.cmd}
                </motion.div>
              ))}
              {isActive && visibleLines < terminalLines.length && (
                <span className="text-green-400 animate-pulse">█</span>
              )}
            </div>
          </motion.div>
        </div>

        {/* ===== CERTIFICATE INSPECTOR ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-950/80 border border-gray-700/50 rounded-2xl p-5 mb-6"
        >
          <h2 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
            <FileKey className="w-5 h-5" />
            فاحص الشهادات
          </h2>

          {/* Toggle real / fake */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setViewCert("real")}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${
                viewCert === "real" ? "bg-green-500/20 text-green-300 border border-green-500/40" : "bg-gray-800 text-gray-500 border border-gray-700"
              }`}
            >
              <Lock className="w-4 h-4 inline ml-1" />
              الشهادة الأصلية
            </button>
            <button
              onClick={() => setViewCert("fake")}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${
                viewCert === "fake" ? "bg-red-500/20 text-red-300 border border-red-500/40" : "bg-gray-800 text-gray-500 border border-gray-700"
              }`}
            >
              <LockOpen className="w-4 h-4 inline ml-1" />
              الشهادة المزيفة
            </button>
          </div>

          {/* Certificate details */}
          {(() => {
            const cert = viewCert === "real" ? realCert : fakeCert;
            const isReal = viewCert === "real";
            const accent = isReal ? "green" : "red";
            const rows = [
              { label: "Subject", value: cert.subject, diff: false },
              { label: "Issuer", value: cert.issuer, diff: !isReal },
              { label: "Valid From", value: cert.validFrom, diff: !isReal },
              { label: "Valid To", value: cert.validTo, diff: !isReal },
              { label: "Public Key", value: cert.publicKey, diff: false },
              { label: "SHA-256", value: cert.sha256, diff: !isReal },
              { label: "Serial", value: cert.serial, diff: !isReal },
            ];
            return (
              <div className={`bg-black/60 border rounded-xl p-4 font-mono text-xs ${isReal ? "border-green-500/30" : "border-red-500/30"}`} dir="ltr">
                {rows.map((r) => (
                  <div key={r.label} className={`flex py-1.5 border-b border-gray-800/50 last:border-b-0 ${r.diff ? "bg-red-500/5" : ""}`}>
                    <span className="w-28 text-gray-500 shrink-0">{r.label}:</span>
                    <span className={r.diff ? "text-red-400 font-bold" : `text-${accent}-300`}>
                      {r.value}
                      {r.diff && " ⚠"}
                    </span>
                  </div>
                ))}
              </div>
            );
          })()}
        </motion.div>

        {/* ===== ANALYSIS CARDS ===== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5" />
            تحليل الهجوم
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1 — How it works */}
            <div className="bg-gray-900/80 border border-gray-700/40 rounded-xl p-4">
              <h3 className="font-bold text-red-400 mb-2 flex items-center gap-2 text-sm">
                <Skull className="w-4 h-4" />
                كيف يعمل انتحال شهادة HTTPS
              </h3>
              <ul className="text-gray-400 text-xs space-y-1.5 list-disc list-inside">
                <li>ينشئ المهاجم جهة مُصدّقة مزيفة (Fake CA) ويولّد شهادة موقّعة ذاتياً</li>
                <li>يعترض مصافحة TLS بين الضحية والخادم الحقيقي</li>
                <li>يقدم الشهادة المزيفة للضحية بدلاً من الأصلية</li>
                <li>إذا تجاوز المستخدم تحذير المتصفح، يقرأ المهاجم كل البيانات</li>
                <li>المهاجم يحتفظ باتصال HTTPS حقيقي مع الخادم الأصلي</li>
              </ul>
            </div>

            {/* Card 2 — Tools */}
            <div className="bg-gray-900/80 border border-gray-700/40 rounded-xl p-4">
              <h3 className="font-bold text-orange-400 mb-2 flex items-center gap-2 text-sm">
                <Wrench className="w-4 h-4" />
                الأدوات المستخدمة
              </h3>
              <ul className="text-gray-400 text-xs space-y-1.5 list-disc list-inside">
                <li><span className="text-orange-300 font-bold">mitmproxy</span> — وكيل اعتراض مفتوح المصدر يدعم فك تشفير TLS</li>
                <li><span className="text-orange-300 font-bold">Burp Suite</span> — أداة اختبار اختراق تطبيقات الويب مع وكيل HTTPS</li>
                <li><span className="text-orange-300 font-bold">Charles Proxy</span> — أداة تصحيح HTTP/HTTPS مع دعم SSL Proxying</li>
                <li><span className="text-orange-300 font-bold">OpenSSL</span> — مكتبة لتوليد الشهادات والمفاتيح الرقمية</li>
              </ul>
            </div>

            {/* Card 3 — Detection */}
            <div className="bg-gray-900/80 border border-gray-700/40 rounded-xl p-4">
              <h3 className="font-bold text-yellow-400 mb-2 flex items-center gap-2 text-sm">
                <Bug className="w-4 h-4" />
                طرق الكشف
              </h3>
              <ul className="text-gray-400 text-xs space-y-1.5 list-disc list-inside">
                <li>تحذيرات المتصفح حول الشهادات غير الموثوقة</li>
                <li>التحقق من البصمة الرقمية (SHA-256 Fingerprint) للشهادة</li>
                <li>مراقبة سجلات شفافية الشهادات (Certificate Transparency Logs)</li>
                <li>فحص سلسلة الثقة والتأكد من الجهة المُصدّقة</li>
                <li>أدوات مراقبة الشبكة للكشف عن تغيير الشهادات أثناء الاتصال</li>
              </ul>
            </div>

            {/* Card 4 — Protection */}
            <div className="bg-gray-900/80 border border-gray-700/40 rounded-xl p-4">
              <h3 className="font-bold text-green-400 mb-2 flex items-center gap-2 text-sm">
                <ShieldCheck className="w-4 h-4" />
                طرق الحماية
              </h3>
              <ul className="text-gray-400 text-xs space-y-1.5 list-disc list-inside">
                <li><span className="text-green-300 font-bold">Certificate Pinning</span> — تثبيت بصمة الشهادة في التطبيق لمنع الانتحال</li>
                <li><span className="text-green-300 font-bold">HSTS</span> — إجبار المتصفح على استخدام HTTPS فقط</li>
                <li><span className="text-green-300 font-bold">Certificate Transparency</span> — سجل عام لجميع الشهادات الصادرة</li>
                <li><span className="text-green-300 font-bold">DANE/TLSA</span> — ربط الشهادة بسجلات DNS الموثّقة</li>
                <li>عدم تجاوز تحذيرات المتصفح مطلقاً والتحقق من عنوان الموقع</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </PageShell>
  );
}
