"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Fish,
  User,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  Info,
  Mail,
  Globe,
  Terminal,
  Wifi,
  Server,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  Shield,
  Clock,
  MapPin,
  Fingerprint,
} from "lucide-react";
import PageShell from "@/components/PageShell";

/* ─── أنواع ─── */
type PhishingPhase =
  | "email"        // بريد التصيد
  | "browser"      // المتصفح المزيف
  | "submitting"   // جاري الإرسال
  | "capturing"    // التقاط البيانات
  | "exfiltrating" // نقل البيانات للمهاجم
  | "dashboard"    // لوحة المهاجم
  | "analysis"     // التحليل الفني
  | "warning";     // التحذير التعليمي

interface CapturedData {
  username: string;
  password: string;
  ip: string;
  userAgent: string;
  timestamp: string;
  cookies: string[];
  headers: Record<string, string>;
  fingerprint: string;
  location: string;
  sessionToken: string;
}

/* ─── مساعدات ─── */
const randomHex = (len: number) =>
  Array.from({ length: len }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0")).join("");

const randomIP = () =>
  `${Math.floor(Math.random() * 200) + 10}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

/* ─── مكوّن سطر تيرمنال متحرك ─── */
function TerminalLine({ text, delay, color = "text-green-400" }: { text: string; delay: number; color?: string }) {
  const [visible, setVisible] = useState(false);
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t1);
  }, [delay]);

  useEffect(() => {
    if (!visible) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, 18);
    return () => clearInterval(interval);
  }, [visible, text]);

  if (!visible) return null;
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`font-mono text-xs ${color}`}
    >
      <span className="text-gray-600 select-none">$ </span>
      {displayed}
      {displayed.length < text.length && (
        <span className="animate-pulse">▊</span>
      )}
    </motion.div>
  );
}

/* ─── مكوّن حزمة شبكة متحركة ─── */
function NetworkPacket({ from, to, label, delay, color }: { from: string; to: string; label: string; delay: number; color: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  if (!visible) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 text-xs font-mono py-1"
    >
      <span className="text-cyan-400 min-w-[100px] text-left" dir="ltr">{from}</span>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: 0.6 }}
        className="flex-1 relative h-px"
      >
        <div className={`absolute inset-0 ${color}`} />
        <motion.div
          initial={{ left: "0%" }}
          animate={{ left: "100%" }}
          transition={{ duration: 0.6 }}
          className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${color.replace("bg-", "bg-")}`}
          style={{ filter: "blur(1px)" }}
        />
      </motion.div>
      <span className="text-purple-400 min-w-[100px] text-right" dir="ltr">{to}</span>
      <span className={`text-[10px] px-1.5 py-0.5 rounded ${color.replace("bg-", "bg-").replace("/50", "/20")} ${color.replace("bg-", "text-").replace("/50", "")}`}>
        {label}
      </span>
    </motion.div>
  );
}

/* ─── الصفحة الرئيسية ─── */
export default function PhishingPage() {
  const [phase, setPhase] = useState<PhishingPhase>("email");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captured, setCaptured] = useState<CapturedData | null>(null);
  const [progress, setProgress] = useState(0);
  const [dashboardRevealed, setDashboardRevealed] = useState(0);

  const victimIP = useState(() => randomIP())[0];
  const attackerIP = useState(() => randomIP())[0];
  const serverIP = useState(() => randomIP())[0];

  const buildCapturedData = useCallback(
    (user: string, pass: string): CapturedData => ({
      username: user,
      password: pass,
      ip: victimIP,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      timestamp: new Date().toISOString(),
      cookies: [
        `_ga=GA1.2.${Math.floor(Math.random() * 999999999)}`,
        `_fbp=fb.1.${Date.now()}.${Math.floor(Math.random() * 999999999)}`,
        `session_pref=lang%3Dar`,
      ],
      headers: {
        "Host": "bankk-login.fake-site.xyz",
        "Content-Type": "application/x-www-form-urlencoded",
        "Origin": "http://bankk-login.fake-site.xyz",
        "Referer": "http://bankk-login.fake-site.xyz/login",
        "Accept-Language": "ar,en-US;q=0.9",
        "Accept-Encoding": "gzip, deflate",
        "Connection": "keep-alive",
        "Cache-Control": "no-cache",
      },
      fingerprint: randomHex(16).toUpperCase(),
      location: "الرياض، المملكة العربية السعودية",
      sessionToken: randomHex(32),
    }),
    [victimIP],
  );

  /* بدء الإرسال المزيف */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    const data = buildCapturedData(username.trim(), password.trim());
    setCaptured(data);
    setPhase("submitting");

    // submitting → capturing → exfiltrating → dashboard
    setTimeout(() => setPhase("capturing"), 1800);
    setTimeout(() => setPhase("exfiltrating"), 4200);
    setTimeout(() => setPhase("dashboard"), 7000);
  };

  /* شريط تقدم المحاكاة الزائف */
  useEffect(() => {
    if (phase !== "submitting") return;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 2;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [phase]);

  /* كشف تدريجي للوحة المهاجم */
  useEffect(() => {
    if (phase !== "dashboard") return;
    setDashboardRevealed(0);
    const interval = setInterval(() => {
      setDashboardRevealed((d) => {
        if (d >= 6) { clearInterval(interval); return 6; }
        return d + 1;
      });
    }, 600);
    return () => clearInterval(interval);
  }, [phase]);

  const reset = () => {
    setPhase("email");
    setUsername("");
    setPassword("");
    setCaptured(null);
    setProgress(0);
    setDashboardRevealed(0);
  };

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* العنوان */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Fish className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl font-bold shimmer-text">محاكاة هجوم التصيد الاحتيالي</h1>
          </div>
          <p className="text-gray-500">تجربة واقعية لكيفية عمل التصيد الاحتيالي من البريد حتى سرقة البيانات</p>
        </motion.div>

        {/* شريط المراحل */}
        <div className="flex items-center justify-center gap-1 mb-8 flex-wrap">
          {(["email", "browser", "submitting", "capturing", "exfiltrating", "dashboard", "analysis", "warning"] as PhishingPhase[]).map((p, i) => {
            const labels: Record<PhishingPhase, string> = {
              email: "البريد",
              browser: "المتصفح",
              submitting: "الإرسال",
              capturing: "الالتقاط",
              exfiltrating: "النقل",
              dashboard: "المهاجم",
              analysis: "التحليل",
              warning: "التعليم",
            };
            const icons: Record<PhishingPhase, React.ReactNode> = {
              email: <Mail className="w-3.5 h-3.5" />,
              browser: <Globe className="w-3.5 h-3.5" />,
              submitting: <Wifi className="w-3.5 h-3.5" />,
              capturing: <Terminal className="w-3.5 h-3.5" />,
              exfiltrating: <Server className="w-3.5 h-3.5" />,
              dashboard: <ShieldAlert className="w-3.5 h-3.5" />,
              analysis: <Info className="w-3.5 h-3.5" />,
              warning: <Shield className="w-3.5 h-3.5" />,
            };
            const allPhases: PhishingPhase[] = ["email", "browser", "submitting", "capturing", "exfiltrating", "dashboard", "analysis", "warning"];
            const ci = allPhases.indexOf(phase);
            const isActive = i === ci;
            const isDone = i < ci;
            return (
              <div key={p} className="flex items-center gap-1">
                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${isActive ? "bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/40" : isDone ? "bg-green-500/10 text-green-500" : "bg-gray-800/40 text-gray-600"}`}>
                  {isDone ? <CheckCircle className="w-3.5 h-3.5" /> : icons[p]}
                  <span className="hidden sm:inline">{labels[p]}</span>
                </div>
                {i < 7 && <span className={`text-xs ${isDone ? "text-green-600" : "text-gray-700"}`}>›</span>}
              </div>
            );
          })}
        </div>

        {/* المحتوى */}
        <AnimatePresence mode="wait">
          {/* ───── مرحلة البريد ───── */}
          {phase === "email" && (
            <motion.div key="email" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto">
              <div className="rounded-2xl border border-gray-700/50 bg-gray-900/60 backdrop-blur-xl overflow-hidden">
                {/* شريط البريد */}
                <div className="bg-gray-800/80 px-5 py-3 border-b border-gray-700/50 flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-medium text-white">صندوق الوارد</span>
                  <span className="mr-auto px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full font-bold">1 جديد</span>
                </div>

                {/* البريد الإلكتروني */}
                <div className="p-6">
                  <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="border border-yellow-500/20 bg-yellow-950/10 rounded-xl p-5 cursor-pointer hover:bg-yellow-950/20 transition-colors"
                    onClick={() => setPhase("browser")}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">B</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white text-sm">البنك الوطني</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">⚠ مشبوه</span>
                        </div>
                        <p className="text-xs text-gray-500 font-mono" dir="ltr">noreply@nationa1-bank.xyz</p>
                      </div>
                      <span className="text-xs text-gray-600">منذ 5 دقائق</span>
                    </div>

                    <h3 className="font-bold text-yellow-300 mb-2">⚠ تنبيه أمني: تم اكتشاف نشاط غير عادي</h3>
                    <p className="text-sm text-gray-400 leading-relaxed mb-4">
                      عزيزي العميل، رصدنا محاولات دخول مشبوهة على حسابك. لحماية حسابك، يرجى تسجيل الدخول فوراً لتأكيد هويتك وتغيير كلمة المرور.
                    </p>

                    <div className="flex items-center justify-between">
                      <motion.div
                        animate={{ scale: [1, 1.03, 1] }}
                        transition={{ duration: 2, repeat: 3 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg"
                      >
                        <ExternalLink className="w-4 h-4" />
                        تأكيد الهوية الآن
                      </motion.div>
                      <span className="text-[10px] text-gray-600 font-mono" dir="ltr">bankk-login.fake-site.xyz</span>
                    </div>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-center text-xs text-gray-600 mt-4"
                  >
                    اضغط على البريد الإلكتروني لمحاكاة الضغط على رابط التصيد
                  </motion.p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ───── مرحلة المتصفح (النموذج المزيف) ───── */}
          {phase === "browser" && (
            <motion.div key="browser" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="max-w-lg mx-auto">
              {/* نافذة المتصفح */}
              <div className="rounded-2xl overflow-hidden border border-gray-700/50 shadow-2xl shadow-red-500/5">
                {/* شريط المتصفح */}
                <div className="bg-gray-800 px-4 py-2.5 flex items-center gap-3 border-b border-gray-700">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <button onClick={() => setPhase("email")} className="text-gray-500 hover:text-gray-300 cursor-pointer">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="flex-1 bg-gray-900 rounded-lg px-3 py-1.5 text-xs text-gray-400 font-mono flex items-center gap-2" dir="ltr">
                    <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                    <span className="truncate">http://bankk-login.fake-site.xyz/login</span>
                  </div>
                </div>

                {/* محتوى الصفحة */}
                <div className="bg-gray-900/90 p-8">
                  <div className="text-center mb-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3"
                    >
                      <Lock className="w-8 h-8 text-blue-400" />
                    </motion.div>
                    <h2 className="text-xl font-bold text-white">تسجيل الدخول</h2>
                    <p className="text-sm text-gray-500 mt-1">ادخل بيانات حسابك البنكي</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">اسم المستخدم</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="أدخل اسم المستخدم"
                          className="w-full px-4 py-3 pr-10 rounded-xl bg-gray-800/60 border border-gray-600/50 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          autoComplete="off"
                        />
                        <User className="absolute top-3.5 right-3 w-4 h-4 text-gray-600" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">كلمة المرور</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="أدخل كلمة المرور"
                          className="w-full px-4 py-3 pr-10 pl-10 rounded-xl bg-gray-800/60 border border-gray-600/50 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          autoComplete="off"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute top-3.5 left-3 text-gray-600 hover:text-gray-400 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={!username.trim() || !password.trim()}
                      className="w-full py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      تسجيل الدخول
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}

          {/* ───── مرحلة الإرسال ───── */}
          {phase === "submitting" && (
            <motion.div key="submitting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-lg mx-auto text-center">
              <div className="rounded-2xl border border-gray-700/50 bg-gray-900/60 backdrop-blur-xl p-10">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: 2, ease: "linear" }}
                  className="w-16 h-16 mx-auto mb-6 rounded-full border-4 border-gray-700 border-t-blue-500"
                />
                <h3 className="text-lg font-bold text-white mb-2">جاري تسجيل الدخول...</h3>
                <p className="text-sm text-gray-500 mb-6">يرجى الانتظار بينما نتحقق من بياناتك</p>

                {/* شريط التقدم */}
                <div className="w-full bg-gray-800 rounded-full h-2 mb-3 overflow-hidden">
                  <motion.div
                    className="h-full bg-linear-to-l from-blue-500 to-cyan-400 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 font-mono">{progress}%</p>

                {/* ما يحدث فعلاً */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-6 rounded-xl bg-red-950/20 border border-red-500/20 p-4"
                >
                  <p className="text-xs text-red-400 font-bold mb-2">⚠ ما يحدث فعلاً خلف الكواليس:</p>
                  <p className="text-xs text-gray-500">بياناتك تُرسل إلى خادم المهاجم بدلاً من البنك الحقيقي...</p>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ───── مرحلة الالتقاط ───── */}
          {phase === "capturing" && captured && (
            <motion.div key="capturing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto">
              <div className="rounded-2xl border border-red-500/30 bg-gray-950/80 backdrop-blur-xl overflow-hidden">
                {/* عنوان التيرمنال */}
                <div className="bg-gray-900 px-4 py-2.5 border-b border-gray-800 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-mono text-red-400">credential-harvester.py — التقاط البيانات</span>
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: 4 }}
                    className="mr-auto text-xs text-red-500"
                  >● REC</motion.span>
                </div>

                <div className="p-5 space-y-1.5 max-h-[400px] overflow-y-auto">
                  <TerminalLine delay={0} text="[*] Phishing server listening on 0.0.0.0:80" color="text-yellow-400" />
                  <TerminalLine delay={400} text={`[+] Incoming connection from ${captured.ip}`} color="text-green-400" />
                  <TerminalLine delay={800} text="[+] POST /login HTTP/1.1 — Form data received" color="text-green-400" />
                  <TerminalLine delay={1200} text={`[!] Username captured: ${captured.username}`} color="text-red-400" />
                  <TerminalLine delay={1600} text={`[!] Password captured: ${captured.password}`} color="text-red-400" />
                  <TerminalLine delay={2000} text={`[+] User-Agent: ${captured.userAgent}`} color="text-gray-400" />
                  <TerminalLine delay={2400} text={`[+] Cookies: ${captured.cookies.length} cookies captured`} color="text-cyan-400" />
                  <TerminalLine delay={2800} text={`[+] Session token: ${captured.sessionToken.slice(0, 24)}...`} color="text-cyan-400" />
                  <TerminalLine delay={3200} text={`[+] Browser fingerprint: ${captured.fingerprint}`} color="text-purple-400" />
                  <TerminalLine delay={3600} text="[*] Redirecting victim to real bank website..." color="text-yellow-400" />
                  <TerminalLine delay={3900} text="[✓] Credentials saved to /var/log/phished_creds.db" color="text-green-300" />
                </div>
              </div>
            </motion.div>
          )}

          {/* ───── مرحلة النقل ───── */}
          {phase === "exfiltrating" && captured && (
            <motion.div key="exfiltrating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto">
              <div className="rounded-2xl border border-purple-500/30 bg-gray-950/80 backdrop-blur-xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Wifi className="w-5 h-5 text-purple-400" />
                  <h3 className="font-bold text-purple-400">تتبع حركة الشبكة</h3>
                </div>

                <div className="space-y-2 mb-6">
                  <NetworkPacket from={captured.ip} to="DNS" label="DNS Query" delay={0} color="bg-cyan-500/50" />
                  <NetworkPacket from="DNS" to={attackerIP} label="A Record" delay={400} color="bg-cyan-500/50" />
                  <NetworkPacket from={captured.ip} to={attackerIP} label="TCP SYN" delay={800} color="bg-yellow-500/50" />
                  <NetworkPacket from={attackerIP} to={captured.ip} label="SYN-ACK" delay={1100} color="bg-yellow-500/50" />
                  <NetworkPacket from={captured.ip} to={attackerIP} label="POST /login" delay={1500} color="bg-red-500/50" />
                  <NetworkPacket from={attackerIP} to={serverIP} label="Forwarding" delay={2000} color="bg-purple-500/50" />
                  <NetworkPacket from={serverIP} to={attackerIP} label="200 OK" delay={2400} color="bg-green-500/50" />
                  <NetworkPacket from={attackerIP} to={captured.ip} label="302 Redirect" delay={2800} color="bg-green-500/50" />
                </div>

                {/* ملخص */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.5 }}
                  className="grid grid-cols-3 gap-3 text-center"
                >
                  <div className="rounded-xl bg-red-950/30 border border-red-500/20 p-3">
                    <p className="text-2xl font-bold text-red-400">8</p>
                    <p className="text-xs text-gray-500">حزم ملتقطة</p>
                  </div>
                  <div className="rounded-xl bg-yellow-950/30 border border-yellow-500/20 p-3">
                    <p className="text-2xl font-bold text-yellow-400">342B</p>
                    <p className="text-xs text-gray-500">بيانات مسروقة</p>
                  </div>
                  <div className="rounded-xl bg-purple-950/30 border border-purple-500/20 p-3">
                    <p className="text-2xl font-bold text-purple-400">23ms</p>
                    <p className="text-xs text-gray-500">زمن الاستجابة</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ───── لوحة المهاجم ───── */}
          {phase === "dashboard" && captured && (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto">
              <div className="rounded-2xl border border-red-500/30 bg-gray-950/80 backdrop-blur-xl overflow-hidden">
                {/* عنوان */}
                <div className="bg-red-950/30 px-5 py-3 border-b border-red-500/20 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                  <span className="font-bold text-red-400">لوحة تحكم المهاجم — البيانات المسروقة</span>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* بيانات الاعتماد */}
                  {dashboardRevealed >= 1 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-gray-900/80 border border-gray-700/50 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <User className="w-4 h-4 text-red-400" />
                        <span className="text-sm font-bold text-red-400">بيانات الاعتماد</span>
                      </div>
                      <div className="space-y-2 font-mono text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">المستخدم:</span>
                          <span className="text-red-300">{captured.username}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">كلمة المرور:</span>
                          <span className="text-red-300">{captured.password}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* معلومات الجهاز */}
                  {dashboardRevealed >= 2 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-gray-900/80 border border-gray-700/50 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Fingerprint className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-bold text-purple-400">بصمة الجهاز</span>
                      </div>
                      <div className="space-y-2 font-mono text-xs">
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-500">IP:</span>
                          <span className="text-purple-300" dir="ltr">{captured.ip}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-500">البصمة:</span>
                          <span className="text-purple-300" dir="ltr">{captured.fingerprint}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* الموقع */}
                  {dashboardRevealed >= 3 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-gray-900/80 border border-gray-700/50 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-bold text-yellow-400">الموقع والوقت</span>
                      </div>
                      <div className="space-y-2 font-mono text-xs">
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-500">الموقع:</span>
                          <span className="text-yellow-300">{captured.location}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-500">الوقت:</span>
                          <span className="text-yellow-300" dir="ltr">{new Date(captured.timestamp).toLocaleString("ar-SA")}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* الكوكيز */}
                  {dashboardRevealed >= 4 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-gray-900/80 border border-gray-700/50 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Lock className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm font-bold text-cyan-400">الكوكيز الملتقطة</span>
                      </div>
                      <div className="space-y-1.5">
                        {captured.cookies.map((c, i) => (
                          <div key={i} className="text-[11px] font-mono text-cyan-300/80 bg-gray-800/60 px-2 py-1 rounded" dir="ltr">{c}</div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* الهيدرز */}
                  {dashboardRevealed >= 5 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-gray-900/80 border border-gray-700/50 p-4 md:col-span-2">
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-4 h-4 text-orange-400" />
                        <span className="text-sm font-bold text-orange-400">HTTP Headers</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {Object.entries(captured.headers).map(([k, v]) => (
                          <div key={k} className="text-[11px] font-mono bg-gray-800/60 px-2 py-1 rounded" dir="ltr">
                            <span className="text-orange-300">{k}:</span> <span className="text-gray-400">{v}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* أزرار التنقل */}
                  {dashboardRevealed >= 6 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="md:col-span-2 flex gap-3 justify-center mt-2">
                      <button
                        onClick={() => setPhase("analysis")}
                        className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold cursor-pointer transition-colors flex items-center gap-2"
                      >
                        <Info className="w-4 h-4" />
                        التحليل الفني
                      </button>
                      <button
                        onClick={() => setPhase("warning")}
                        className="px-5 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-white text-sm font-bold cursor-pointer transition-colors flex items-center gap-2"
                      >
                        <Shield className="w-4 h-4" />
                        الدرس التعليمي
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ───── مرحلة التحليل الفني ───── */}
          {phase === "analysis" && captured && (
            <motion.div key="analysis" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto space-y-6">
              {/* URL Comparison */}
              <div className="rounded-2xl border border-cyan-500/30 bg-gray-950/80 backdrop-blur-xl p-6">
                <h3 className="font-bold text-cyan-400 mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5" /> مقارنة عنوان URL
                </h3>
                <div className="space-y-3">
                  <div className="rounded-xl bg-red-950/20 border border-red-500/20 p-3">
                    <span className="text-xs text-red-400 font-bold block mb-1">الموقع المزيف:</span>
                    <p className="font-mono text-sm" dir="ltr">
                      <span className="text-gray-500">http://</span>
                      <span className="text-red-400 font-bold underline decoration-wavy">bankk</span>
                      <span className="text-gray-500">-login.</span>
                      <span className="text-red-400 font-bold underline decoration-wavy">fake-site.xyz</span>
                      <span className="text-gray-500">/login</span>
                    </p>
                  </div>
                  <div className="rounded-xl bg-green-950/20 border border-green-500/20 p-3">
                    <span className="text-xs text-green-400 font-bold block mb-1">الموقع الحقيقي:</span>
                    <p className="font-mono text-sm" dir="ltr">
                      <span className="text-green-400">https://</span>
                      <span className="text-green-300">bank</span>
                      <span className="text-gray-500">-login.</span>
                      <span className="text-green-300">national-bank.com</span>
                      <span className="text-gray-500">/login</span>
                    </p>
                  </div>
                  <div className="bg-gray-800/40 rounded-xl p-3 space-y-1.5">
                    <p className="text-xs text-yellow-400 font-bold">🔍 الفروقات المكتشفة:</p>
                    {[
                      "النطاق مختلف: fake-site.xyz بدلاً من national-bank.com",
                      "خطأ إملائي: bankk بدلاً من bank (حرف k مكرر)",
                      "بدون HTTPS: الاتصال غير مشفّر (HTTP فقط)",
                      "لا يوجد شهادة SSL صالحة",
                    ].map((d, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 mt-0.5 shrink-0" />
                        <span className="text-gray-400">{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* تحليل الطلب */}
              <div className="rounded-2xl border border-orange-500/30 bg-gray-950/80 backdrop-blur-xl p-6">
                <h3 className="font-bold text-orange-400 mb-4 flex items-center gap-2">
                  <Terminal className="w-5 h-5" /> تحليل طلب HTTP
                </h3>
                <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs leading-relaxed space-y-0.5" dir="ltr">
                  <p className="text-yellow-400">POST /login HTTP/1.1</p>
                  <p className="text-gray-500">Host: bankk-login.fake-site.xyz</p>
                  <p className="text-gray-500">Content-Type: application/x-www-form-urlencoded</p>
                  <p className="text-gray-500">Origin: http://bankk-login.fake-site.xyz</p>
                  <p className="text-gray-500">User-Agent: {captured.userAgent}</p>
                  <p className="text-gray-500">Cookie: {captured.cookies[0]}</p>
                  <p className="text-gray-600 mt-2">─── Body ───</p>
                  <p>
                    <span className="text-gray-500">username=</span>
                    <span className="text-red-400">{captured.username}</span>
                    <span className="text-gray-500">&amp;password=</span>
                    <span className="text-red-400">{captured.password}</span>
                  </p>
                </div>
              </div>

              {/* مقياس الخطورة */}
              <div className="rounded-2xl border border-red-500/30 bg-gray-950/80 backdrop-blur-xl p-6">
                <h3 className="font-bold text-red-400 mb-4 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5" /> تقييم الخطورة
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "سرقة الهوية", level: "حرج", color: "red" },
                    { label: "اختراق الحساب", level: "حرج", color: "red" },
                    { label: "سرقة مالية", level: "عالي", color: "orange" },
                    { label: "تتبع الضحية", level: "متوسط", color: "yellow" },
                  ].map((risk) => (
                    <div key={risk.label} className={`rounded-xl p-3 border text-center bg-${risk.color}-950/20 border-${risk.color}-500/20`}>
                      <p className={`text-xs font-bold text-${risk.color}-400`}>{risk.level}</p>
                      <p className="text-xs text-gray-400 mt-1">{risk.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setPhase("dashboard")}
                  className="px-5 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-white text-sm font-bold cursor-pointer transition-colors"
                >
                  العودة للوحة المهاجم
                </button>
                <button
                  onClick={() => setPhase("warning")}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold cursor-pointer transition-colors flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  الدرس التعليمي
                </button>
              </div>
            </motion.div>
          )}

          {/* ───── مرحلة التحذير التعليمي ───── */}
          {phase === "warning" && (
            <motion.div key="warning" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto space-y-6">
              {/* تحذير رئيسي */}
              <div className="rounded-2xl border border-green-500/30 bg-gray-950/80 backdrop-blur-xl p-8 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-2xl font-bold text-green-400 mb-2">هذه محاكاة تعليمية!</h3>
                <p className="text-gray-400 mb-6">
                  لم يتم إرسال أي بيانات حقيقية. كل ما رأيته هو محاكاة لكيفية عمل هجوم التصيد الاحتيالي.
                </p>
              </div>

              {/* الدروس */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl p-5 border backdrop-blur-xl bg-yellow-950/20 border-yellow-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    <h4 className="font-bold text-yellow-400 text-sm">ما هو التصيد؟</h4>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    هجوم يستخدم صفحات مزيفة مطابقة لمواقع حقيقية لخداع المستخدم وسرقة بياناته. عادة يبدأ برسالة بريد إلكتروني تبدو رسمية.
                  </p>
                </div>

                <div className="rounded-2xl p-5 border backdrop-blur-xl bg-blue-950/20 border-blue-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="w-5 h-5 text-blue-400" />
                    <h4 className="font-bold text-blue-400 text-sm">علامات التحذير</h4>
                  </div>
                  <ul className="space-y-1.5 text-xs text-gray-400">
                    {[
                      "عنوان URL مشبوه أو به أخطاء",
                      "غياب HTTPS والقفل الأخضر",
                      "بريد من عنوان غريب",
                      "طلب مفاجئ لمعلومات حساسة",
                      "ضغط وإلحاح غير طبيعي",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl p-5 border backdrop-blur-xl bg-emerald-950/20 border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    <h4 className="font-bold text-emerald-400 text-sm">كيف تحمي نفسك؟</h4>
                  </div>
                  <ul className="space-y-1.5 text-xs text-gray-400">
                    {[
                      "تحقق من URL قبل إدخال بياناتك",
                      "فعّل المصادقة الثنائية (2FA)",
                      "لا تضغط روابط مشبوهة",
                      "استخدم مدير كلمات مرور",
                      "أبلغ عن المواقع المشبوهة",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* زر إعادة */}
              <div className="text-center">
                <button
                  onClick={reset}
                  className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold cursor-pointer transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 mx-auto"
                >
                  <RefreshCw className="w-5 h-5" />
                  إعادة المحاكاة من البداية
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageShell>
  );
}
