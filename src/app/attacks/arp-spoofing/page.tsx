"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Network,
  Play,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Wifi,
  Monitor,
  Router,
  Skull,
  Eye,
  Search,
  Gauge,
  Info,
  Wrench,
  Bug,
  Lock,
} from "lucide-react";
import PageShell from "@/components/PageShell";

type Phase = "idle" | "scanning" | "poisoning" | "poisoned" | "intercepting" | "complete";
type Speed = "slow" | "normal" | "fast";

const SPEED_MAP: Record<Speed, number> = { slow: 2, normal: 1, fast: 0.5 };

const VICTIM = { ip: "192.168.1.105", mac: "AA:BB:CC:11:22:33", label: "جهاز الضحية" };
const ATTACKER = { ip: "192.168.1.77", mac: "66:77:88:99:AA:BB", label: "المهاجم" };
const GATEWAY = { ip: "192.168.1.1", mac: "DD:EE:FF:00:11:22", label: "الراوتر" };

const terminalLines = [
  { cmd: "$ arp-scan --localnet", phase: "scanning" as Phase },
  { cmd: "192.168.1.1\tDD:EE:FF:00:11:22\tRouter", phase: "scanning" as Phase },
  { cmd: "192.168.1.105\tAA:BB:CC:11:22:33\tVictim-PC", phase: "scanning" as Phase },
  { cmd: "$ echo 1 > /proc/sys/net/ipv4/ip_forward", phase: "poisoning" as Phase },
  { cmd: "$ arpspoof -i eth0 -t 192.168.1.105 192.168.1.1", phase: "poisoning" as Phase },
  { cmd: "[*] إرسال رد ARP مزيف إلى الضحية...", phase: "poisoning" as Phase },
  { cmd: "$ arpspoof -i eth0 -t 192.168.1.1 192.168.1.105", phase: "poisoning" as Phase },
  { cmd: "[*] إرسال رد ARP مزيف إلى الراوتر...", phase: "poisoning" as Phase },
  { cmd: "[✓] تم تسميم جداول ARP بنجاح!", phase: "poisoned" as Phase },
  { cmd: "[*] اعتراض حركة المرور بين الضحية والراوتر...", phase: "intercepting" as Phase },
  { cmd: "[>] GET /login HTTP/1.1 → اعتراض بيانات الدخول", phase: "intercepting" as Phase },
  { cmd: "[>] POST /api/transfer → اعتراض طلب تحويل", phase: "intercepting" as Phase },
  { cmd: "[!] تم اعتراض 47 حزمة بيانات", phase: "complete" as Phase },
];

export default function ArpSpoofingPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [speed, setSpeed] = useState<Speed>("normal");
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [progress, setProgress] = useState(0);
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
    setPhase("scanning");
    setVisibleLines(0);
    setProgress(0);

    const phases: { p: Phase; delay: number }[] = [
      { p: "scanning", delay: 0 },
      { p: "poisoning", delay: 3000 * mult },
      { p: "poisoned", delay: 7000 * mult },
      { p: "intercepting", delay: 10000 * mult },
      { p: "complete", delay: 14000 * mult },
    ];

    phases.forEach(({ p, delay }) => {
      const t = setTimeout(() => setPhase(p), delay);
      timerRef.current.push(t);
    });

    const totalDuration = 15000 * mult;
    const progressInterval = 100;
    const steps = totalDuration / progressInterval;
    for (let i = 0; i <= steps; i++) {
      const t = setTimeout(() => {
        setProgress(Math.min((i / steps) * 100, 100));
      }, i * progressInterval);
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
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [visibleLines]);

  const phaseLabel: Record<Phase, string> = {
    idle: "في الانتظار",
    scanning: "فحص الشبكة",
    poisoning: "تسميم ARP",
    poisoned: "تم التسميم",
    intercepting: "اعتراض البيانات",
    complete: "اكتمل الهجوم",
  };

  const phaseIndex = ["idle", "scanning", "poisoning", "poisoned", "intercepting", "complete"].indexOf(phase);

  const victimGatewayMac = phase === "poisoned" || phase === "intercepting" || phase === "complete" ? ATTACKER.mac : GATEWAY.mac;
  const gatewayVictimMac = phase === "poisoned" || phase === "intercepting" || phase === "complete" ? ATTACKER.mac : VICTIM.mac;
  const isPoisoned = phase === "poisoned" || phase === "intercepting" || phase === "complete";

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
            <Network className="w-9 h-9 text-cyan-400" />
            <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-cyan-400 via-purple-400 to-red-400 bg-clip-text text-transparent">
              انتحال بروتوكول ARP
            </h1>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
            هجوم انتحال ARP يسمح للمهاجم باعتراض حركة المرور بين جهازين في الشبكة المحلية
            عن طريق إرسال ردود ARP مزيفة لتغيير جداول ARP في أجهزة الضحايا
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
          <svg viewBox="0 0 900 520" className="w-full h-auto">
            <defs>
              <filter id="glow-cyan">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="glow-red">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <linearGradient id="grad-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="grad-red" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
              <linearGradient id="grad-green" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#16a34a" />
              </linearGradient>
            </defs>

            {/* Original path (dashed) when poisoned */}
            {isPoisoned && (
              <motion.line
                x1="150" y1="200" x2="750" y2="200"
                stroke="#374151" strokeWidth="2" strokeDasharray="8 6"
                initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              />
            )}

            {/* Poisoned path lines: Victim → Attacker → Gateway */}
            {(phase === "intercepting" || phase === "complete") && (
              <>
                <motion.line
                  x1="150" y1="200" x2="450" y2="400"
                  stroke="#ef4444" strokeWidth="2" strokeDasharray="6 4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.7 }}
                  transition={{ duration: 1 * mult }}
                />
                <motion.line
                  x1="450" y1="400" x2="750" y2="200"
                  stroke="#ef4444" strokeWidth="2" strokeDasharray="6 4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.7 }}
                  transition={{ duration: 1 * mult, delay: 0.5 * mult }}
                />
              </>
            )}

            {/* === VICTIM DEVICE === */}
            <g>
              <motion.rect
                x="50" y="140" width="200" height="120" rx="12"
                fill="#111827" stroke="#22d3ee" strokeWidth="2"
                filter="url(#glow-cyan)"
                animate={{ strokeOpacity: phase === "idle" ? 0.5 : 1 }}
              />
              {/* Computer icon centered */}
              <rect x="138" y="155" width="24" height="18" rx="3" fill="#22d3ee" opacity="0.8" />
              <rect x="144" y="175" width="12" height="6" rx="1" fill="#22d3ee" opacity="0.5" />
              <text x="150" y="198" fill="#22d3ee" fontSize="11" fontWeight="bold" textAnchor="middle">Victim PC</text>
              <text x="150" y="214" fill="#9ca3af" fontSize="10" textAnchor="middle">{VICTIM.ip}</text>
              <text x="150" y="228" fill="#6b7280" fontSize="8" textAnchor="middle">{VICTIM.mac}</text>
              {/* Victim ARP Table */}
              <rect x="40" y="238" width="220" height="25" rx="4" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
              <text x="150" y="255" fill="#94a3b8" fontSize="8" textAnchor="middle">
                ARP: {GATEWAY.ip} → {victimGatewayMac}
              </text>
              {isPoisoned && (
                <motion.rect
                  x="40" y="238" width="220" height="25" rx="4"
                  fill="transparent" stroke="#ef4444" strokeWidth="1.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0, 1, 0.8] }}
                  transition={{ duration: 1 }}
                />
              )}
            </g>

            {/* === GATEWAY DEVICE === */}
            <g>
              <motion.rect
                x="650" y="140" width="200" height="120" rx="12"
                fill="#111827" stroke="#22c55e" strokeWidth="2"
                filter="url(#glow-cyan)"
                animate={{ strokeOpacity: phase === "idle" ? 0.5 : 1 }}
              />
              {/* Router icon centered */}
              <circle cx="750" cy="165" r="12" fill="none" stroke="#22c55e" strokeWidth="2" opacity="0.8" />
              <line x1="744" y1="165" x2="756" y2="165" stroke="#22c55e" strokeWidth="1.5" opacity="0.8" />
              <line x1="750" y1="159" x2="750" y2="171" stroke="#22c55e" strokeWidth="1.5" opacity="0.8" />
              <text x="750" y="198" fill="#22c55e" fontSize="11" fontWeight="bold" textAnchor="middle">Gateway</text>
              <text x="750" y="214" fill="#9ca3af" fontSize="10" textAnchor="middle">{GATEWAY.ip}</text>
              <text x="750" y="228" fill="#6b7280" fontSize="8" textAnchor="middle">{GATEWAY.mac}</text>
              {/* Gateway ARP Table */}
              <rect x="640" y="238" width="220" height="25" rx="4" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
              <text x="750" y="255" fill="#94a3b8" fontSize="8" textAnchor="middle">
                ARP: {VICTIM.ip} → {gatewayVictimMac}
              </text>
              {isPoisoned && (
                <motion.rect
                  x="640" y="238" width="220" height="25" rx="4"
                  fill="transparent" stroke="#ef4444" strokeWidth="1.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0, 1, 0.8] }}
                  transition={{ duration: 1 }}
                />
              )}
            </g>

            {/* === ATTACKER DEVICE === */}
            <g>
              <motion.rect
                x="350" y="340" width="200" height="120" rx="12"
                fill="#1a0a0a" stroke="#ef4444" strokeWidth="2"
                filter="url(#glow-red)"
                animate={{
                  stroke: phase === "idle" ? "#ef4444" : ["#ef4444", "#ff6b6b", "#ef4444"],
                  strokeWidth: phase !== "idle" ? [2, 3, 2] : 2,
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <text x="450" y="370" fill="#ef4444" fontSize="12" fontWeight="bold" textAnchor="middle">
                Attacker ☠
              </text>
              <text x="450" y="392" fill="#9ca3af" fontSize="10" textAnchor="middle">{ATTACKER.ip}</text>
              <text x="450" y="408" fill="#6b7280" fontSize="8" textAnchor="middle">{ATTACKER.mac}</text>
              <text x="450" y="428" fill="#fbbf24" fontSize="9" textAnchor="middle" opacity="0.8">
                {phase === "idle" ? "Ready" : phase === "scanning" ? "Scanning..." : phase === "poisoning" ? "Poisoning..." : phase === "intercepting" ? "Intercepting..." : "Complete"}
              </text>
            </g>

            {/* Scan pulses from attacker */}
            {phase === "scanning" && (
              <>
                {[0, 0.5, 1].map((delay, i) => (
                  <motion.circle
                    key={`scan-${i}`}
                    cx="450" cy="400"
                    fill="none" stroke="#ef4444" strokeWidth="1.5"
                    initial={{ r: 10, opacity: 0.8 }}
                    animate={{ r: 200, opacity: 0 }}
                    transition={{ duration: 2 * mult, delay: delay * mult, repeat: Infinity }}
                  />
                ))}
              </>
            )}

            {/* Fake ARP packets flying: Attacker → Victim */}
            {phase === "poisoning" && (
              <>
                {[0, 0.8, 1.6].map((delay, i) => (
                  <motion.g key={`pkt-v-${i}`}>
                    <motion.rect
                      width="70" height="22" rx="4" fill="#dc2626"
                      initial={{ x: 415, y: 350, opacity: 0 }}
                      animate={{ x: 115, y: 180, opacity: [0, 1, 1, 0] }}
                      transition={{ duration: 1.5 * mult, delay: delay * mult, repeat: Infinity, repeatDelay: 1 * mult }}
                    />
                    <motion.text
                      fontSize="8" fill="white" fontWeight="bold"
                      initial={{ x: 430, y: 365, opacity: 0 }}
                      animate={{ x: 130, y: 195, opacity: [0, 1, 1, 0] }}
                      transition={{ duration: 1.5 * mult, delay: delay * mult, repeat: Infinity, repeatDelay: 1 * mult }}
                    >
                      ARP Reply
                    </motion.text>
                  </motion.g>
                ))}
                {/* Attacker → Gateway */}
                {[0.4, 1.2, 2.0].map((delay, i) => (
                  <motion.g key={`pkt-g-${i}`}>
                    <motion.rect
                      width="70" height="22" rx="4" fill="#dc2626"
                      initial={{ x: 415, y: 370, opacity: 0 }}
                      animate={{ x: 715, y: 180, opacity: [0, 1, 1, 0] }}
                      transition={{ duration: 1.5 * mult, delay: delay * mult, repeat: Infinity, repeatDelay: 1 * mult }}
                    />
                    <motion.text
                      fontSize="8" fill="white" fontWeight="bold"
                      initial={{ x: 430, y: 385, opacity: 0 }}
                      animate={{ x: 730, y: 195, opacity: [0, 1, 1, 0] }}
                      transition={{ duration: 1.5 * mult, delay: delay * mult, repeat: Infinity, repeatDelay: 1 * mult }}
                    >
                      ARP Reply
                    </motion.text>
                  </motion.g>
                ))}
              </>
            )}

            {/* Data interception: green dots Victim → Attacker → Gateway */}
            {phase === "intercepting" && (
              <>
                {[0, 0.6, 1.2, 1.8].map((delay, i) => (
                  <motion.circle
                    key={`data-va-${i}`}
                    r="5" fill="#22c55e"
                    initial={{ cx: 150, cy: 200, opacity: 0 }}
                    animate={{ cx: 450, cy: 400, opacity: [0, 1, 1, 0.5] }}
                    transition={{ duration: 1.2 * mult, delay: delay * mult, repeat: Infinity, repeatDelay: 0.5 * mult }}
                  />
                ))}
                {[0.3, 0.9, 1.5, 2.1].map((delay, i) => (
                  <motion.circle
                    key={`data-ag-${i}`}
                    r="5" fill="#22c55e"
                    initial={{ cx: 450, cy: 400, opacity: 0 }}
                    animate={{ cx: 750, cy: 200, opacity: [0, 1, 1, 0.5] }}
                    transition={{ duration: 1.2 * mult, delay: delay * mult, repeat: Infinity, repeatDelay: 0.5 * mult }}
                  />
                ))}
              </>
            )}

            {/* Phase label */}
            <motion.text
              x="450" y="500" textAnchor="middle"
              fill={phase === "complete" ? "#22c55e" : "#fbbf24"}
              fontSize="13" fontWeight="bold"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {phaseLabel[phase]}
            </motion.text>
          </svg>
        </motion.div>

        {/* ===== CONTROL PANEL ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-6 mb-8"
        >
          <h2 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
            <Gauge className="w-5 h-5" />
            لوحة التحكم
          </h2>
          <div className="flex flex-wrap items-center gap-4 mb-5">
            <button
              onClick={startSimulation}
              disabled={phase !== "idle" && phase !== "complete"}
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
                    speed === s
                      ? "bg-cyan-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {s === "slow" ? "بطيء" : s === "normal" ? "عادي" : "سريع"}
                </button>
              ))}
            </div>
          </div>

          {/* Phase indicators */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {(["scanning", "poisoning", "poisoned", "intercepting", "complete"] as Phase[]).map((p, i) => {
              const active = ["scanning", "poisoning", "poisoned", "intercepting", "complete"].indexOf(phase) >= i;
              return (
                <div key={p} className="flex items-center gap-2">
                  <motion.div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0 ${
                      active
                        ? "bg-cyan-600/30 border-cyan-400 text-cyan-300"
                        : "bg-gray-800 border-gray-600 text-gray-500"
                    }`}
                    animate={phase === p ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    {i + 1}
                  </motion.div>
                  <span className={`text-xs ${active ? "text-cyan-300" : "text-gray-600"}`}>
                    {phaseLabel[p]}
                  </span>
                  {i < 4 && <div className={`w-6 h-0.5 ${active ? "bg-cyan-600" : "bg-gray-700"}`} />}
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
            <motion.div
              className="h-full bg-linear-to-r from-cyan-500 via-purple-500 to-red-500 rounded-full"
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
                  className={`${
                    line.cmd.startsWith("$")
                      ? "text-green-400"
                      : line.cmd.startsWith("[✓]")
                      ? "text-yellow-400"
                      : line.cmd.startsWith("[!]")
                      ? "text-red-400"
                      : line.cmd.startsWith("[>]")
                      ? "text-purple-400"
                      : line.cmd.startsWith("[*]")
                      ? "text-cyan-400"
                      : "text-gray-400"
                  }`}
                >
                  {line.cmd}
                </motion.div>
              ))}
            </AnimatePresence>
            {phase !== "idle" && phase !== "complete" && (
              <motion.span
                className="inline-block w-2 h-4 bg-green-400"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
            )}
          </div>
        </motion.div>

        {/* ===== ATTACK ANALYSIS CARDS ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* كيف يعمل الهجوم */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-5"
          >
            <h3 className="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2">
              <Info className="w-5 h-5" />
              كيف يعمل الهجوم
            </h3>
            <ol className="space-y-2 text-gray-300 text-sm list-decimal list-inside">
              <li>المهاجم يفحص الشبكة المحلية لتحديد عناوين IP و MAC للأجهزة</li>
              <li>يُفعّل تمرير الحزم (IP Forwarding) على جهازه</li>
              <li>يرسل ردود ARP مزيفة للضحية: &ldquo;أنا الراوتر&rdquo;</li>
              <li>يرسل ردود ARP مزيفة للراوتر: &ldquo;أنا الضحية&rdquo;</li>
              <li>تتغير جداول ARP في كلا الجهازين</li>
              <li>كل حركة المرور تمر عبر جهاز المهاجم</li>
              <li>المهاجم يمكنه قراءة وتعديل البيانات المارة</li>
            </ol>
          </motion.div>

          {/* الأدوات المستخدمة */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-5"
          >
            <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              الأدوات المستخدمة
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "arpspoof", desc: "أداة تسميم ARP الكلاسيكية من حزمة dsniff" },
                { name: "ettercap", desc: "أداة شاملة لهجمات MITM" },
                { name: "bettercap", desc: "إطار عمل متقدم لهجمات الشبكة" },
                { name: "scapy", desc: "مكتبة Python لبناء حزم مخصصة" },
              ].map((tool) => (
                <div key={tool.name} className="bg-gray-800/60 rounded-xl p-3 border border-gray-700/30">
                  <p className="text-cyan-300 font-mono text-sm font-bold">{tool.name}</p>
                  <p className="text-gray-500 text-xs mt-1">{tool.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* طرق الكشف */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-5"
          >
            <h3 className="text-lg font-bold text-orange-400 mb-3 flex items-center gap-2">
              <Bug className="w-5 h-5" />
              طرق الكشف
            </h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <Search className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                <span><strong>DAI (Dynamic ARP Inspection):</strong> فحص ردود ARP على مستوى السويتش</span>
              </li>
              <li className="flex items-start gap-2">
                <Search className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                <span><strong>مراقبة جدول ARP:</strong> كشف التغييرات المفاجئة في الجدول</span>
              </li>
              <li className="flex items-start gap-2">
                <Search className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                <span><strong>أدوات مثل arpwatch:</strong> مراقبة أزواج IP/MAC</span>
              </li>
              <li className="flex items-start gap-2">
                <Search className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                <span><strong>Wireshark:</strong> تحليل الحزم واكتشاف الردود المشبوهة</span>
              </li>
            </ul>
          </motion.div>

          {/* الحماية */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-5"
          >
            <h3 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              الحماية
            </h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                <span><strong>Static ARP Entries:</strong> تعيين عناوين ARP ثابتة للأجهزة المهمة</span>
              </li>
              <li className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                <span><strong>VPN / تشفير:</strong> تشفير الاتصال يمنع قراءة البيانات حتى لو تم اعتراضها</span>
              </li>
              <li className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                <span><strong>Port Security:</strong> تقييد عدد عناوين MAC لكل منفذ</span>
              </li>
              <li className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                <span><strong>802.1X:</strong> مصادقة الأجهزة قبل السماح بالاتصال بالشبكة</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* ===== TECHNICAL DETAILS ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-6 mb-8"
        >
          <h2 className="text-lg font-bold text-purple-400 mb-5 flex items-center gap-2">
            <Wifi className="w-5 h-5" />
            التفاصيل التقنية
          </h2>

          {/* ARP Packet Structure */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-300 mb-3">هيكل حزمة ARP</h3>
            <div className="grid grid-cols-4 gap-1 text-center font-mono text-xs" dir="ltr">
              {[
                { label: "Hardware Type", span: 2, color: "bg-cyan-900/50 border-cyan-700" },
                { label: "Protocol Type", span: 2, color: "bg-cyan-900/50 border-cyan-700" },
                { label: "HW Size", span: 1, color: "bg-purple-900/50 border-purple-700" },
                { label: "Proto Size", span: 1, color: "bg-purple-900/50 border-purple-700" },
                { label: "Opcode", span: 2, color: "bg-yellow-900/50 border-yellow-700" },
                { label: "Sender MAC", span: 4, color: "bg-red-900/50 border-red-700" },
                { label: "Sender IP", span: 4, color: "bg-red-900/50 border-red-700" },
                { label: "Target MAC", span: 4, color: "bg-green-900/50 border-green-700" },
                { label: "Target IP", span: 4, color: "bg-green-900/50 border-green-700" },
              ].map((field, i) => (
                <div
                  key={i}
                  className={`${field.color} border rounded-lg p-2 col-span-${field.span}`}
                  style={{ gridColumn: `span ${field.span}` }}
                >
                  {field.label}
                </div>
              ))}
            </div>
          </div>

          {/* Before / After ARP Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-950/80 rounded-xl p-4 border border-gray-800">
              <h4 className="text-green-400 font-bold text-sm mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                جدول ARP قبل الهجوم (سليم)
              </h4>
              <table className="w-full text-xs font-mono" dir="ltr">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-800">
                    <th className="text-left pb-2">IP Address</th>
                    <th className="text-left pb-2">MAC Address</th>
                    <th className="text-left pb-2">Type</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr><td className="py-1">{GATEWAY.ip}</td><td className="text-green-400">{GATEWAY.mac}</td><td>dynamic</td></tr>
                  <tr><td className="py-1">{VICTIM.ip}</td><td className="text-green-400">{VICTIM.mac}</td><td>dynamic</td></tr>
                </tbody>
              </table>
            </div>
            <div className="bg-gray-950/80 rounded-xl p-4 border border-red-900/50">
              <h4 className="text-red-400 font-bold text-sm mb-3 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                جدول ARP بعد الهجوم (مسموم)
              </h4>
              <table className="w-full text-xs font-mono" dir="ltr">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-800">
                    <th className="text-left pb-2">IP Address</th>
                    <th className="text-left pb-2">MAC Address</th>
                    <th className="text-left pb-2">Type</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr>
                    <td className="py-1">{GATEWAY.ip}</td>
                    <td className="text-red-400 font-bold">{ATTACKER.mac}</td>
                    <td className="text-red-400">⚠ poisoned</td>
                  </tr>
                  <tr>
                    <td className="py-1">{VICTIM.ip}</td>
                    <td className="text-red-400 font-bold">{ATTACKER.mac}</td>
                    <td className="text-red-400">⚠ poisoned</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Network Topology Change */}
          <div>
            <h3 className="text-sm font-bold text-gray-300 mb-3">تغيير مسار الشبكة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-950/80 rounded-xl p-4 border border-green-900/30">
                <p className="text-green-400 text-xs font-bold mb-2">✓ المسار الطبيعي</p>
                <div className="flex items-center justify-center gap-2 text-sm" dir="ltr">
                  <span className="bg-cyan-900/40 border border-cyan-700/50 rounded-lg px-3 py-1.5 text-cyan-300">Victim</span>
                  <motion.span
                    className="text-green-400"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ──────→
                  </motion.span>
                  <span className="bg-green-900/40 border border-green-700/50 rounded-lg px-3 py-1.5 text-green-300">Gateway</span>
                </div>
              </div>
              <div className="bg-gray-950/80 rounded-xl p-4 border border-red-900/30">
                <p className="text-red-400 text-xs font-bold mb-2">✗ المسار المسموم</p>
                <div className="flex items-center justify-center gap-2 text-sm" dir="ltr">
                  <span className="bg-cyan-900/40 border border-cyan-700/50 rounded-lg px-3 py-1.5 text-cyan-300">Victim</span>
                  <motion.span
                    className="text-red-400"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    ──→
                  </motion.span>
                  <span className="bg-red-900/40 border border-red-700/50 rounded-lg px-3 py-1.5 text-red-300">☠ Attacker</span>
                  <motion.span
                    className="text-red-400"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                  >
                    ──→
                  </motion.span>
                  <span className="bg-green-900/40 border border-green-700/50 rounded-lg px-3 py-1.5 text-green-300">Gateway</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ===== EDUCATIONAL WARNING ===== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-yellow-900/20 border border-yellow-700/40 rounded-2xl p-5 text-center"
        >
          <ShieldAlert className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <p className="text-yellow-300 text-sm font-bold mb-1">
            هذه المحاكاة للأغراض التعليمية فقط
          </p>
          <p className="text-gray-400 text-xs">
            استخدام هذه التقنيات على شبكات بدون إذن يعد جريمة يعاقب عليها القانون.
            تعلم الأمن السيبراني لحماية الأنظمة وليس لاختراقها.
          </p>
        </motion.div>
      </div>
    </PageShell>
  );
}
