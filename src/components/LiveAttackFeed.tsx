"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  Radio,
  Wifi,
  AlertTriangle,
  ShieldOff,
  ShieldCheck,
  Eye,
  Binary,
  Skull,
  Lock,
  Zap,
  Database,
  Globe,
  Network,
  Key,
  FileWarning,
  Search,
  Server,
  MonitorSmartphone,
  Bug,
} from "lucide-react";
import type { SimulationPhase, Protocol, LoginData } from "@/types";

interface LiveAttackFeedProps {
  phase: SimulationPhase;
  protocol: Protocol;
  loginData: LoginData | null;
}

/* ─── نوع سجل واحد ─── */
interface FeedEntry {
  id: number;
  time: string;
  icon: React.ReactNode;
  label: string;
  detail: string;
  type: "info" | "network" | "attack" | "capture" | "danger" | "success" | "warning" | "crypto";
  /** تأخير الظهور بالثانية من بداية المحاكاة */
  delay: number;
}

const typeStyles: Record<FeedEntry["type"], { dot: string; text: string; bg: string; border: string }> = {
  info:    { dot: "bg-blue-400",    text: "text-blue-400",    bg: "bg-blue-500/5",    border: "border-blue-500/10" },
  network: { dot: "bg-cyan-400",    text: "text-cyan-400",    bg: "bg-cyan-500/5",    border: "border-cyan-500/10" },
  attack:  { dot: "bg-orange-400",  text: "text-orange-400",  bg: "bg-orange-500/5",  border: "border-orange-500/10" },
  capture: { dot: "bg-red-400",     text: "text-red-400",     bg: "bg-red-500/8",     border: "border-red-500/15" },
  danger:  { dot: "bg-red-500",     text: "text-red-500",     bg: "bg-red-500/10",    border: "border-red-500/20" },
  success: { dot: "bg-emerald-400", text: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/10" },
  warning: { dot: "bg-yellow-400",  text: "text-yellow-400",  bg: "bg-yellow-500/5",  border: "border-yellow-500/10" },
  crypto:  { dot: "bg-green-400",   text: "text-green-400",   bg: "bg-green-500/5",   border: "border-green-500/10" },
};

function getTimestamp(): string {
  return new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

/** بناء السجلات حسب البروتوكول */
function buildFeedEntries(protocol: Protocol, loginData: LoginData | null): FeedEntry[] {
  const isHTTP = protocol === "http";
  const user = loginData?.username ?? "user";
  const pass = loginData?.password ?? "****";
  const victimIP = "192.168.1.105";
  const attackerIP = "192.168.1.77";
  const gatewayIP = "192.168.1.1";
  const serverIP = "93.184.216.34";
  const victimMAC = "AA:BB:CC:11:22:33";
  const attackerMAC = "DE:AD:BE:EF:00:77";
  const gatewayMAC = "00:1A:2B:3C:4D:5E";

  const common: FeedEntry[] = [
    // ═══ المرحلة 1: الإعداد والاستطلاع (0-3s) ═══
    {
      id: 1, delay: 0.0, type: "info",
      icon: <MonitorSmartphone className="w-3.5 h-3.5" />,
      label: "بدء المحاكاة",
      detail: `المستخدم أدخل بيانات تسجيل الدخول وضغط إرسال من ${victimIP}`,
      time: "",
    },
    {
      id: 2, delay: 0.6, type: "attack",
      icon: <Skull className="w-3.5 h-3.5" />,
      label: "تفعيل أدوات الهجوم",
      detail: `المهاجم (${attackerIP}) يُشغّل أداة arpspoof + ettercap على الشبكة المحلية`,
      time: "",
    },
    {
      id: 3, delay: 1.2, type: "network",
      icon: <Search className="w-3.5 h-3.5" />,
      label: "ARP Scan — استطلاع الشبكة",
      detail: `arp-scan --localnet → تم اكتشاف ${victimIP} (${victimMAC}) و Gateway ${gatewayIP} (${gatewayMAC})`,
      time: "",
    },
    {
      id: 4, delay: 2.0, type: "attack",
      icon: <Bug className="w-3.5 h-3.5" />,
      label: "ARP Cache Poisoning — تسميم جدول ARP",
      detail: `إرسال ARP Reply مزيف للضحية: "${gatewayIP} is-at ${attackerMAC}" — الضحية تعتقد أن المهاجم هو الراوتر`,
      time: "",
    },
    {
      id: 5, delay: 2.8, type: "attack",
      icon: <Bug className="w-3.5 h-3.5" />,
      label: "ARP Poisoning — الاتجاه العكسي",
      detail: `إرسال ARP Reply مزيف للراوتر: "${victimIP} is-at ${attackerMAC}" — الراوتر يرسل ردود الضحية للمهاجم`,
      time: "",
    },
    {
      id: 6, delay: 3.4, type: "warning",
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      label: "تم تسميم جدول ARP بنجاح",
      detail: `ARP table: ${victimIP} → ${attackerMAC} | ${gatewayIP} → ${attackerMAC} — كل الحركة تمر عبر المهاجم الآن`,
      time: "",
    },

    // ═══ المرحلة 2: تفعيل التنصت (3.4-5s) ═══
    {
      id: 7, delay: 4.0, type: "network",
      icon: <Wifi className="w-3.5 h-3.5" />,
      label: "IP Forwarding — تمرير الحزم",
      detail: `echo 1 > /proc/sys/net/ipv4/ip_forward — تفعيل تمرير الحزم لكي لا ينقطع اتصال الضحية`,
      time: "",
    },
    {
      id: 8, delay: 4.6, type: "network",
      icon: <Radio className="w-3.5 h-3.5" />,
      label: "Promiscuous Mode — الوضع المختلط",
      detail: `ifconfig eth0 promisc — بطاقة الشبكة تلتقط كل الحزم حتى غير الموجهة للمهاجم`,
      time: "",
    },
    {
      id: 9, delay: 5.2, type: "info",
      icon: <Terminal className="w-3.5 h-3.5" />,
      label: "بدء التقاط الحزم",
      detail: `tcpdump -i eth0 -A -s 0 host ${victimIP} — بدء مراقبة كل حزم الضحية`,
      time: "",
    },

    // ═══ المرحلة 3: اعتراض الاتصال (5-8s) ═══
    {
      id: 10, delay: 5.8, type: "network",
      icon: <Globe className="w-3.5 h-3.5" />,
      label: "TCP SYN — بدء الاتصال",
      detail: `${victimIP}:54321 → ${serverIP}:${isHTTP ? "80" : "443"} [SYN] Seq=0 Win=64240 — الضحية تبدأ اتصال TCP`,
      time: "",
    },
    {
      id: 11, delay: 6.3, type: "network",
      icon: <Network className="w-3.5 h-3.5" />,
      label: "TCP SYN-ACK → 3-Way Handshake",
      detail: `${serverIP}:${isHTTP ? "80" : "443"} → ${victimIP}:54321 [SYN,ACK] — الخادم يرد. المهاجم يرى كل حزمة تمر.`,
      time: "",
    },
    {
      id: 12, delay: 6.8, type: "attack",
      icon: <Eye className="w-3.5 h-3.5" />,
      label: "الحزم تمر عبر المهاجم",
      detail: `كل حزمة: ${victimIP} → [${attackerIP} يقرأ/ينسخ] → ${serverIP} — المهاجم في المنتصف`,
      time: "",
    },
  ];

  // ═══ المرحلة 4: معالجة البيانات حسب البروتوكول ═══
  if (isHTTP) {
    common.push(
      {
        id: 13, delay: 7.5, type: "danger",
        icon: <ShieldOff className="w-3.5 h-3.5" />,
        label: "HTTP — لا يوجد تشفير!",
        detail: `البروتوكول HTTP (المنفذ 80) — البيانات تُرسل كنص عادي بدون أي حماية`,
        time: "",
      },
      {
        id: 14, delay: 8.2, type: "capture",
        icon: <FileWarning className="w-3.5 h-3.5" />,
        label: "التقاط طلب HTTP POST",
        detail: `POST /login HTTP/1.1 | Host: example.com | Content-Type: application/x-www-form-urlencoded`,
        time: "",
      },
      {
        id: 15, delay: 9.0, type: "danger",
        icon: <Key className="w-3.5 h-3.5" />,
        label: "⚠ اسم المستخدم مكشوف!",
        detail: `Form Data → username=${user} — المهاجم يقرأ اسم المستخدم بالكامل`,
        time: "",
      },
      {
        id: 16, delay: 9.8, type: "danger",
        icon: <Key className="w-3.5 h-3.5" />,
        label: "⚠ كلمة المرور مكشوفة!",
        detail: `Form Data → password=${pass} — كلمة المرور ظاهرة كنص عادي!`,
        time: "",
      },
      {
        id: 17, delay: 10.5, type: "capture",
        icon: <Database className="w-3.5 h-3.5" />,
        label: "حفظ البيانات المسروقة",
        detail: `echo "${user}:${pass}" >> /tmp/captured_creds.txt — المهاجم يحفظ البيانات`,
        time: "",
      },
      {
        id: 18, delay: 11.2, type: "capture",
        icon: <Eye className="w-3.5 h-3.5" />,
        label: "التقاط Cookie الجلسة",
        detail: `Cookie: session_id=abc123xyz; auth_token=eyJhbGciOi... — يمكنه انتحال هوية المستخدم`,
        time: "",
      },
      {
        id: 19, delay: 12.0, type: "warning",
        icon: <AlertTriangle className="w-3.5 h-3.5" />,
        label: "إمكانية حقن المحتوى",
        detail: `المهاجم يمكنه تعديل Response وحقن <script> خبيث قبل إعادة توجيه الحزمة للضحية`,
        time: "",
      },

      // ═══ المرحلة 5: توصيل للخادم ═══
      {
        id: 20, delay: 13.0, type: "network",
        icon: <Server className="w-3.5 h-3.5" />,
        label: "تمرير الطلب للخادم",
        detail: `Forward: ${attackerIP} → ${serverIP}:80 — المهاجم يُمرر الطلب الأصلي (أو المعدّل) للخادم`,
        time: "",
      },
      {
        id: 21, delay: 13.8, type: "success",
        icon: <Server className="w-3.5 h-3.5" />,
        label: "الخادم يستجيب",
        detail: `HTTP/1.1 200 OK | Set-Cookie: session=s3cur3T0k3n — الخادم لا يعلم بوجود المهاجم`,
        time: "",
      },
      {
        id: 22, delay: 14.5, type: "capture",
        icon: <Database className="w-3.5 h-3.5" />,
        label: "التقاط Session Token الجديد",
        detail: `المهاجم ينسخ الـ Session Token أيضاً — يمكنه الآن تسجيل الدخول كالضحية مباشرة!`,
        time: "",
      },

      // ═══ المرحلة 6: النتيجة ═══
      {
        id: 23, delay: 15.5, type: "danger",
        icon: <Skull className="w-3.5 h-3.5" />,
        label: "الهجوم مكتمل",
        detail: `تم جمع: اسم المستخدم + كلمة المرور + Session Cookie + Auth Token — اختراق كامل!`,
        time: "",
      },
      {
        id: 24, delay: 16.5, type: "danger",
        icon: <AlertTriangle className="w-3.5 h-3.5" />,
        label: "نتيجة الهجوم",
        detail: `المهاجم يملك الآن وصولاً كاملاً لحساب الضحية. يمكنه تغيير كلمة المرور، سرقة البيانات، أو انتحال الهوية.`,
        time: "",
      },
    );
  } else {
    // HTTPS
    common.push(
      {
        id: 13, delay: 7.5, type: "crypto",
        icon: <Lock className="w-3.5 h-3.5" />,
        label: "TLS ClientHello — بدء التشفير",
        detail: `${victimIP} → ${serverIP} | TLS 1.3 | Supported Ciphers: TLS_AES_256_GCM_SHA384, TLS_CHACHA20_POLY1305`,
        time: "",
      },
      {
        id: 14, delay: 8.2, type: "crypto",
        icon: <Lock className="w-3.5 h-3.5" />,
        label: "TLS ServerHello + Certificate",
        detail: `الخادم يرسل شهادة SSL: CN=example.com | Issuer=Let's Encrypt | Valid ✓ — المتصفح يتحقق`,
        time: "",
      },
      {
        id: 15, delay: 8.9, type: "crypto",
        icon: <Lock className="w-3.5 h-3.5" />,
        label: "Key Exchange — تبادل المفاتيح",
        detail: `ECDHE (Elliptic Curve Diffie-Hellman) → مفتاح مشترك فريد لهذه الجلسة فقط`,
        time: "",
      },
      {
        id: 16, delay: 9.5, type: "success",
        icon: <ShieldCheck className="w-3.5 h-3.5" />,
        label: "TLS Handshake اكتمل ✓",
        detail: `Cipher: AES_256_GCM_SHA384 | نفق مشفر بين المتصفح والخادم — لا أحد يقرأ المحتوى`,
        time: "",
      },
      {
        id: 17, delay: 10.3, type: "network",
        icon: <Binary className="w-3.5 h-3.5" />,
        label: "الحزمة المشفرة تمر عبر المهاجم",
        detail: `Application Data: 17 03 03 00 45 a2 f8 c1 9b 3e 7d 4a 1c ... — بيانات عشوائية لا معنى لها`,
        time: "",
      },
      {
        id: 18, delay: 11.0, type: "warning",
        icon: <Eye className="w-3.5 h-3.5" />,
        label: "المهاجم يحاول فك التشفير...",
        detail: `محاولة Brute Force على مفتاح AES-256 → يحتاج 2^256 محاولة = مستحيل عملياً (مليارات السنين)`,
        time: "",
      },
      {
        id: 19, delay: 11.8, type: "warning",
        icon: <AlertTriangle className="w-3.5 h-3.5" />,
        label: "محاولة SSL Stripping",
        detail: `المهاجم يحاول تحويل HTTPS إلى HTTP → HSTS Header يمنع ذلك — المتصفح يرفض HTTP`,
        time: "",
      },
      {
        id: 20, delay: 12.5, type: "crypto",
        icon: <ShieldCheck className="w-3.5 h-3.5" />,
        label: "HMAC — التحقق من سلامة البيانات",
        detail: `كل حزمة تحتوي MAC (Message Authentication Code) — أي تعديل يكتشفه المتصفح فوراً`,
        time: "",
      },

      // ═══ التوصيل ═══
      {
        id: 21, delay: 13.5, type: "network",
        icon: <Server className="w-3.5 h-3.5" />,
        label: "البيانات تصل الخادم سليمة",
        detail: `الخادم يفك التشفير بالمفتاح الخاص ← يقرأ الطلب ← يتحقق من بيانات الدخول`,
        time: "",
      },
      {
        id: 22, delay: 14.3, type: "success",
        icon: <Server className="w-3.5 h-3.5" />,
        label: "استجابة مشفرة",
        detail: `HTTP/2 200 | Set-Cookie: session=...; Secure; HttpOnly; SameSite=Strict — محمية بالكامل`,
        time: "",
      },

      // ═══ النتيجة ═══
      {
        id: 23, delay: 15.5, type: "success",
        icon: <ShieldCheck className="w-3.5 h-3.5" />,
        label: "الهجوم فشل تماماً",
        detail: `المهاجم رأى حزم مشفرة فقط. لم يحصل على أي بيانات: لا اسم مستخدم، لا كلمة مرور، لا Cookie.`,
        time: "",
      },
      {
        id: 24, delay: 16.5, type: "success",
        icon: <Lock className="w-3.5 h-3.5" />,
        label: "سبب الفشل",
        detail: `TLS 1.3 + HSTS + Certificate Pinning = حماية ثلاثية. HTTPS يجعل هجوم MITM بلا فائدة.`,
        time: "",
      },
    );
  }

  return common;
}

/* ─── المُكوّن الرئيسي ─── */
export default function LiveAttackFeed({ phase, protocol, loginData }: LiveAttackFeedProps) {
  const [visibleEntries, setVisibleEntries] = useState<FeedEntry[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const entriesRef = useRef<FeedEntry[]>([]);

  const isActive = phase !== "idle";

  // بناء السجلات عند بدء المحاكاة
  useEffect(() => {
    if (phase === "sending" && startTime === null) {
      const entries = buildFeedEntries(protocol, loginData);
      entriesRef.current = entries;
      setStartTime(Date.now());
      setVisibleEntries([]);
    }
    if (phase === "idle") {
      setStartTime(null);
      setVisibleEntries([]);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [phase, protocol, loginData, startTime]);

  // إظهار السجلات تدريجياً حسب التأخير
  useEffect(() => {
    if (startTime === null) return;

    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const entries = entriesRef.current;
      const toShow = entries.filter((e) => e.delay <= elapsed);

      if (toShow.length > visibleEntries.length) {
        setVisibleEntries(
          toShow.map((e) => ({ ...e, time: getTimestamp() }))
        );
      }

      if (toShow.length >= entries.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startTime, visibleEntries.length]);

  // التمرير التلقائي
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleEntries]);

  if (!isActive && visibleEntries.length === 0) return null;

  const isHTTP = protocol === "http";

  return (
    <AnimatePresence>
      {(isActive || visibleEntries.length > 0) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className={`rounded-2xl border backdrop-blur-xl overflow-hidden ${
            isHTTP
              ? "bg-gray-950/80 border-red-500/20"
              : "bg-gray-950/80 border-emerald-500/20"
          }`}>
            {/* ═══ شريط العنوان ═══ */}
            <div className={`flex items-center gap-3 px-4 py-3 border-b ${
              isHTTP ? "bg-red-950/30 border-red-500/10" : "bg-emerald-950/20 border-emerald-500/10"
            }`}>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>

              <div className="flex items-center gap-2">
                <Terminal className={`w-4 h-4 ${isHTTP ? "text-red-400" : "text-emerald-400"}`} />
                <span className="text-xs font-mono text-gray-400">
                  mitm-attack-monitor — البث المباشر
                </span>
              </div>

              {/* مؤشر بث مباشر */}
              <div className="mr-auto flex items-center gap-2">
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="flex items-center gap-1.5"
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isHTTP ? "bg-red-400" : "bg-emerald-400"
                    }`} />
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                      isHTTP ? "bg-red-500" : "bg-emerald-500"
                    }`} />
                  </span>
                  <span className={`text-[10px] font-bold ${isHTTP ? "text-red-400" : "text-emerald-400"}`}>
                    LIVE
                  </span>
                </motion.div>

                <span className="text-[10px] text-gray-600 font-mono">
                  {visibleEntries.length}/{entriesRef.current.length} خطوة
                </span>
              </div>
            </div>

            {/* ═══ شريط التقدم ═══ */}
            <div className="w-full h-1 bg-gray-900">
              <motion.div
                className={`h-full ${isHTTP ? "bg-red-500" : "bg-emerald-500"}`}
                animate={{
                  width: `${(visibleEntries.length / Math.max(entriesRef.current.length, 1)) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* ═══ السجلات ═══ */}
            <div
              ref={scrollRef}
              className="max-h-[420px] overflow-y-auto scrollbar-thin p-3 space-y-1"
            >
              <AnimatePresence initial={false}>
                {visibleEntries.map((entry) => {
                  const style = typeStyles[entry.type];
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: "auto" }}
                      transition={{ duration: 0.3 }}
                      className={`flex items-start gap-3 rounded-lg px-3 py-2.5 border ${style.bg} ${style.border}`}
                    >
                      {/* الوقت */}
                      <span className="text-[10px] text-gray-600 font-mono shrink-0 mt-0.5 w-16 text-left" dir="ltr">
                        {entry.time}
                      </span>

                      {/* الأيقونة */}
                      <div className={`mt-0.5 shrink-0 ${style.text}`}>
                        {entry.icon}
                      </div>

                      {/* المحتوى */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold ${style.text}`}>
                          {entry.label}
                        </p>
                        <p className="text-[11px] text-gray-400 leading-relaxed mt-0.5 break-words" dir="ltr">
                          {entry.detail}
                        </p>
                      </div>

                      {/* مؤشر نوع */}
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${style.dot}`} />
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* مؤشر "جاري التحميل" */}
              {visibleEntries.length < entriesRef.current.length && visibleEntries.length > 0 && (
                <motion.div
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 text-xs"
                >
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.5, delay: i * 0.12, repeat: Infinity }}
                        className={`w-1.5 h-1.5 rounded-full ${isHTTP ? "bg-red-500" : "bg-emerald-500"}`}
                      />
                    ))}
                  </div>
                  <span>جاري تحليل الشبكة...</span>
                </motion.div>
              )}
            </div>

            {/* ═══ الشريط السفلي ═══ */}
            <div className={`flex items-center justify-between px-4 py-2 border-t text-[10px] font-mono ${
              isHTTP ? "border-red-500/10 text-gray-600" : "border-emerald-500/10 text-gray-600"
            }`}>
              <span>Protocol: {isHTTP ? "HTTP/1.1 (Insecure)" : "TLS 1.3 (Secure)"}</span>
              <span>Interface: eth0 (Promiscuous)</span>
              <span className={isHTTP ? "text-red-500" : "text-emerald-500"}>
                {isHTTP ? "⚠ VULNERABLE" : "🔒 ENCRYPTED"}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
