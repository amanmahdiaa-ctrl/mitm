"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { SimulationPhase, Protocol, LoginData } from "@/types";

interface MitmVisualSceneProps {
  phase: SimulationPhase;
  protocol: Protocol;
  interceptedData: LoginData | null;
}

/* ───────── مجسّم الضحية (شخص + حاسوب) ───────── */
function VictimFigure({ phase }: { phase: SimulationPhase }) {
  const isActive = phase === "sending";
  return (
    <g>
      {/* المكتب */}
      <rect x="30" y="195" width="120" height="8" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="1" />
      {/* أرجل المكتب */}
      <rect x="40" y="203" width="6" height="27" rx="1" fill="#1e293b" />
      <rect x="134" y="203" width="6" height="27" rx="1" fill="#1e293b" />

      {/* شاشة الحاسوب */}
      <rect x="50" y="130" width="80" height="55" rx="4" fill="#0f172a" stroke={isActive ? "#3b82f6" : "#334155"} strokeWidth="1.5" />
      {/* شاشة داخلية */}
      <rect x="55" y="135" width="70" height="40" rx="2" fill={isActive ? "#0c1a33" : "#0a0f1a"} />
      {/* حامل الشاشة */}
      <rect x="82" y="185" width="16" height="10" rx="1" fill="#1e293b" />
      <rect x="72" y="192" width="36" height="4" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="0.5" />

      {/* محتوى الشاشة - نموذج تسجيل دخول */}
      <rect x="65" y="142" width="50" height="6" rx="1" fill="#1e3a5f" opacity="0.7" />
      <rect x="65" y="151" width="50" height="6" rx="1" fill="#1e3a5f" opacity="0.7" />
      <rect x="75" y="160" width="30" height="8" rx="2" fill={isActive ? "#3b82f6" : "#1e3a5f"} />
      {isActive && (
        <motion.rect
          x="75" y="160" width="30" height="8" rx="2" fill="#3b82f6"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.2, repeat: 3, ease: "easeInOut" }}
        />
      )}

      {/* شخص (رأس + جسم) */}
      {/* الرأس */}
      <circle cx="90" cy="98" r="16" fill="#1e293b" stroke="#3b82f6" strokeWidth="1" />
      {/* الوجه - عينان */}
      <circle cx="84" cy="95" r="2" fill="#64748b" />
      <circle cx="96" cy="95" r="2" fill="#64748b" />
      {/* فم */}
      <path d="M 84 103 Q 90 108 96 103" stroke="#64748b" strokeWidth="1" fill="none" />

      {/* الجسم */}
      <path d="M 90 114 L 90 140" stroke="#334155" strokeWidth="2" />
      {/* الكتفين */}
      <path d="M 70 130 L 90 122 L 110 130" stroke="#334155" strokeWidth="2" fill="none" />
      {/* اليدان ممتدتان للكيبورد */}
      <motion.path
        d="M 70 130 L 65 155 Q 63 158 65 160"
        stroke="#334155" strokeWidth="2" fill="none"
        animate={isActive ? { d: ["M 70 130 L 65 155 Q 63 158 65 160", "M 70 130 L 67 154 Q 65 157 67 159", "M 70 130 L 65 155 Q 63 158 65 160"] } : {}}
        transition={{ duration: 0.5, repeat: 8, ease: "easeInOut" }}
      />
      <motion.path
        d="M 110 130 L 115 155 Q 117 158 115 160"
        stroke="#334155" strokeWidth="2" fill="none"
        animate={isActive ? { d: ["M 110 130 L 115 155 Q 117 158 115 160", "M 110 130 L 113 154 Q 115 157 113 159", "M 110 130 L 115 155 Q 117 158 115 160"] } : {}}
        transition={{ duration: 0.55, repeat: 8, ease: "easeInOut", delay: 0.15 }}
      />

      {/* الكيبورد */}
      <rect x="55" y="188" width="70" height="6" rx="1.5" fill="#1e293b" stroke="#334155" strokeWidth="0.5" />
      {/* مفاتيح الكيبورد */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <motion.rect
          key={`key-${i}`}
          x={60 + i * 7}
          y="189.5"
          width="5"
          height="3"
          rx="0.5"
          fill={isActive ? "#334155" : "#1e293b"}
          animate={isActive ? { fill: ["#334155", "#3b82f6", "#334155"] } : {}}
          transition={{ duration: 0.4, delay: i * 0.12, repeat: 5, ease: "easeInOut" }}
        />
      ))}

      {/* تسمية */}
      <text x="90" y="245" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">الضحية</text>
      <text x="90" y="258" textAnchor="middle" fill="#475569" fontSize="8">VICTIM PC</text>
    </g>
  );
}

/* ───────── مجسّم الهاكر (شخص مقنّع + لابتوب) ───────── */
function HackerFigure({ phase, protocol }: { phase: SimulationPhase; protocol: Protocol }) {
  const isIntercepting = phase === "intercepting";
  const isHTTP = protocol === "http";
  const dangerActive = isIntercepting && isHTTP;

  return (
    <g>
      {/* توهج خلفي خطير */}
      {dangerActive && (
        <motion.circle
          cx="400" cy="150" r="80"
          fill="url(#hackerGlow)"
          animate={{ r: [75, 85, 75], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 3, repeat: 2, ease: "easeInOut" }}
        />
      )}

      {/* المكتب */}
      <rect x="340" y="195" width="120" height="8" rx="2" fill="#1e1020" stroke="#4a1942" strokeWidth="1" />
      <rect x="350" y="203" width="6" height="27" rx="1" fill="#1e1020" />
      <rect x="444" y="203" width="6" height="27" rx="1" fill="#1e1020" />

      {/* اللابتوب */}
      <path d="M 355 195 L 360 145 L 440 145 L 445 195 Z" fill="#0f0a18" stroke={dangerActive ? "#ef4444" : "#3b1a3b"} strokeWidth="1.5" />
      {/* الشاشة */}
      <path d="M 363 190 L 367 150 L 433 150 L 437 190 Z" fill={dangerActive ? "#1a0505" : "#0a0510"} />

      {/* محتوى شاشة الهاكر */}
      {dangerActive ? (
        <>
          {/* بيانات مكشوفة */}
          <motion.rect x="372" y="155" width="56" height="4" rx="1" fill="#ef4444" opacity="0.6"
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 1.5, repeat: 3, ease: "easeInOut" }}
          />
          <motion.rect x="372" y="162" width="45" height="4" rx="1" fill="#ef4444" opacity="0.4"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: 3, ease: "easeInOut", delay: 0.2 }}
          />
          <motion.rect x="372" y="169" width="50" height="4" rx="1" fill="#ef4444" opacity="0.5"
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 1.5, repeat: 3, ease: "easeInOut", delay: 0.4 }}
          />
          <motion.rect x="372" y="176" width="38" height="4" rx="1" fill="#f97316" opacity="0.4"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 1.5, repeat: 3, ease: "easeInOut", delay: 0.3 }}
          />
          <motion.text x="400" y="188" textAnchor="middle" fill="#ef4444" fontSize="6"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.2, repeat: 4, ease: "easeInOut" }}
          >
            DATA CAPTURED
          </motion.text>
        </>
      ) : isIntercepting && !isHTTP ? (
        <>
          {/* بيانات مشفرة */}
          <rect x="372" y="155" width="56" height="4" rx="1" fill="#22c55e" opacity="0.2" />
          <rect x="372" y="162" width="45" height="4" rx="1" fill="#22c55e" opacity="0.15" />
          <rect x="372" y="169" width="50" height="4" rx="1" fill="#22c55e" opacity="0.1" />
          <text x="400" y="186" textAnchor="middle" fill="#22c55e" fontSize="6" opacity="0.6">ENCRYPTED - FAILED</text>
        </>
      ) : (
        <>
          {/* شاشة في وضع الانتظار */}
          <rect x="380" y="160" width="40" height="3" rx="1" fill="#3b1a3b" opacity="0.4" />
          <rect x="375" y="167" width="50" height="3" rx="1" fill="#3b1a3b" opacity="0.3" />
          <rect x="382" y="174" width="36" height="3" rx="1" fill="#3b1a3b" opacity="0.2" />
          <text x="400" y="186" textAnchor="middle" fill="#6b21a8" fontSize="6" opacity="0.4">LISTENING...</text>
        </>
      )}

      {/* شخص بقناع/هُودي */}
      {/* الهُودي (غطاء الرأس) */}
      <path
        d="M 376 82 Q 400 60 424 82 L 420 115 Q 400 120 380 115 Z"
        fill="#1a0a2e"
        stroke={dangerActive ? "#ef4444" : "#2d1854"}
        strokeWidth="1"
      />
      {/* الوجه (مظلل) */}
      <ellipse cx="400" cy="98" rx="14" ry="16" fill="#0f0a18" />
      {/* العينان (متوهجتان) */}
      <motion.circle cx="394" cy="95" r="2.5" fill={dangerActive ? "#ef4444" : "#6b21a8"}
        animate={dangerActive ? { fill: ["#ef4444", "#ff6b6b", "#ef4444"], r: [2.5, 3, 2.5] } : {}}
        transition={{ duration: 2, repeat: 3, ease: "easeInOut" }}
      />
      <motion.circle cx="406" cy="95" r="2.5" fill={dangerActive ? "#ef4444" : "#6b21a8"}
        animate={dangerActive ? { fill: ["#ef4444", "#ff6b6b", "#ef4444"], r: [2.5, 3, 2.5] } : {}}
        transition={{ duration: 2, repeat: 3, ease: "easeInOut" }}
      />

      {/* الجسم بالهُودي */}
      <path d="M 380 115 L 375 145 L 425 145 L 420 115 Z" fill="#1a0a2e" stroke="#2d1854" strokeWidth="0.5" />
      {/* اليدان */}
      <path d="M 375 130 L 360 155 Q 358 160 362 162" stroke="#2d1854" strokeWidth="2" fill="none" />
      <path d="M 425 130 L 440 155 Q 442 160 438 162" stroke="#2d1854" strokeWidth="2" fill="none" />

      {/* رمز الخطر فوق الرأس */}
      {dangerActive && (
        <motion.g
          animate={{ y: [-2, 2, -2], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: 3, ease: "easeInOut" }}
        >
          <text x="400" y="60" textAnchor="middle" fill="#ef4444" fontSize="18">⚠</text>
        </motion.g>
      )}
      {isIntercepting && !isHTTP && (
        <motion.g animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2.5, repeat: 3, ease: "easeInOut" }}>
          <text x="400" y="60" textAnchor="middle" fill="#22c55e" fontSize="14">🔒</text>
        </motion.g>
      )}

      {/* تسمية */}
      <text x="400" y="245" textAnchor="middle" fill={dangerActive ? "#ef4444" : "#94a3b8"} fontSize="11" fontWeight="600">المهاجم (MITM)</text>
      <text x="400" y="258" textAnchor="middle" fill="#475569" fontSize="8">ATTACKER</text>
    </g>
  );
}

/* ───────── مجسّم الخادم (رف خوادم) ───────── */
function ServerFigure({ phase }: { phase: SimulationPhase }) {
  const isReceiving = phase === "delivering" || phase === "complete";

  return (
    <g>
      {/* رف الخادم - الهيكل */}
      <rect x="660" y="100" width="80" height="130" rx="6" fill="#0f172a"
        stroke={isReceiving ? "#10b981" : "#1e293b"} strokeWidth="1.5" />

      {/* وحدة الخادم 1 */}
      <rect x="668" y="108" width="64" height="22" rx="3" fill="#0c1a2e" stroke="#1e3a5f" strokeWidth="0.5" />
      <circle cx="722" cy="119" r="3" fill={isReceiving ? "#10b981" : "#1e3a5f"} />
      <motion.circle cx="722" cy="119" r="3" fill={isReceiving ? "#10b981" : "#1e3a5f"}
        animate={isReceiving ? { opacity: [0.5, 1, 0.5] } : {}}
        transition={{ duration: 1, repeat: 4, ease: "easeInOut" }}
      />
      <rect x="675" y="114" width="30" height="2" rx="1" fill="#1e3a5f" opacity="0.5" />
      <rect x="675" y="119" width="22" height="2" rx="1" fill="#1e3a5f" opacity="0.3" />
      <rect x="675" y="124" width="26" height="2" rx="1" fill="#1e3a5f" opacity="0.4" />

      {/* وحدة الخادم 2 */}
      <rect x="668" y="135" width="64" height="22" rx="3" fill="#0c1a2e" stroke="#1e3a5f" strokeWidth="0.5" />
      <circle cx="722" cy="146" r="3" fill={isReceiving ? "#10b981" : "#1e3a5f"} />
      <motion.circle cx="722" cy="146" r="3" fill={isReceiving ? "#10b981" : "#1e3a5f"}
        animate={isReceiving ? { opacity: [0.5, 1, 0.5] } : {}}
        transition={{ duration: 1, repeat: 4, ease: "easeInOut", delay: 0.3 }}
      />
      <rect x="675" y="141" width="28" height="2" rx="1" fill="#1e3a5f" opacity="0.4" />
      <rect x="675" y="146" width="20" height="2" rx="1" fill="#1e3a5f" opacity="0.3" />
      <rect x="675" y="151" width="24" height="2" rx="1" fill="#1e3a5f" opacity="0.35" />

      {/* وحدة الخادم 3 */}
      <rect x="668" y="162" width="64" height="22" rx="3" fill="#0c1a2e" stroke="#1e3a5f" strokeWidth="0.5" />
      <circle cx="722" cy="173" r="3" fill={isReceiving ? "#10b981" : "#1e3a5f"} />
      <motion.circle cx="722" cy="173" r="3" fill={isReceiving ? "#10b981" : "#1e3a5f"}
        animate={isReceiving ? { opacity: [0.5, 1, 0.5] } : {}}
        transition={{ duration: 1, repeat: 4, ease: "easeInOut", delay: 0.6 }}
      />
      <rect x="675" y="168" width="25" height="2" rx="1" fill="#1e3a5f" opacity="0.5" />
      <rect x="675" y="173" width="30" height="2" rx="1" fill="#1e3a5f" opacity="0.3" />
      <rect x="675" y="178" width="18" height="2" rx="1" fill="#1e3a5f" opacity="0.4" />

      {/* وحدة الخادم 4 */}
      <rect x="668" y="189" width="64" height="22" rx="3" fill="#0c1a2e" stroke="#1e3a5f" strokeWidth="0.5" />
      <circle cx="722" cy="200" r="3" fill={isReceiving ? "#10b981" : "#1e3a5f"} />
      <rect x="675" y="195" width="24" height="2" rx="1" fill="#1e3a5f" opacity="0.4" />
      <rect x="675" y="200" width="28" height="2" rx="1" fill="#1e3a5f" opacity="0.3" />

      {/* قاعدة الرف */}
      <rect x="655" y="230" width="90" height="5" rx="2" fill="#1e293b" />
      <rect x="665" y="203" width="10" height="27" rx="1" fill="#1e293b" />
      <rect x="725" y="203" width="10" height="27" rx="1" fill="#1e293b" />

      {/* تسمية */}
      <text x="700" y="250" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">الخادم</text>
      <text x="700" y="263" textAnchor="middle" fill="#475569" fontSize="8">WEB SERVER</text>
    </g>
  );
}

/* ───────── خطوط الشبكة + حزم البيانات ───────── */
function NetworkLines({ phase, protocol }: { phase: SimulationPhase; protocol: Protocol }) {
  const isHTTP = protocol === "http";
  const isSending = phase === "sending" || phase === "intercepting";
  const isDelivering = phase === "delivering" || phase === "complete";

  const leftColor = isSending ? (isHTTP ? "#ef4444" : "#22c55e") : "#1e293b";
  const rightColor = isDelivering ? "#10b981" : "#1e293b";

  return (
    <g>
      {/* الخط الأيسر: الضحية → المهاجم */}
      <line x1="150" y1="170" x2="345" y2="170" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="6,4" />
      {isSending && (
        <motion.line x1="150" y1="170" x2="345" y2="170"
          stroke={leftColor} strokeWidth="2" opacity="0.6"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}

      {/* الخط الأيمن: المهاجم → الخادم */}
      <line x1="455" y1="170" x2="660" y2="170" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="6,4" />
      {isDelivering && (
        <motion.line x1="455" y1="170" x2="660" y2="170"
          stroke={rightColor} strokeWidth="2" opacity="0.6"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}

      {/* حزم بيانات متحركة - يسار */}
      {isSending && [0, 1, 2].map((i) => (
        <motion.g key={`pl-${i}`}>
          <motion.rect
            y="164" width="24" height="12" rx="3"
            fill={isHTTP ? "#ef444420" : "#22c55e20"}
            stroke={isHTTP ? "#ef4444" : "#22c55e"}
            strokeWidth="0.5"
            initial={{ x: 150, opacity: 0 }}
            animate={{ x: 340, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.8, delay: i * 0.6, repeat: 4, ease: "easeInOut" }}
          />
          <motion.text
            y="173" fill={isHTTP ? "#ef4444" : "#22c55e"} fontSize="6" textAnchor="middle"
            initial={{ x: 162, opacity: 0 }}
            animate={{ x: 352, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.8, delay: i * 0.6, repeat: 4, ease: "easeInOut" }}
          >
            {isHTTP ? "PKT" : "TLS"}
          </motion.text>
        </motion.g>
      ))}

      {/* حزم بيانات متحركة - يمين */}
      {isDelivering && [0, 1, 2].map((i) => (
        <motion.g key={`pr-${i}`}>
          <motion.rect
            y="164" width="24" height="12" rx="3"
            fill="#10b98120" stroke="#10b981" strokeWidth="0.5"
            initial={{ x: 455, opacity: 0 }}
            animate={{ x: 650, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.8, delay: i * 0.6, repeat: 4, ease: "easeInOut" }}
          />
          <motion.text
            y="173" fill="#10b981" fontSize="6" textAnchor="middle"
            initial={{ x: 467, opacity: 0 }}
            animate={{ x: 662, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.8, delay: i * 0.6, repeat: 4, ease: "easeInOut" }}
          >
            DATA
          </motion.text>
        </motion.g>
      ))}

      {/* بيان نوع الاتصال فوق الخطوط */}
      <AnimatePresence>
        {isSending && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <rect x="210" y="140" width="80" height="18" rx="4"
              fill={isHTTP ? "#7f1d1d" : "#052e16"} stroke={isHTTP ? "#ef4444" : "#22c55e"} strokeWidth="0.5" />
            <text x="250" y="153" textAnchor="middle" fill={isHTTP ? "#fca5a5" : "#86efac"} fontSize="8" fontWeight="600">
              {isHTTP ? "HTTP - نص عادي" : "HTTPS - مشفّر"}
            </text>
          </motion.g>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDelivering && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <rect x="520" y="140" width="70" height="18" rx="4"
              fill="#052e16" stroke="#10b981" strokeWidth="0.5" />
            <text x="555" y="153" textAnchor="middle" fill="#86efac" fontSize="8" fontWeight="600">
              → يتم التسليم
            </text>
          </motion.g>
        )}
      </AnimatePresence>
    </g>
  );
}

/* ───────── المشهد الرئيسي ───────── */
export default function MitmVisualScene({ phase, protocol, interceptedData }: MitmVisualSceneProps) {
  return (
    <div className="w-full rounded-2xl border backdrop-blur-xl bg-gray-900/30 border-gray-700/20 p-4 mb-8 overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-3 h-3 rounded-full bg-red-500/60" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
        <div className="w-3 h-3 rounded-full bg-green-500/60" />
        <span className="text-xs text-gray-600 mr-3 font-mono">network-visualizer.exe</span>
      </div>

      <svg
        viewBox="0 0 800 280"
        className="w-full h-auto"
        style={{ maxHeight: 340 }}
      >
        <defs>
          <radialGradient id="hackerGlow">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* خلفية الشبكة */}
        <pattern id="gridBg" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ffffff" strokeWidth="0.15" opacity="0.1" />
        </pattern>
        <rect width="800" height="280" fill="url(#gridBg)" />

        <NetworkLines phase={phase} protocol={protocol} />
        <VictimFigure phase={phase} />
        <HackerFigure phase={phase} protocol={protocol} />
        <ServerFigure phase={phase} />
      </svg>
    </div>
  );
}
