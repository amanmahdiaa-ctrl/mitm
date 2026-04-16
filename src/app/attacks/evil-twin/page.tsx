"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio,
  Play,
  RotateCcw,
  Terminal,
  Wifi,
  WifiOff,
  ShieldCheck,
  ShieldAlert,
  Eye,
  Gauge,
  Info,
  Wrench,
  Bug,
  Lock,
  LockOpen,
  Smartphone,
  Laptop,
  Skull,
  Globe,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Signal,
} from "lucide-react";
import PageShell from "@/components/PageShell";

/* ───── types & constants ───── */
type Phase = "idle" | "scanning" | "connecting" | "portal" | "capturing" | "complete";
type Speed = "slow" | "normal" | "fast";

const SPEED_MAP: Record<Speed, number> = { slow: 2, normal: 1, fast: 0.5 };

const terminalLines = [
  { cmd: "$ airmon-ng start wlan0", phase: "scanning" as Phase },
  { cmd: "[✓] تم تفعيل وضع المراقبة على wlan0mon", phase: "scanning" as Phase },
  { cmd: "$ airodump-ng wlan0mon", phase: "scanning" as Phase },
  { cmd: "[*] BSSID: AA:BB:CC:DD:EE:FF  CH:6  ESSID: CoffeeShop_WiFi", phase: "scanning" as Phase },
  { cmd: '$ airbase-ng -e "CoffeeShop_WiFi" -c 6 wlan0mon', phase: "connecting" as Phase },
  { cmd: "[*] إنشاء نقطة وصول مزيفة: CoffeeShop_WiFi ...", phase: "connecting" as Phase },
  { cmd: "$ dnsmasq -C dnsmasq.conf", phase: "connecting" as Phase },
  { cmd: "[✓] خادم DHCP يعمل - نطاق: 10.0.0.10-10.0.0.50", phase: "connecting" as Phase },
  { cmd: "$ hostapd hostapd.conf", phase: "portal" as Phase },
  { cmd: "[✓] نقطة الوصول المزيفة جاهزة - في انتظار الضحايا...", phase: "portal" as Phase },
  { cmd: "[!] جهاز جديد متصل: 10.0.0.12 (iPhone)", phase: "portal" as Phase },
  { cmd: "[>] عرض بوابة تسجيل الدخول المزيفة...", phase: "capturing" as Phase },
  { cmd: "[!] بيانات ملتقطة: email=user@example.com", phase: "capturing" as Phase },
  { cmd: "[!] بيانات ملتقطة: password=MyP@ssw0rd!", phase: "capturing" as Phase },
  { cmd: "[>] اعتراض DNS: facebook.com → 10.0.0.1", phase: "capturing" as Phase },
  { cmd: "[✓] تم التقاط 23 طلب HTTP و 4 بيانات اعتماد", phase: "complete" as Phase },
];

const capturedData = [
  { url: "facebook.com/login", data: "email=user@mail.com" },
  { url: "bank.example.com", data: "password=MyP@ss!" },
  { url: "mail.google.com", data: "cookie=sess_abc123" },
];

/* ───── component ───── */
export default function EvilTwinPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [speed, setSpeed] = useState<Speed>("normal");
  const [visibleLines, setVisibleLines] = useState(0);
  const [progress, setProgress] = useState(0);
  const [macRandom, setMacRandom] = useState(false);
  const [vpnActive, setVpnActive] = useState(false);
  const [wifiSelected, setWifiSelected] = useState<string | null>(null);
  const [portalEmail, setPortalEmail] = useState("");
  const [portalPass, setPortalPass] = useState("");
  const [portalSubmitted, setPortalSubmitted] = useState(false);
  const [ringKey, setRingKey] = useState(0);
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
    setWifiSelected(null);
    setPortalEmail("");
    setPortalPass("");
    setPortalSubmitted(false);
    setVisibleLines(0);
    setProgress(0);
    setRingKey((k) => k + 1);

    if (vpnActive) {
      setPhase("scanning");
      const t1 = setTimeout(() => setPhase("connecting"), 3000 * mult);
      const t2 = setTimeout(() => {
        setPhase("idle");
      }, 5000 * mult);
      timerRef.current.push(t1, t2);
      return;
    }

    setPhase("scanning");

    const phases: { p: Phase; delay: number }[] = [
      { p: "scanning", delay: 0 },
      { p: "connecting", delay: 3000 * mult },
      { p: "portal", delay: 6000 * mult },
      { p: "capturing", delay: 10000 * mult },
      { p: "complete", delay: 14000 * mult },
    ];

    phases.forEach(({ p, delay }) => {
      const t = setTimeout(() => setPhase(p), delay);
      timerRef.current.push(t);
    });

    const tSelect = setTimeout(() => setWifiSelected("evil"), 4000 * mult);
    const tPortalFill = setTimeout(() => {
      setPortalEmail("user@example.com");
      setPortalPass("MyP@ssw0rd!");
    }, 8000 * mult);
    const tPortalSubmit = setTimeout(() => setPortalSubmitted(true), 9500 * mult);
    timerRef.current.push(tSelect, tPortalFill, tPortalSubmit);

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
    setWifiSelected(null);
    setPortalEmail("");
    setPortalPass("");
    setPortalSubmitted(false);
  };

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [visibleLines]);

  const phaseLabel: Record<Phase, string> = {
    idle: "في الانتظار",
    scanning: "فحص الشبكات",
    connecting: "اتصال بالتوأم",
    portal: "بوابة مزيفة",
    capturing: "التقاط البيانات",
    complete: "اكتمل الهجوم",
  };

  const svgPhaseLabel: Record<Phase, string> = {
    idle: "Idle",
    scanning: "Scanning",
    connecting: "Connecting",
    portal: "Fake Portal",
    capturing: "Capturing",
    complete: "Complete",
  };

  const phaseIndex = (["idle", "scanning", "connecting", "portal", "capturing", "complete"] as Phase[]).indexOf(phase);
  const isActive = phase !== "idle";
  const isConnected = phaseIndex >= 2;
  const isCapturing = phaseIndex >= 3;

  /* signal bar helper */
  const SignalBars = ({ strength, color }: { strength: number; color: string }) => (
    <div className="flex items-end gap-0.5 h-4">
      {[1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className={`w-1 rounded-sm ${i <= strength ? color : "bg-gray-700"}`}
          style={{ height: `${i * 25}%` }}
          animate={i <= strength ? { opacity: [0.6, 1, 0.6] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
        {/* ===== HEADER ===== */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Radio className="w-9 h-9 text-red-400" />
            <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-red-400 via-orange-400 to-cyan-400 bg-clip-text text-transparent">
              هجوم التوأم الشرير (Evil Twin)
            </h1>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
            هجوم التوأم الشرير ينشئ نقطة وصول Wi-Fi مزيفة بنفس اسم الشبكة الحقيقية وبإشارة أقوى،
            مما يخدع الأجهزة للاتصال بها تلقائياً ويسمح للمهاجم باعتراض جميع البيانات
          </p>
        </motion.div>

        {/* ===== VPN BLOCKED BANNER ===== */}
        <AnimatePresence>
          {vpnActive && isActive && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-6 bg-green-500/10 border border-green-500/40 rounded-xl p-4 flex items-center gap-3"
            >
              <ShieldCheck className="w-7 h-7 text-green-400 shrink-0" />
              <div>
                <p className="text-green-300 font-bold">VPN يحمي اتصالك!</p>
                <p className="text-green-400/70 text-sm">
                  حتى لو اتصلت بشبكة مزيفة، جميع بياناتك مشفرة عبر نفق VPN ولا يمكن قراءتها.
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
            مشهد المقهى - هجوم التوأم الشرير
          </h2>

          <svg viewBox="0 0 900 500" className="w-full h-auto">
            <defs>
              <filter id="glow-g">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="glow-r">
                <feGaussianBlur stdDeviation="4" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <linearGradient id="lg-green" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" /><stop offset="100%" stopColor="#16a34a" />
              </linearGradient>
              <linearGradient id="lg-red" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" /><stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
            </defs>

            {/* Coffee shop background */}
            <rect x="20" y="20" width="860" height="460" rx="16" fill="#0a0a0f" stroke="#1e293b" strokeWidth="1" />
            <text x="450" y="55" textAnchor="middle" fill="#475569" fontSize="14" fontFamily="monospace">☕ CoffeeShop Café</text>

            {/* ── Legit Router (top-left) ── */}
            <g transform="translate(150,120)">
              <rect x="-45" y="-30" width="90" height="60" rx="10" fill="#064e3b" stroke="#22c55e" strokeWidth="1.5" />
              <text x="0" y="-8" textAnchor="middle" fill="#22c55e" fontSize="18">📡</text>
              <text x="0" y="12" textAnchor="middle" fill="#86efac" fontSize="9" fontFamily="monospace">Legit Router</text>
              <rect x="-55" y="34" width="110" height="30" rx="4" fill="#052e16" stroke="#166534" strokeWidth="0.8" />
              <text x="0" y="48" textAnchor="middle" fill="#4ade80" fontSize="8" fontFamily="monospace">CoffeeShop_WiFi</text>
              <text x="0" y="60" textAnchor="middle" fill="#166534" fontSize="7" fontFamily="monospace">WPA2 | -45dBm</text>
              {/* Green signal rings */}
              {[40, 60, 80].map((r, i) => (
                <motion.circle
                  key={`gr-${i}-${ringKey}`}
                  cx="0" cy="0" r={r} fill="none" stroke="#22c55e" strokeWidth="0.8"
                  initial={{ opacity: 0.5, scale: 0.5 }}
                  animate={{ opacity: [0.4, 0], scale: [0.6, 1.2] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.8, ease: "easeOut" }}
                />
              ))}
            </g>

            {/* ── Evil Twin Router (top-right) ── */}
            <g transform="translate(750,120)">
              <motion.rect
                x="-45" y="-30" width="90" height="60" rx="10" fill="#450a0a" stroke="#ef4444" strokeWidth="1.5"
                animate={isActive ? { filter: ["drop-shadow(0 0 4px #ef4444)", "drop-shadow(0 0 10px #ef4444)"] } : {}}
                transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
              />
              <text x="0" y="-8" textAnchor="middle" fill="#ef4444" fontSize="18">📡</text>
              <text x="0" y="12" textAnchor="middle" fill="#fca5a5" fontSize="9" fontFamily="monospace">Evil Twin!</text>
              <rect x="-55" y="34" width="110" height="30" rx="4" fill="#1c0505" stroke="#991b1b" strokeWidth="0.8" />
              <text x="0" y="48" textAnchor="middle" fill="#f87171" fontSize="8" fontFamily="monospace">CoffeeShop_WiFi</text>
              <text x="0" y="60" textAnchor="middle" fill="#991b1b" fontSize="7" fontFamily="monospace">Open | -30dBm ⚡</text>
              {/* Red signal rings - stronger */}
              {[45, 70, 95, 120].map((r, i) => (
                <motion.circle
                  key={`rr-${i}-${ringKey}`}
                  cx="0" cy="0" r={r} fill="none" stroke="#ef4444" strokeWidth="1"
                  initial={{ opacity: 0.6, scale: 0.5 }}
                  animate={{ opacity: [0.5, 0], scale: [0.5, 1.3] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.6, ease: "easeOut" }}
                />
              ))}
            </g>

            {/* ── Victim (bottom-center) ── */}
            <g transform="translate(450,380)">
              <rect x="-40" y="-25" width="80" height="50" rx="8" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" />
              <text x="0" y="-5" textAnchor="middle" fill="#a5b4fc" fontSize="16">📱</text>
              <text x="0" y="14" textAnchor="middle" fill="#c4b5fd" fontSize="9" fontFamily="monospace">Victim Device</text>
            </g>

            {/* ── Attacker (bottom-right) ── */}
            <g transform="translate(750,380)">
              <rect x="-40" y="-25" width="80" height="50" rx="8" fill="#450a0a" stroke="#ef4444" strokeWidth="1.5" />
              <text x="0" y="-5" textAnchor="middle" fill="#fca5a5" fontSize="16">💻</text>
              <text x="0" y="14" textAnchor="middle" fill="#fca5a5" fontSize="9" fontFamily="monospace">Attacker</text>
            </g>

            {/* Connection line: legitimate (green dashed, before evil connect) */}
            {!isConnected && (
              <motion.line x1="170" y1="155" x2="430" y2="360" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="6 4" opacity={0.4} />
            )}

            {/* Connection line: victim → evil twin (red) */}
            {isConnected && !vpnActive && (
              <motion.line
                x1="470" y1="360" x2="730" y2="155"
                stroke="#ef4444" strokeWidth="2.5"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 1 }}
                filter="url(#glow-r)"
              />
            )}

            {/* Data packets flowing to attacker */}
            {isCapturing && !vpnActive && (
              <>
                {[0, 1, 2].map((i) => (
                  <motion.circle
                    key={`pkt-${i}`}
                    r="4" fill="#ef4444"
                    initial={{ cx: 470, cy: 360, opacity: 0 }}
                    animate={{ cx: [470, 730], cy: [360, 155], opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.6, ease: "easeInOut" }}
                    filter="url(#glow-r)"
                  />
                ))}
                {/* Data labels floating */}
                <motion.text
                  x="600" y="240" fill="#fca5a5" fontSize="8" fontFamily="monospace" textAnchor="middle"
                  animate={{ opacity: [0, 1, 1, 0], y: [250, 230] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >password=MyP@ss!</motion.text>
                <motion.text
                  x="580" y="275" fill="#fca5a5" fontSize="8" fontFamily="monospace" textAnchor="middle"
                  animate={{ opacity: [0, 1, 1, 0], y: [285, 265] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
                >cookie=session_abc</motion.text>
              </>
            )}

            {/* Evil twin → Attacker pipe */}
            {isConnected && !vpnActive && (
              <motion.line
                x1="750" y1="155" x2="750" y2="355"
                stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 3"
                initial={{ opacity: 0 }} animate={{ opacity: 0.7 }}
              />
            )}

            {/* VPN shield overlay */}
            {vpnActive && isActive && (
              <g transform="translate(450,300)">
                <motion.rect
                  x="-60" y="-20" width="120" height="40" rx="8" fill="#065f46" stroke="#10b981" strokeWidth="2"
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <text x="0" y="5" textAnchor="middle" fill="#6ee7b7" fontSize="10" fontFamily="monospace">🔒 Encrypted VPN Tunnel</text>
              </g>
            )}

            {/* Status indicator */}
            <g transform="translate(70,460)">
              <circle r="5" fill={isActive ? (phase === "complete" ? "#ef4444" : "#eab308") : "#22c55e"} />
              <text x="12" y="4" fill="#94a3b8" fontSize="10" fontFamily="monospace">{svgPhaseLabel[phase]}</text>
            </g>
          </svg>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* ===== WI-FI SCANNER MOCKUP ===== */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-950/80 border border-gray-700/50 rounded-2xl p-5"
          >
            <h2 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <Wifi className="w-5 h-5" />
              شبكات Wi-Fi المتاحة
            </h2>

            {/* Phone-like Wi-Fi list */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              {/* Network 1: Legit */}
              <div className="flex items-center justify-between p-3 border-b border-gray-800/60 hover:bg-gray-800/30 transition-colors">
                <div className="flex items-center gap-3">
                  <SignalBars strength={3} color="bg-green-400" />
                  <div>
                    <p className="text-gray-200 text-sm font-medium">CoffeeShop_WiFi</p>
                    <p className="text-gray-500 text-xs">WPA2 محمية • -45dBm</p>
                  </div>
                </div>
                <Lock className="w-4 h-4 text-gray-500" />
              </div>

              {/* Network 2: Evil Twin */}
              <motion.div
                className={`flex items-center justify-between p-3 border-b border-gray-800/60 cursor-pointer transition-colors ${
                  wifiSelected === "evil" ? "bg-red-500/10 border-red-500/30" : "hover:bg-gray-800/30"
                }`}
                animate={isActive && !isConnected ? { backgroundColor: ["rgba(239,68,68,0)", "rgba(239,68,68,0.08)", "rgba(239,68,68,0)"] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <div className="flex items-center gap-3">
                  <SignalBars strength={4} color="bg-red-400" />
                  <div>
                    <p className="text-gray-200 text-sm font-medium">CoffeeShop_WiFi</p>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-500 text-xs">شبكة مفتوحة • -30dBm</p>
                      {wifiSelected === "evil" && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-red-400"
                        >
                          {isConnected ? "✓ متصل" : "جارِ الاتصال..."}
                        </motion.span>
                      )}
                    </div>
                  </div>
                </div>
                <LockOpen className="w-4 h-4 text-red-400" />
              </motion.div>

              {/* Other networks */}
              {[
                { name: "Neighbor_5G", signal: 2, secured: true, dbm: "-65dBm" },
                { name: "HUAWEI-B311", signal: 1, secured: true, dbm: "-78dBm" },
                { name: "AndroidAP", signal: 1, secured: false, dbm: "-82dBm" },
              ].map((net) => (
                <div key={net.name} className="flex items-center justify-between p-3 border-b border-gray-800/60 last:border-b-0 opacity-60">
                  <div className="flex items-center gap-3">
                    <SignalBars strength={net.signal} color="bg-gray-400" />
                    <div>
                      <p className="text-gray-400 text-sm">{net.name}</p>
                      <p className="text-gray-600 text-xs">{net.secured ? "WPA2" : "مفتوحة"} • {net.dbm}</p>
                    </div>
                  </div>
                  {net.secured ? <Lock className="w-4 h-4 text-gray-600" /> : <LockOpen className="w-4 h-4 text-gray-600" />}
                </div>
              ))}
            </div>

            {/* Warning hint */}
            <div className="mt-3 flex items-start gap-2 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-2.5">
              <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-yellow-400/80 text-xs leading-relaxed">
                لاحظ: شبكتان بنفس الاسم! الشبكة المفتوحة بإشارة أقوى هي على الأرجح التوأم الشرير.
                تحقق من BSSID (عنوان MAC) مع موظفي المقهى.
              </p>
            </div>
          </motion.div>

          {/* ===== CAPTIVE PORTAL MOCKUP ===== */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-950/80 border border-gray-700/50 rounded-2xl p-5"
          >
            <h2 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              بوابة تسجيل الدخول المزيفة
            </h2>

            <div className="bg-white rounded-xl overflow-hidden border-2 border-gray-300 relative">
              {/* Fake browser bar */}
              <div className="bg-gray-100 px-3 py-2 flex items-center gap-2 border-b border-gray-200">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 bg-white rounded px-2 py-0.5 text-xs text-gray-500 flex items-center gap-1 border border-gray-200" dir="ltr">
                  <XCircle className="w-3 h-3 text-red-500" />
                  <span>http://10.0.0.1/portal</span>
                </div>
              </div>

              {/* Portal content */}
              <div className="p-5 bg-linear-to-b from-blue-50 to-white">
                <div className="text-center mb-4">
                  <div className="text-2xl mb-1">☕</div>
                  <h3 className="text-gray-800 font-bold text-sm">CoffeeShop Free WiFi</h3>
                  <p className="text-gray-500 text-xs">سجّل الدخول للوصول إلى الإنترنت المجاني</p>
                </div>

                <div className="space-y-2.5 mb-3">
                  <input
                    type="email"
                    placeholder="البريد الإلكتروني"
                    value={portalEmail}
                    readOnly
                    className="w-full px-3 py-2 rounded border border-gray-300 text-xs text-gray-700 bg-white"
                    dir="ltr"
                  />
                  <input
                    type="password"
                    placeholder="كلمة المرور"
                    value={portalPass}
                    readOnly
                    className="w-full px-3 py-2 rounded border border-gray-300 text-xs text-gray-700 bg-white"
                    dir="ltr"
                  />
                </div>

                <motion.button
                  className={`w-full py-2 rounded text-white text-xs font-bold transition-colors ${
                    portalSubmitted ? "bg-green-500" : "bg-blue-500"
                  }`}
                  animate={portalSubmitted ? { scale: [1, 1.02, 1] } : {}}
                >
                  {portalSubmitted ? "✓ تم الاتصال!" : "اتصل بالإنترنت"}
                </motion.button>
              </div>

              {/* Red warning overlay for educated user */}
              <motion.div
                className="absolute top-0 left-0 w-full h-full pointer-events-none border-2 border-red-500/0 rounded-xl"
                animate={isCapturing && !vpnActive ? { borderColor: ["rgba(239,68,68,0)", "rgba(239,68,68,0.4)", "rgba(239,68,68,0)"] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              />
              {isCapturing && !vpnActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute top-10 right-1 bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold"
                >
                  ⚠ HTTP غير آمن!
                </motion.div>
              )}
            </div>

            {/* Captured data (attacker view) */}
            <AnimatePresence>
              {portalSubmitted && !vpnActive && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 bg-red-500/5 border border-red-500/30 rounded-lg p-3"
                >
                  <p className="text-red-400 text-xs font-bold mb-2 flex items-center gap-1">
                    <Skull className="w-3.5 h-3.5" />
                    عرض المهاجم - بيانات ملتقطة:
                  </p>
                  {capturedData.map((d, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.3 }}
                      className="text-[10px] font-mono text-red-300/80 mb-1 bg-red-950/30 px-2 py-1 rounded"
                      dir="ltr"
                    >
                      [{d.url}] {d.data}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* ===== CONTROL PANEL ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gray-950/80 border border-gray-700/50 rounded-2xl p-5 mb-8"
        >
          <div className="flex flex-wrap items-center gap-4">
            {/* Play / Reset */}
            <button
              onClick={startSimulation}
              disabled={isActive && phase !== "complete"}
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors"
            >
              <Play className="w-4 h-4" /> بدء المحاكاة
            </button>
            <button
              onClick={reset}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> إعادة تعيين
            </button>

            {/* Speed */}
            <div className="flex items-center gap-2 mr-auto">
              <Gauge className="w-4 h-4 text-gray-400" />
              {(["slow", "normal", "fast"] as Speed[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                    speed === s ? "bg-cyan-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {s === "slow" ? "بطيء" : s === "normal" ? "عادي" : "سريع"}
                </button>
              ))}
            </div>

            {/* Toggles */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span className="text-xs text-gray-400">MAC عشوائي</span>
              <div
                className={`w-9 h-5 rounded-full relative transition-colors ${macRandom ? "bg-cyan-600" : "bg-gray-700"}`}
                onClick={() => setMacRandom(!macRandom)}
              >
                <motion.div
                  className="w-4 h-4 bg-white rounded-full absolute top-0.5"
                  animate={{ left: macRandom ? 18 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </div>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span className="text-xs text-gray-400">VPN مفعّل</span>
              <div
                className={`w-9 h-5 rounded-full relative transition-colors ${vpnActive ? "bg-green-600" : "bg-gray-700"}`}
                onClick={() => setVpnActive(!vpnActive)}
              >
                <motion.div
                  className="w-4 h-4 bg-white rounded-full absolute top-0.5"
                  animate={{ left: vpnActive ? 18 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </div>
            </label>
          </div>

          {/* Phase progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
              <span>{phaseLabel[phase]}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-linear-to-r from-cyan-500 via-orange-500 to-red-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              {(["فحص", "اتصال", "بوابة", "التقاط", "اكتمال"] as const).map((label, i) => (
                <span
                  key={label}
                  className={`text-[10px] font-bold ${phaseIndex >= i + 1 ? "text-red-400" : "text-gray-600"}`}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* MAC randomization note */}
          <AnimatePresence>
            {macRandom && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-2.5 text-xs text-cyan-400/80"
              >
                <ShieldCheck className="w-4 h-4 inline ml-1" />
                عنوان MAC العشوائي يجعل من الصعب تتبع جهازك عبر الشبكات المختلفة، لكنه لا يحمي
                من هجوم التوأم الشرير بشكل مباشر — تحتاج VPN للحماية الكاملة.
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ===== TERMINAL FEED ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-950/80 border border-gray-700/50 rounded-2xl p-5 mb-8"
        >
          <h2 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            طرفية المهاجم
          </h2>
          <div
            ref={terminalRef}
            className="bg-black/80 rounded-xl p-4 h-56 overflow-y-auto font-mono text-xs border border-gray-800 space-y-1"
            dir="ltr"
          >
            <div className="text-green-500/50 mb-2">root@kali:~# Evil Twin Attack Framework v2.1</div>
            {terminalLines.slice(0, visibleLines).map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={
                  line.cmd.startsWith("[!]")
                    ? "text-red-400"
                    : line.cmd.startsWith("[✓]")
                    ? "text-green-400"
                    : line.cmd.startsWith("[>]")
                    ? "text-yellow-400"
                    : line.cmd.startsWith("[*]")
                    ? "text-cyan-400"
                    : "text-gray-300"
                }
              >
                {line.cmd}
              </motion.div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: How it works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-5"
          >
            <h3 className="text-base font-bold text-cyan-400 mb-3 flex items-center gap-2">
              <Info className="w-5 h-5" />
              كيف يعمل هجوم التوأم الشرير؟
            </h3>
            <ul className="space-y-2 text-sm text-gray-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold shrink-0">1.</span>
                المهاجم يُنشئ نقطة وصول Wi-Fi بنفس اسم (ESSID) الشبكة الحقيقية
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold shrink-0">2.</span>
                يضبط الإشارة لتكون أقوى من الشبكة الأصلية باستخدام هوائي خارجي
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold shrink-0">3.</span>
                أجهزة الضحايا تتصل تلقائياً بالإشارة الأقوى
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold shrink-0">4.</span>
                يعرض بوابة تسجيل دخول مزيفة (Captive Portal) لجمع بيانات الاعتماد
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold shrink-0">5.</span>
                جميع حركة المرور تمر عبر جهاز المهاجم — كلمات المرور، الرسائل، الصور
              </li>
            </ul>
          </motion.div>

          {/* Card 2: Tools */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-5"
          >
            <h3 className="text-base font-bold text-orange-400 mb-3 flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              أدوات الهجوم
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: "aircrack-ng", desc: "فحص وكسر الشبكات اللاسلكية" },
                { name: "hostapd", desc: "إنشاء نقطة وصول مزيفة" },
                { name: "dnsmasq", desc: "خادم DHCP و DNS محلي" },
                { name: "WiFi Pineapple", desc: "جهاز هجمات Wi-Fi متخصص" },
                { name: "mdk4", desc: "إرسال إشارات إلغاء المصادقة" },
                { name: "Wireshark", desc: "تحليل حزم البيانات الملتقطة" },
              ].map((tool) => (
                <div key={tool.name} className="bg-gray-950/60 rounded-lg p-2.5 border border-gray-800/50">
                  <p className="text-orange-300 text-xs font-bold font-mono">{tool.name}</p>
                  <p className="text-gray-500 text-[10px] mt-0.5">{tool.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Card 3: Detection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-5"
          >
            <h3 className="text-base font-bold text-yellow-400 mb-3 flex items-center gap-2">
              <Bug className="w-5 h-5" />
              كشف الهجوم
            </h3>
            <ul className="space-y-2 text-sm text-gray-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                مقارنة عناوين BSSID — الشبكات المتشابهة بعناوين MAC مختلفة مشبوهة
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                شذوذ في قوة الإشارة — إشارة أقوى فجأة قد تكون توأم شرير
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                تحذيرات الشهادات — شهادات SSL غير صالحة عند التصفح
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                طلب تسجيل دخول غير متوقع بعد الاتصال بشبكة معروفة
              </li>
            </ul>
          </motion.div>

          {/* Card 4: Protection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-5"
          >
            <h3 className="text-base font-bold text-green-400 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              طرق الحماية
            </h3>
            <ul className="space-y-2 text-sm text-gray-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                استخدم VPN دائماً عند الاتصال بشبكات Wi-Fi عامة
              </li>
              <li className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                تحقق من اسم الشبكة مع موظفي المكان قبل الاتصال
              </li>
              <li className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                تجنب إدخال بيانات حساسة على شبكات Wi-Fi المفتوحة
              </li>
              <li className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                عطّل الاتصال التلقائي بالشبكات وفعّل &quot;نسيان الشبكة&quot; بعد المغادرة
              </li>
              <li className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                استخدم بيانات الهاتف المحمول بدلاً من Wi-Fi عام للمعاملات المهمة
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </PageShell>
  );
}