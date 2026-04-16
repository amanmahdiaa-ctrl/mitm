"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  KeyRound,
  Play,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Zap,
  Lock,
  Terminal,
  Hash,
  Cpu,
  Activity,
  Target,
  Search,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Database,
  Gauge,
  Eye,
  EyeOff,
} from "lucide-react";
import PageShell from "@/components/PageShell";

/* ─── أنواع ─── */
type AttackPhase =
  | "setup"
  | "recon"
  | "dictionary"
  | "bruteforce"
  | "cracked"
  | "failed"
  | "analysis"
  | "education";

type AttackMethod = "dictionary" | "bruteforce" | "hybrid";

interface AttackStats {
  totalAttempts: number;
  dictionaryAttempts: number;
  bruteforceAttempts: number;
  elapsedMs: number;
  speed: number; // attempts/sec
  found: boolean;
  method: AttackMethod;
  targetPassword: string;
  hashType: string;
  hash: string;
  entropy: number;
  estimatedTime: string;
}

/* ─── قوائم كلمات المرور ─── */
const dictionary = [
  "123456", "password", "12345678", "qwerty", "abc123",
  "monkey", "1234567", "letmein", "trustno1", "dragon",
  "baseball", "iloveyou", "master", "sunshine", "ashley",
  "bailey", "shadow", "123123", "654321", "superman",
  "michael", "football", "password1", "charlie", "welcome",
  "admin", "login", "princess", "000000", "access",
  "flower", "hello", "passw0rd", "pass123", "root",
  "toor", "guest", "default", "changeme", "test123",
];

const leetMap: Record<string, string> = { a: "@", e: "3", i: "1", o: "0", s: "$", t: "7" };

/* ─── مساعدات ─── */
const randomHex = (len: number) =>
  Array.from({ length: len }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0")).join("");

const sha256Fake = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  const base = Math.abs(h).toString(16).padStart(8, "0");
  return (base + randomHex(28)).slice(0, 64);
};

const calcEntropy = (pw: string) => {
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) pool += 33;
  return pool > 0 ? +(pw.length * Math.log2(pool)).toFixed(1) : 0;
};

const estimateCrackTime = (entropy: number): string => {
  const seconds = Math.pow(2, entropy) / 10_000_000_000;
  if (seconds < 0.001) return "أقل من ثانية";
  if (seconds < 1) return "أقل من ثانية";
  if (seconds < 60) return `${Math.round(seconds)} ثانية`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} دقيقة`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} ساعة`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} يوم`;
  const years = seconds / 31536000;
  if (years < 1000) return `${Math.round(years)} سنة`;
  if (years < 1e6) return `${Math.round(years / 1000)}K سنة`;
  return `+${(years / 1e6).toFixed(0)}M سنة`;
};

const randomPass = (len = 6) => {
  const c = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: len }, () => c[Math.floor(Math.random() * c.length)]).join("");
};

const randomPassComplex = () => {
  const c = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  const len = 8 + Math.floor(Math.random() * 5);
  return Array.from({ length: len }, () => c[Math.floor(Math.random() * c.length)]).join("");
};

/* ─── مكوّن سطر تيرمنال ─── */
function TermLine({ text, delay, color = "text-green-400" }: { text: string; delay: number; color?: string }) {
  const [visible, setVisible] = useState(false);
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  useEffect(() => {
    if (!visible) return;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(iv);
    }, 15);
    return () => clearInterval(iv);
  }, [visible, text]);
  if (!visible) return null;
  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className={`font-mono text-xs ${color}`}>
      <span className="text-gray-600 select-none">$ </span>{displayed}
      {displayed.length < text.length && <span className="animate-pulse">▊</span>}
    </motion.div>
  );
}

/* ─── مكوّن قوة كلمة المرور ─── */
function PasswordStrengthBar({ entropy }: { entropy: number }) {
  const pct = Math.min((entropy / 100) * 100, 100);
  const color = entropy < 28 ? "bg-red-500" : entropy < 50 ? "bg-yellow-500" : entropy < 70 ? "bg-blue-500" : "bg-green-500";
  const label = entropy < 28 ? "ضعيفة جداً" : entropy < 50 ? "ضعيفة" : entropy < 70 ? "متوسطة" : "قوية";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">القوة: {label}</span>
        <span className="text-gray-500">{entropy} بت</span>
      </div>
      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

/* ───────── الصفحة الرئيسية ───────── */
export default function BruteForcePage() {
  const [phase, setPhase] = useState<AttackPhase>("setup");
  const [targetPassword, setTargetPassword] = useState("123456");
  const [showTarget, setShowTarget] = useState(false);
  const [attackMethod, setAttackMethod] = useState<AttackMethod>("hybrid");
  const [attempts, setAttempts] = useState(0);
  const [currentGuess, setCurrentGuess] = useState("");
  const [guessLog, setGuessLog] = useState<{ guess: string; match: boolean }[]>([]);
  const [stats, setStats] = useState<AttackStats | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [reconStep, setReconStep] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const logRef = useRef<HTMLDivElement>(null);

  const isWeak = dictionary.includes(targetPassword.toLowerCase());
  const entropy = calcEntropy(targetPassword);
  const hash = useState(() => sha256Fake(targetPassword))[0];

  const cleanup = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);
  useEffect(() => () => cleanup(), [cleanup]);

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [guessLog]);

  /* ─── بدء المحاكاة ─── */
  const handleStart = () => {
    if (!targetPassword.trim()) return;
    setPhase("recon");
    setReconStep(0);
    setAttempts(0);
    setCurrentGuess("");
    setGuessLog([]);
    setElapsedMs(0);
    setStats(null);

    // Recon phase then attack
    let step = 0;
    const reconIv = setInterval(() => {
      step++;
      setReconStep(step);
      if (step >= 7) {
        clearInterval(reconIv);
        setTimeout(() => startDictionaryPhase(), 800);
      }
    }, 600);
  };

  /* ─── Dictionary phase ─── */
  const startDictionaryPhase = () => {
    setPhase("dictionary");
    startTimeRef.current = Date.now();
    let i = 0;
    const target = targetPassword.toLowerCase();

    intervalRef.current = setInterval(() => {
      i++;
      setAttempts(i);
      setElapsedMs(Date.now() - startTimeRef.current);

      // Try dictionary words + leet variants
      let guess: string;
      if (i <= dictionary.length) {
        guess = dictionary[i - 1];
      } else if (i <= dictionary.length + dictionary.length) {
        // Leet speak variants
        const base = dictionary[i - 1 - dictionary.length];
        guess = base.split("").map((c) => leetMap[c] || c).join("");
      } else {
        guess = randomPass();
      }

      setCurrentGuess(guess);
      setGuessLog((prev) => {
        const next = [...prev, { guess, match: guess === target }];
        return next.length > 60 ? next.slice(-60) : next;
      });

      if (guess === target) {
        cleanup();
        finishAttack(true, i, "dictionary");
        return;
      }

      if (i >= dictionary.length * 2 + 20) {
        cleanup();
        if (attackMethod === "dictionary") {
          finishAttack(false, i, "dictionary");
        } else {
          startBruteforcePhase(i);
        }
      }
    }, 80);
  };

  /* ─── Bruteforce phase ─── */
  const startBruteforcePhase = (prevAttempts: number) => {
    setPhase("bruteforce");
    let i = 0;
    const target = targetPassword;
    const maxBf = isWeak ? 200 : 500;

    intervalRef.current = setInterval(() => {
      i++;
      const total = prevAttempts + i;
      setAttempts(total);
      setElapsedMs(Date.now() - startTimeRef.current);

      const guess = isWeak ? randomPass(target.length) : randomPassComplex();
      setCurrentGuess(guess);
      setGuessLog((prev) => {
        const next = [...prev, { guess, match: guess === target }];
        return next.length > 60 ? next.slice(-60) : next;
      });

      if (guess === target) {
        cleanup();
        finishAttack(true, total, "bruteforce");
        return;
      }

      if (i >= maxBf) {
        cleanup();
        // For weak passwords, force find it at the end
        if (isWeak) {
          setCurrentGuess(target);
          setGuessLog((prev) => [...prev, { guess: target, match: true }]);
          finishAttack(true, total + 1, "hybrid");
        } else {
          finishAttack(false, total, "hybrid");
        }
      }
    }, 30);
  };

  /* ─── إنهاء الهجوم ─── */
  const finishAttack = (found: boolean, totalAttempts: number, method: AttackMethod) => {
    const elapsed = Date.now() - startTimeRef.current;
    const s: AttackStats = {
      totalAttempts: totalAttempts,
      dictionaryAttempts: Math.min(totalAttempts, dictionary.length * 2 + 20),
      bruteforceAttempts: Math.max(0, totalAttempts - dictionary.length * 2 - 20),
      elapsedMs: elapsed,
      speed: Math.round((totalAttempts / elapsed) * 1000),
      found,
      method,
      targetPassword,
      hashType: "SHA-256",
      hash,
      entropy: calcEntropy(targetPassword),
      estimatedTime: estimateCrackTime(calcEntropy(targetPassword)),
    };
    setStats(s);
    setPhase(found ? "cracked" : "failed");
  };

  const reset = () => {
    cleanup();
    setPhase("setup");
    setAttempts(0);
    setCurrentGuess("");
    setGuessLog([]);
    setElapsedMs(0);
    setStats(null);
    setReconStep(0);
  };

  const progress =
    phase === "dictionary" ? Math.min((attempts / (dictionary.length * 2 + 20)) * 100, 100)
    : phase === "bruteforce" ? Math.min(((attempts - dictionary.length * 2 - 20) / 500) * 100, 100)
    : 0;

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* العنوان */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <KeyRound className="w-8 h-8 text-red-400" />
            <h1 className="text-3xl font-bold shimmer-text">محاكاة هجوم القوة الغاشمة</h1>
          </div>
          <p className="text-gray-500">محاكاة واقعية لهجمات تخمين كلمات المرور وتحليل قوتها</p>
        </motion.div>

        {/* شريط المراحل */}
        <div className="flex items-center justify-center gap-1 mb-8 flex-wrap">
          {(["setup", "recon", "dictionary", "bruteforce", "cracked", "analysis", "education"] as AttackPhase[]).map((p, i) => {
            const labels: Record<string, string> = {
              setup: "الإعداد", recon: "الاستطلاع", dictionary: "القاموس",
              bruteforce: "القوة الغاشمة", cracked: "النتيجة", failed: "النتيجة",
              analysis: "التحليل", education: "التعليم",
            };
            const icons: Record<string, React.ReactNode> = {
              setup: <Target className="w-3.5 h-3.5" />, recon: <Search className="w-3.5 h-3.5" />,
              dictionary: <Database className="w-3.5 h-3.5" />, bruteforce: <Zap className="w-3.5 h-3.5" />,
              cracked: <ShieldAlert className="w-3.5 h-3.5" />, failed: <ShieldCheck className="w-3.5 h-3.5" />,
              analysis: <Activity className="w-3.5 h-3.5" />, education: <BookOpen className="w-3.5 h-3.5" />,
            };
            const allP: AttackPhase[] = ["setup", "recon", "dictionary", "bruteforce", "cracked", "analysis", "education"];
            const ci = allP.indexOf(phase === "failed" ? "cracked" : phase);
            const isActive = i === ci;
            const isDone = i < ci;
            return (
              <div key={p} className="flex items-center gap-1">
                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${isActive ? "bg-red-500/20 text-red-400 ring-1 ring-red-500/40" : isDone ? "bg-green-500/10 text-green-500" : "bg-gray-800/40 text-gray-600"}`}>
                  {isDone ? <CheckCircle className="w-3.5 h-3.5" /> : icons[p]}
                  <span className="hidden sm:inline">{labels[p]}</span>
                </div>
                {i < 6 && <span className={`text-xs ${isDone ? "text-green-600" : "text-gray-700"}`}>›</span>}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* ═══════ مرحلة الإعداد ═══════ */}
          {phase === "setup" && (
            <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto space-y-6">
              {/* كلمة المرور المستهدفة */}
              <div className="rounded-2xl border border-gray-700/50 bg-gray-900/60 backdrop-blur-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-5 h-5 text-red-400" />
                  <h3 className="font-bold text-gray-200">كلمة المرور المستهدفة</h3>
                </div>

                {/* اختيار سريع */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {[
                    { pw: "123456", label: "ضعيفة جداً" },
                    { pw: "password1", label: "ضعيفة" },
                    { pw: "MyD0g2024", label: "متوسطة" },
                    { pw: "H&k9$mP2!xR#7q", label: "قوية" },
                  ].map(({ pw, label }) => (
                    <button
                      key={pw}
                      onClick={() => setTargetPassword(pw)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                        targetPassword === pw
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-gray-800/50 text-gray-500 border border-gray-700/30 hover:bg-gray-800"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* حقل إدخال */}
                <div className="relative">
                  <input
                    type={showTarget ? "text" : "password"}
                    value={targetPassword}
                    onChange={(e) => setTargetPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور للاختبار"
                    className="w-full px-4 py-3 pr-10 pl-10 rounded-xl bg-gray-800/60 border border-gray-600/50 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 font-mono"
                    dir="ltr"
                    autoComplete="off"
                  />
                  <Lock className="absolute top-3.5 right-3 w-4 h-4 text-gray-600" />
                  <button
                    type="button"
                    onClick={() => setShowTarget(!showTarget)}
                    className="absolute top-3.5 left-3 text-gray-600 hover:text-gray-400 cursor-pointer"
                  >
                    {showTarget ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* مقياس القوة */}
                <div className="mt-3">
                  <PasswordStrengthBar entropy={entropy} />
                </div>

                {/* Hash preview */}
                <div className="mt-3 bg-gray-800/40 rounded-lg p-3">
                  <p className="text-[10px] text-gray-500 mb-1">SHA-256 Hash:</p>
                  <p className="font-mono text-[11px] text-gray-400 break-all" dir="ltr">{hash}</p>
                </div>
              </div>

              {/* اختيار طريقة الهجوم */}
              <div className="rounded-2xl border border-gray-700/50 bg-gray-900/60 backdrop-blur-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Cpu className="w-5 h-5 text-yellow-400" />
                  <h3 className="font-bold text-gray-200">طريقة الهجوم</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {([
                    { m: "dictionary" as AttackMethod, icon: <Database className="w-5 h-5" />, label: "هجوم القاموس", desc: "تجربة كلمات مرور شائعة" },
                    { m: "bruteforce" as AttackMethod, icon: <Zap className="w-5 h-5" />, label: "القوة الغاشمة", desc: "تجربة كل الاحتمالات" },
                    { m: "hybrid" as AttackMethod, icon: <Hash className="w-5 h-5" />, label: "هجوم مختلط", desc: "قاموس + قوة غاشمة" },
                  ]).map(({ m, icon, label, desc }) => (
                    <button
                      key={m}
                      onClick={() => setAttackMethod(m)}
                      className={`p-4 rounded-xl border text-right cursor-pointer transition-all ${
                        attackMethod === m
                          ? "bg-red-500/10 border-red-500/30 text-red-400"
                          : "bg-gray-800/30 border-gray-700/30 text-gray-500 hover:bg-gray-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">{icon}<span className="font-bold text-sm">{label}</span></div>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* زر البدء */}
              <button
                onClick={handleStart}
                disabled={!targetPassword.trim()}
                className="w-full py-4 rounded-xl font-bold text-white bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all duration-150 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 text-lg shadow-lg shadow-red-500/20"
              >
                <Play className="w-6 h-6" />
                بدء الهجوم
              </button>
            </motion.div>
          )}

          {/* ═══════ مرحلة الاستطلاع ═══════ */}
          {phase === "recon" && (
            <motion.div key="recon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto">
              <div className="rounded-2xl border border-yellow-500/30 bg-gray-950/80 backdrop-blur-xl overflow-hidden">
                <div className="bg-gray-900 px-4 py-2.5 border-b border-gray-800 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-mono text-yellow-400">recon — جمع المعلومات</span>
                  <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: 5 }} className="mr-auto text-xs text-yellow-500">● SCAN</motion.span>
                </div>
                <div className="p-5 space-y-1.5">
                  <TermLine delay={0} text="[*] Initializing attack framework..." color="text-yellow-400" />
                  <TermLine delay={600} text={`[+] Target hash: ${hash.slice(0, 32)}...`} color="text-cyan-400" />
                  <TermLine delay={1200} text="[+] Hash type identified: SHA-256" color="text-cyan-400" />
                  <TermLine delay={1800} text={`[+] Password entropy: ${entropy} bits`} color="text-cyan-400" />
                  <TermLine delay={2400} text={`[*] Loading wordlist: rockyou.txt (${dictionary.length} entries)...`} color="text-yellow-400" />
                  <TermLine delay={3000} text="[*] Generating leet-speak variants..." color="text-yellow-400" />
                  <TermLine delay={3600} text={`[*] Attack method: ${attackMethod === "hybrid" ? "Dictionary + Brute Force" : attackMethod === "dictionary" ? "Dictionary Attack" : "Brute Force"}`} color="text-green-400" />
                  {reconStep >= 7 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-400 font-mono text-xs mt-2 font-bold">
                      <span className="text-gray-600 select-none">$ </span>[✓] Ready — launching attack...
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════ مرحلة Dictionary / Bruteforce ═══════ */}
          {(phase === "dictionary" || phase === "bruteforce") && (
            <motion.div key="attack" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* سجل المحاولات */}
                <div className="lg:col-span-2 rounded-2xl border border-red-500/30 bg-gray-950/80 backdrop-blur-xl overflow-hidden">
                  <div className="bg-gray-900 px-4 py-2.5 border-b border-gray-800 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-mono text-red-400">
                      {phase === "dictionary" ? "dictionary-attack" : "brute-force"} — تشغيل
                    </span>
                    <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: 50 }} className="mr-auto text-xs text-red-500">● ATTACKING</motion.span>
                  </div>

                  <div ref={logRef} className="p-4 max-h-72 overflow-y-auto space-y-0.5 scrollbar-thin" dir="ltr">
                    {guessLog.slice(-30).map((entry, i) => (
                      <div key={i} className={`font-mono text-[11px] ${entry.match ? "text-green-400 font-bold" : "text-gray-500"}`}>
                        <span className="text-gray-700">[{String(attempts - (guessLog.slice(-30).length - 1 - i)).padStart(5, "0")}]</span>{" "}
                        {entry.match ? "✓ MATCH" : "✗"} {entry.guess}
                        {entry.match && " ← كلمة المرور صحيحة!"}
                      </div>
                    ))}
                    {!guessLog.some((g) => g.match) && (
                      <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: 100 }} className="text-gray-600 font-mono text-xs">▊</motion.span>
                    )}
                  </div>
                </div>

                {/* إحصائيات حية */}
                <div className="space-y-4">
                  <div className="rounded-2xl border border-gray-700/50 bg-gray-900/60 backdrop-blur-xl p-5">
                    <h4 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-yellow-400" />
                      إحصائيات حية
                    </h4>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">المحاولات</span>
                          <span className="text-white font-mono">{attempts.toLocaleString()}</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">السرعة</span>
                          <span className="text-yellow-400 font-mono">{elapsedMs > 0 ? Math.round((attempts / elapsedMs) * 1000) : 0}/ث</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">الوقت</span>
                          <span className="text-cyan-400 font-mono">{(elapsedMs / 1000).toFixed(1)}ث</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">المرحلة</span>
                          <span className={`font-mono ${phase === "dictionary" ? "text-blue-400" : "text-red-400"}`}>
                            {phase === "dictionary" ? "القاموس" : "القوة الغاشمة"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* شريط التقدم */}
                    <div className="mt-4">
                      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          animate={{ width: `${progress}%` }}
                          className={`h-full rounded-full ${phase === "dictionary" ? "bg-blue-500" : "bg-red-500"}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* التخمين الحالي */}
                  <div className="rounded-2xl border border-gray-700/50 bg-gray-900/60 backdrop-blur-xl p-5">
                    <p className="text-xs text-gray-500 mb-2">التخمين الحالي:</p>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={currentGuess}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        className="font-mono text-lg text-yellow-400 break-all"
                        dir="ltr"
                      >
                        {currentGuess || "—"}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════ مرحلة النتيجة (مخترقة) ═══════ */}
          {phase === "cracked" && stats && (
            <motion.div key="cracked" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto space-y-6">
              <div className="rounded-2xl border border-red-500/30 bg-gray-950/80 backdrop-blur-xl p-8 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
                  <ShieldAlert className="w-20 h-20 text-red-400 mx-auto mb-4" />
                </motion.div>
                <h2 className="text-2xl font-bold text-red-400 mb-2">تم اختراق كلمة المرور!</h2>
                <p className="text-gray-500 mb-6">تمكن المهاجم من كسر كلمة المرور بنجاح</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="rounded-xl bg-gray-900/80 border border-gray-700/50 p-3 text-center">
                    <p className="text-xs text-gray-500">المحاولات</p>
                    <p className="text-xl font-bold text-red-400 font-mono">{stats.totalAttempts.toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl bg-gray-900/80 border border-gray-700/50 p-3 text-center">
                    <p className="text-xs text-gray-500">الوقت</p>
                    <p className="text-xl font-bold text-yellow-400 font-mono">{(stats.elapsedMs / 1000).toFixed(1)}ث</p>
                  </div>
                  <div className="rounded-xl bg-gray-900/80 border border-gray-700/50 p-3 text-center">
                    <p className="text-xs text-gray-500">السرعة</p>
                    <p className="text-xl font-bold text-cyan-400 font-mono">{stats.speed}/ث</p>
                  </div>
                  <div className="rounded-xl bg-gray-900/80 border border-gray-700/50 p-3 text-center">
                    <p className="text-xs text-gray-500">Entropy</p>
                    <p className="text-xl font-bold text-purple-400 font-mono">{stats.entropy}</p>
                  </div>
                </div>

                {/* كلمة المرور المكشوفة */}
                <div className="rounded-xl bg-red-950/20 border border-red-500/20 p-4 mb-4">
                  <p className="text-xs text-gray-500 mb-1">كلمة المرور:</p>
                  <p className="font-mono text-2xl text-red-400 font-bold" dir="ltr">{stats.targetPassword}</p>
                </div>

                <div className="flex justify-center gap-3">
                  <button onClick={() => setPhase("analysis")} className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold cursor-pointer transition-colors flex items-center gap-2">
                    <Activity className="w-4 h-4" /> التحليل الفني
                  </button>
                  <button onClick={() => setPhase("education")} className="px-5 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-white text-sm font-bold cursor-pointer transition-colors flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> الدرس التعليمي
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════ مرحلة النتيجة (صمود) ═══════ */}
          {phase === "failed" && stats && (
            <motion.div key="failed" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto space-y-6">
              <div className="rounded-2xl border border-green-500/30 bg-gray-950/80 backdrop-blur-xl p-8 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
                  <ShieldCheck className="w-20 h-20 text-green-400 mx-auto mb-4" />
                </motion.div>
                <h2 className="text-2xl font-bold text-green-400 mb-2">كلمة المرور صمدت!</h2>
                <p className="text-gray-500 mb-6">فشل المهاجم في كسر كلمة المرور بعد {stats.totalAttempts.toLocaleString()} محاولة</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="rounded-xl bg-gray-900/80 border border-gray-700/50 p-3 text-center">
                    <p className="text-xs text-gray-500">المحاولات</p>
                    <p className="text-xl font-bold text-green-400 font-mono">{stats.totalAttempts.toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl bg-gray-900/80 border border-gray-700/50 p-3 text-center">
                    <p className="text-xs text-gray-500">الوقت</p>
                    <p className="text-xl font-bold text-yellow-400 font-mono">{(stats.elapsedMs / 1000).toFixed(1)}ث</p>
                  </div>
                  <div className="rounded-xl bg-gray-900/80 border border-gray-700/50 p-3 text-center">
                    <p className="text-xs text-gray-500">Entropy</p>
                    <p className="text-xl font-bold text-cyan-400 font-mono">{stats.entropy}</p>
                  </div>
                  <div className="rounded-xl bg-gray-900/80 border border-gray-700/50 p-3 text-center">
                    <p className="text-xs text-gray-500">الوقت الحقيقي</p>
                    <p className="text-sm font-bold text-purple-400">{stats.estimatedTime}</p>
                  </div>
                </div>

                <div className="rounded-xl bg-green-950/20 border border-green-500/20 p-4 mb-4">
                  <p className="text-sm text-green-400">✓ كلمة المرور القوية تحمي حسابك من هجمات القوة الغاشمة</p>
                </div>

                <div className="flex justify-center gap-3">
                  <button onClick={() => setPhase("analysis")} className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold cursor-pointer transition-colors flex items-center gap-2">
                    <Activity className="w-4 h-4" /> التحليل الفني
                  </button>
                  <button onClick={() => setPhase("education")} className="px-5 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-white text-sm font-bold cursor-pointer transition-colors flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> الدرس التعليمي
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════ مرحلة التحليل الفني ═══════ */}
          {phase === "analysis" && stats && (
            <motion.div key="analysis" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto space-y-6">
              {/* تحليل كلمة المرور */}
              <div className="rounded-2xl border border-cyan-500/30 bg-gray-950/80 backdrop-blur-xl p-6">
                <h3 className="font-bold text-cyan-400 mb-4 flex items-center gap-2">
                  <Hash className="w-5 h-5" /> تحليل كلمة المرور
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="bg-gray-900/60 rounded-xl p-3">
                      <p className="text-[10px] text-gray-500 mb-1">كلمة المرور</p>
                      <p className="font-mono text-sm text-white" dir="ltr">{stats.targetPassword}</p>
                    </div>
                    <div className="bg-gray-900/60 rounded-xl p-3">
                      <p className="text-[10px] text-gray-500 mb-1">الطول</p>
                      <p className="font-mono text-sm text-white">{stats.targetPassword.length} حرف</p>
                    </div>
                    <div className="bg-gray-900/60 rounded-xl p-3">
                      <p className="text-[10px] text-gray-500 mb-1">Entropy</p>
                      <p className="font-mono text-sm text-white">{stats.entropy} بت</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-gray-900/60 rounded-xl p-3">
                      <p className="text-[10px] text-gray-500 mb-1">SHA-256 Hash</p>
                      <p className="font-mono text-[10px] text-gray-400 break-all" dir="ltr">{stats.hash}</p>
                    </div>
                    <div className="bg-gray-900/60 rounded-xl p-3">
                      <p className="text-[10px] text-gray-500 mb-1">الوقت التقديري للاختراق (10B/s)</p>
                      <p className="font-mono text-sm text-white">{stats.estimatedTime}</p>
                    </div>
                    <PasswordStrengthBar entropy={stats.entropy} />
                  </div>
                </div>

                {/* تفاصيل التركيبة */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: "أحرف صغيرة", test: /[a-z]/.test(stats.targetPassword), icon: "a-z" },
                    { label: "أحرف كبيرة", test: /[A-Z]/.test(stats.targetPassword), icon: "A-Z" },
                    { label: "أرقام", test: /[0-9]/.test(stats.targetPassword), icon: "0-9" },
                    { label: "رموز", test: /[^a-zA-Z0-9]/.test(stats.targetPassword), icon: "#$!" },
                  ].map(({ label, test, icon }) => (
                    <div key={label} className={`rounded-lg p-2 text-center text-xs border ${test ? "bg-green-950/20 border-green-500/20 text-green-400" : "bg-gray-800/30 border-gray-700/30 text-gray-600"}`}>
                      <p className="font-mono text-lg mb-0.5">{icon}</p>
                      <p>{test ? "✓" : "✗"} {label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* إحصائيات الهجوم */}
              <div className="rounded-2xl border border-orange-500/30 bg-gray-950/80 backdrop-blur-xl p-6">
                <h3 className="font-bold text-orange-400 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5" /> إحصائيات الهجوم
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { label: "إجمالي المحاولات", value: stats.totalAttempts.toLocaleString(), color: "text-red-400" },
                    { label: "محاولات القاموس", value: stats.dictionaryAttempts.toLocaleString(), color: "text-blue-400" },
                    { label: "محاولات القوة الغاشمة", value: stats.bruteforceAttempts.toLocaleString(), color: "text-purple-400" },
                    { label: "الوقت المنقضي", value: `${(stats.elapsedMs / 1000).toFixed(2)} ث`, color: "text-yellow-400" },
                    { label: "السرعة", value: `${stats.speed.toLocaleString()} / ث`, color: "text-cyan-400" },
                    { label: "النتيجة", value: stats.found ? "مخترقة ✗" : "صامدة ✓", color: stats.found ? "text-red-400" : "text-green-400" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-gray-900/60 rounded-xl p-3 text-center">
                      <p className="text-[10px] text-gray-500 mb-1">{label}</p>
                      <p className={`font-mono text-sm font-bold ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* مقارنة كلمات المرور */}
              <div className="rounded-2xl border border-gray-700/50 bg-gray-950/80 backdrop-blur-xl p-6">
                <h3 className="font-bold text-gray-300 mb-4">مقارنة سرعة الاختراق</h3>
                <div className="space-y-3">
                  {[
                    { pass: "123456", time: "أقل من ثانية", ent: 19.9, color: "bg-red-500" },
                    { pass: "password", time: "أقل من ثانية", ent: 37.6, color: "bg-red-500" },
                    { pass: "MyD0g2024", time: "~3 ساعات", ent: 53.6, color: "bg-yellow-500" },
                    { pass: "H&k9$mP2!xR", time: "~34 سنة", ent: 72.5, color: "bg-blue-500" },
                    { pass: "Tr0ub4dor&3#2026!!", time: "+1M سنة", ent: 118, color: "bg-green-500" },
                  ].map((item) => (
                    <div key={item.pass} className="flex items-center gap-3">
                      <code className="text-[11px] font-mono text-gray-400 w-36 truncate shrink-0" dir="ltr">{item.pass}</code>
                      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${item.color}`} style={{ width: `${Math.min((item.ent / 120) * 100, 100)}%` }} />
                      </div>
                      <span className="text-[11px] text-gray-500 w-24 text-left shrink-0">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button onClick={() => setPhase(stats.found ? "cracked" : "failed")} className="px-5 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-white text-sm font-bold cursor-pointer transition-colors">
                  العودة للنتيجة
                </button>
                <button onClick={() => setPhase("education")} className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold cursor-pointer transition-colors flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> الدرس التعليمي
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══════ مرحلة التعليم ═══════ */}
          {phase === "education" && (
            <motion.div key="education" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto space-y-6">
              <div className="rounded-2xl border border-green-500/30 bg-gray-950/80 backdrop-blur-xl p-8 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
                  <BookOpen className="w-16 h-16 text-green-400 mx-auto mb-4" />
                </motion.div>
                <h2 className="text-2xl font-bold text-green-400 mb-2">ما تعلمناه</h2>
                <p className="text-gray-400">كلمة المرور القوية هي خط الدفاع الأول ضد هجمات القوة الغاشمة</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl p-5 border backdrop-blur-xl bg-red-950/20 border-red-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <h4 className="font-bold text-red-400 text-sm">ما هو الهجوم؟</h4>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    هجوم القوة الغاشمة يجرب الآلاف أو الملايين من كلمات المرور بشكل آلي. يبدأ عادة بقاموس الكلمات الشائعة ثم ينتقل لتجربة كل الاحتمالات الممكنة باستخدام GPU.
                  </p>
                </div>

                <div className="rounded-2xl p-5 border backdrop-blur-xl bg-yellow-950/20 border-yellow-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Lock className="w-5 h-5 text-yellow-400" />
                    <h4 className="font-bold text-yellow-400 text-sm">أنواع الهجمات</h4>
                  </div>
                  <ul className="space-y-1.5 text-xs text-gray-400">
                    {[
                      "هجوم القاموس — كلمات مرور شائعة",
                      "القوة الغاشمة — كل الاحتمالات",
                      "Rainbow Tables — جداول مسبقة",
                      "Credential Stuffing — بيانات مسربة",
                      "Hybrid — مزيج من الطرق",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-yellow-400 mt-1.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl p-5 border backdrop-blur-xl bg-emerald-950/20 border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <h4 className="font-bold text-emerald-400 text-sm">كيف تحمي نفسك؟</h4>
                  </div>
                  <ul className="space-y-1.5 text-xs text-gray-400">
                    {[
                      "استخدم 14+ حرفاً مع رموز وأرقام",
                      "تجنب الكلمات الشائعة والشخصية",
                      "استخدم مدير كلمات مرور",
                      "فعّل المصادقة الثنائية (2FA)",
                      "استخدم كلمة مرور فريدة لكل موقع",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={reset}
                  className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold cursor-pointer transition-all duration-150 hover:scale-[1.01] active:scale-[0.99] flex items-center gap-2 mx-auto"
                >
                  <RotateCcw className="w-5 h-5" />
                  إعادة المحاكاة
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageShell>
  );
}
