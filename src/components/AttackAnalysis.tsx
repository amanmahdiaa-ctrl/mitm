"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  FileWarning,
  Terminal,
  Layers,
  Radio,
  ShieldOff,
  ShieldCheck,
  Binary,
  Network,
  Lock,
  Unlock,
  ChevronDown,
  AlertTriangle,
  Eye,
  Fingerprint,
  Globe,
  Key,
  Shield,
  BarChart3,
  Bug,
} from "lucide-react";
import type { SimulationPhase, Protocol, LoginData, AnalysisResult } from "@/types";

interface AttackAnalysisProps {
  phase: SimulationPhase;
  protocol: Protocol;
  interceptedData: LoginData | null;
  loginData: LoginData | null;
  analysisResult: AnalysisResult | null;
}

/* ─── مُكوّن خطوة في المخطط الزمني ─── */
function TimelineStep({
  step,
  title,
  description,
  icon,
  active,
  done,
  danger,
  children,
}: {
  step: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  active: boolean;
  done: boolean;
  danger?: boolean;
  children?: React.ReactNode;
}) {
  const dotColor = done
    ? danger
      ? "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]"
      : "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
    : active
    ? "bg-amber-500 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.5)]"
    : "bg-gray-700";

  return (
    <div className="flex gap-4">
      {/* الخط العمودي + النقطة */}
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${dotColor}`}>
          {step}
        </div>
        <div className="w-0.5 flex-1 bg-gray-800 mt-1" />
      </div>

      {/* المحتوى */}
      <div className={`pb-6 flex-1 ${!active && !done ? "opacity-40" : ""}`}>
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <h4 className="font-bold text-sm text-gray-200">{title}</h4>
        </div>
        <p className="text-xs text-gray-500 mb-2">{description}</p>
        {(active || done) && children}
      </div>
    </div>
  );
}

/* ─── عرض حزمة بيانات وهمية (Packet) ─── */
function PacketView({
  label,
  data,
  isEncrypted,
  highlight,
}: {
  label: string;
  data: Record<string, string>;
  isEncrypted?: boolean;
  highlight?: boolean;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className={`rounded-lg border text-xs font-mono overflow-hidden ${
      highlight
        ? "bg-red-950/30 border-red-500/30"
        : isEncrypted
        ? "bg-emerald-950/20 border-emerald-500/20"
        : "bg-gray-900/50 border-gray-700/30"
    }`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 cursor-pointer transition-colors"
      >
        {isEncrypted ? <Lock className="w-3 h-3 text-emerald-400" /> : highlight ? <Unlock className="w-3 h-3 text-red-400" /> : <Binary className="w-3 h-3 text-gray-500" />}
        <span className={highlight ? "text-red-400" : isEncrypted ? "text-emerald-400" : "text-gray-400"}>{label}</span>
        <ChevronDown className={`w-3 h-3 mr-auto text-gray-600 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-2 space-y-0.5 border-t border-gray-800/50">
              {Object.entries(data).map(([key, value]) => (
                <div key={key} className="flex gap-2 py-0.5">
                  <span className="text-gray-600 shrink-0">{key}:</span>
                  <span className={
                    highlight && (key === "username" || key === "password")
                      ? "text-red-400 font-bold"
                      : isEncrypted
                      ? "text-emerald-500/60"
                      : "text-gray-400"
                  }>{value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── عرض رمز ملتقط (Token Card) ─── */
function TokenCard({
  token,
  isHTTP,
}: {
  token: import("@/types").CapturedToken;
  isHTTP: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const severityColor =
    token.risk === "critical"
      ? "text-red-400 bg-red-500/10 border-red-500/20"
      : token.risk === "high"
      ? "text-orange-400 bg-orange-500/10 border-orange-500/20"
      : token.risk === "medium"
      ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
      : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";

  const typeIcon =
    token.type === "jwt" ? <Key className="w-3.5 h-3.5" />
    : token.type === "session" ? <Fingerprint className="w-3.5 h-3.5" />
    : token.type === "csrf" ? <Shield className="w-3.5 h-3.5" />
    : token.type === "cookie" ? <Globe className="w-3.5 h-3.5" />
    : <Lock className="w-3.5 h-3.5" />;

  return (
    <div className={`rounded-xl border overflow-hidden ${severityColor}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors"
      >
        <span className={token.risk === "critical" || token.risk === "high" ? "text-red-400" : "text-emerald-400"}>
          {typeIcon}
        </span>
        <span className="text-xs font-bold text-gray-200 flex-1 text-right">{token.name}</span>
        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
          token.risk === "critical" ? "bg-red-500/30 text-red-300"
          : token.risk === "high" ? "bg-orange-500/30 text-orange-300"
          : token.risk === "low" ? "bg-emerald-500/30 text-emerald-300"
          : "bg-amber-500/30 text-amber-300"
        }`}>
          {token.risk.toUpperCase()}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 border-t border-gray-800/30">
              {/* قيمة الرمز */}
              <div className="mt-2 rounded-lg bg-black/40 p-2 font-mono text-[10px] break-all leading-relaxed" dir="ltr">
                <span className={isHTTP && token.risk !== "low" ? "text-red-400" : "text-gray-500"}>
                  {token.value}
                </span>
              </div>

              {/* فك تشفير JWT */}
              {token.decoded && (
                <div className="mt-2 space-y-1">
                  <p className="text-[10px] text-gray-500 font-bold mb-1">Decoded Payload:</p>
                  {Object.entries(token.decoded).map(([k, v]) => (
                    <div key={k} className="flex gap-2 text-[10px] font-mono" dir="ltr">
                      <span className="text-gray-600">{k}:</span>
                      <span className={isHTTP ? "text-red-400/90" : "text-emerald-400/60"}>
                        {typeof v === "number" && (k === "iat" || k === "exp")
                          ? `${v} (${new Date(v * 1000).toLocaleString("ar-EG")})`
                          : String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── المكوّن الرئيسي ─── */
export default function AttackAnalysis({ phase, protocol, interceptedData, loginData, analysisResult }: AttackAnalysisProps) {
  const isHTTP = protocol === "http";
  const hasData = loginData !== null;
  const isActive = phase !== "idle";

  return (
    <div className="space-y-6 mb-8">
      {/* ═══ القسم 1: المخطط الزمني للهجوم ═══ */}
      <div className="rounded-2xl border backdrop-blur-xl bg-gray-900/40 border-gray-700/30 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-100">مراحل الهجوم الزمنية</h3>
            <p className="text-xs text-gray-500">تتبّع كيف تتدفق البيانات وكيف يعترضها المهاجم</p>
          </div>
        </div>

        <TimelineStep
          step={1}
          title="المستخدم يُدخل البيانات"
          description="الضحية يكتب اسم المستخدم وكلمة المرور في نموذج تسجيل الدخول ويضغط إرسال."
          icon={<Fingerprint className="w-4 h-4 text-blue-400" />}
          active={phase === "idle" && !hasData}
          done={hasData}
        >
          {loginData && (
            <div className="space-y-1 bg-blue-950/20 rounded-lg p-3 border border-blue-500/20 text-xs">
              <div className="flex gap-2">
                <span className="text-gray-500">المستخدم:</span>
                <span className="text-blue-400 font-mono">{loginData.username}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-500">كلمة المرور:</span>
                <span className="text-blue-400 font-mono">{"•".repeat(loginData.password.length)}</span>
              </div>
            </div>
          )}
        </TimelineStep>

        <TimelineStep
          step={2}
          title="المتصفح يُنشئ طلب HTTP"
          description={`المتصفح يحوّل البيانات إلى طلب ${isHTTP ? "HTTP (غير مشفر)" : "HTTPS (مشفر بـ TLS 1.3)"} ويرسله عبر الشبكة.`}
          icon={<Globe className="w-4 h-4 text-cyan-400" />}
          active={phase === "sending"}
          done={phase === "intercepting" || phase === "delivering" || phase === "complete"}
        >
          {loginData && (
            <div className="space-y-2">
              <PacketView
                label={`${isHTTP ? "HTTP" : "HTTPS"} POST Request`}
                isEncrypted={!isHTTP}
                data={analysisResult?.requestHeaders ?? (isHTTP ? {
                  "Method": "POST",
                  "URL": "http://example.com/login",
                  "Content-Type": "application/x-www-form-urlencoded",
                  "username": loginData.username,
                  "password": loginData.password,
                } : {
                  "Method": "POST",
                  "URL": "https://example.com/login",
                  "TLS": "1.3 (AES_256_GCM_SHA384)",
                  "Payload": "17 03 03 00 45 a2 f8 c1 9b 3e ... [مشفّر]",
                })}
              />
            </div>
          )}
        </TimelineStep>

        <TimelineStep
          step={3}
          title="المهاجم يعترض الحزمة"
          description={isHTTP
            ? "المهاجم يستخدم ARP Spoofing لتوجيه حركة الشبكة عبر جهازه ويقرأ البيانات بالكامل."
            : "المهاجم يعترض الحزمة لكن التشفير TLS يمنعه من قراءة المحتوى."
          }
          icon={<Eye className="w-4 h-4 text-red-400" />}
          active={phase === "intercepting"}
          done={phase === "delivering" || phase === "complete"}
          danger={isHTTP}
        >
          {loginData && (
            <div className="space-y-2">
              {isHTTP ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span className="text-red-400 text-xs font-bold">خطر! البيانات مكشوفة بالكامل للمهاجم</span>
                  </div>
                  <PacketView
                    label="ما يراه المهاجم (Captured Packet)"
                    highlight
                    data={analysisResult ? {
                      "Source IP": analysisResult.network.srcIP,
                      "Dest IP": analysisResult.network.dstIP,
                      "Intercepted by": analysisResult.network.attackerIP,
                      "Protocol": "HTTP (Plain Text)",
                      "username": loginData.username,
                      "password": loginData.password,
                      "Cookie": `session_id=${analysisResult.tokens.find(t => t.type === "session")?.value ?? "N/A"}`,
                    } : {
                      "Protocol": "HTTP (Plain Text)",
                      "username": loginData.username,
                      "password": loginData.password,
                    }}
                  />
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-emerald-400 text-xs font-bold">البيانات محمية - المهاجم لا يستطيع القراءة</span>
                  </div>
                  <PacketView
                    label="ما يراه المهاجم (Encrypted)"
                    isEncrypted
                    data={analysisResult ? {
                      "Source IP": analysisResult.network.srcIP,
                      "Dest IP": analysisResult.network.dstIP,
                      "Protocol": analysisResult.network.tlsVersion ?? "TLS 1.3",
                      "Cipher": analysisResult.network.cipherSuite ?? "AES_256_GCM_SHA384",
                      "Payload": "83 a1 0b f7 2c e4 19 d3 8a ...",
                      "Decryption": "❌ غير ممكن بدون المفتاح الخاص",
                    } : {
                      "Protocol": "TLS 1.3",
                      "Payload": "83 a1 0b f7 2c e4 19 d3 8a ...",
                      "Decryption": "❌ غير ممكن بدون المفتاح الخاص",
                    }}
                  />
                </>
              )}
            </div>
          )}
        </TimelineStep>

        <TimelineStep
          step={4}
          title="البيانات تصل الخادم"
          description="الخادم يستقبل الطلب ويتحقق من بيانات الاعتماد ويعيد الاستجابة."
          icon={<Network className="w-4 h-4 text-emerald-400" />}
          active={phase === "delivering"}
          done={phase === "complete"}
        >
          {loginData && (
            <PacketView
              label="Server Response (200 OK)"
              data={analysisResult?.responseHeaders ?? {
                "Status": "200 OK",
                "Set-Cookie": "session=s3cur3T0k3n; HttpOnly; Secure",
                "Body": '{"status": "authenticated", "user": "' + loginData.username + '"}',
              }}
            />
          )}
        </TimelineStep>

        <TimelineStep
          step={5}
          title="النتيجة النهائية"
          description={isHTTP
            ? "المهاجم حصل على نسخة كاملة من بيانات الاعتماد. يمكنه الآن انتحال هوية الضحية."
            : "الهجوم فشل. لم يتمكن المهاجم من قراءة أي بيانات حساسة."
          }
          icon={isHTTP ? <ShieldOff className="w-4 h-4 text-red-400" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
          active={phase === "complete"}
          done={phase === "complete"}
          danger={isHTTP}
        >
          <div className={`rounded-lg p-3 border text-xs ${
            isHTTP ? "bg-red-950/20 border-red-500/20" : "bg-emerald-950/20 border-emerald-500/20"
          }`}>
            {isHTTP ? (
              <ul className="space-y-1.5 text-red-400/90">
                <li>• المهاجم يملك اسم المستخدم وكلمة المرور</li>
                <li>• يمكنه تسجيل الدخول كالضحية فوراً</li>
                <li>• يمكنه تعديل البيانات أثناء النقل دون علم الطرفين</li>
                <li>• يمكنه حقن أكواد خبيثة في الاستجابة</li>
                <li>• يمكنه سرقة ملف تعريف الجلسة (Session Cookie)</li>
              </ul>
            ) : (
              <ul className="space-y-1.5 text-emerald-400/90">
                <li>• البيانات وصلت سليمة ومشفرة</li>
                <li>• المهاجم لم يحصل على أي معلومة مفيدة</li>
                <li>• التشفير يمنع التعديل على الحزم</li>
                <li>• شهادة SSL تؤكد هوية الخادم الحقيقي</li>
              </ul>
            )}
          </div>
        </TimelineStep>
      </div>

      {/* ═══ القسم 2: تحليل الرموز المُلتقطة (Token Inspector) ═══ */}
      {analysisResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 80, damping: 18 }}
          className="rounded-2xl border backdrop-blur-xl bg-gray-900/40 border-gray-700/30 p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Key className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-100">فحص الرموز الملتقطة</h3>
              <p className="text-xs text-gray-500">Token Inspector — تحليل JWT و Session و CSRF</p>
            </div>
            <div className="mr-auto flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isHTTP ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"
              }`}>
                {analysisResult.tokens.length} رمز
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {analysisResult.tokens.map((token, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1, type: "spring", stiffness: 100, damping: 16 }}
              >
                <TokenCard token={token} isHTTP={isHTTP} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ═══ القسم 3: Hex Dump و حزم الشبكة ═══ */}
      {analysisResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 80, damping: 18, delay: 0.1 }}
          className="rounded-2xl border backdrop-blur-xl bg-gray-900/40 border-gray-700/30 p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <Terminal className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-100">التقاط حزم الشبكة</h3>
              <p className="text-xs text-gray-500">Hex Dump — البيانات الخام الملتقطة</p>
            </div>
            <div className="mr-auto flex items-center gap-2 text-[10px] text-gray-500 font-mono">
              {analysisResult.network.totalPackets} packets | {analysisResult.network.bytesTransferred} bytes
            </div>
          </div>

          {/* إحصائيات الشبكة */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: "الحزم الكلية", value: analysisResult.network.totalPackets, color: "text-cyan-400" },
              { label: "الحزم الملتقطة", value: analysisResult.network.capturedPackets, color: isHTTP ? "text-red-400" : "text-emerald-400" },
              { label: "زمن الاستجابة", value: `${analysisResult.network.avgLatency}ms`, color: "text-amber-400" },
              { label: "تأخير MITM", value: `+${analysisResult.network.mitmOverhead}ms`, color: isHTTP ? "text-red-400" : "text-gray-500" },
            ].map((s, i) => (
              <div key={i} className="rounded-xl bg-gray-900/60 border border-gray-800/50 p-3 text-center">
                <p className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Hex Dump */}
          <div className="rounded-xl bg-black/70 border border-gray-800 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-900/80 border-b border-gray-800">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              <span className="text-[10px] text-gray-600 mr-2 font-mono">
                hexdump — {isHTTP ? "PLAIN TEXT CAPTURED" : "ENCRYPTED STREAM"}
              </span>
            </div>
            <div className="p-4 font-mono text-[10px] leading-relaxed space-y-0.5 overflow-x-auto" dir="ltr">
              <p className="text-gray-600 mb-2">$ hexdump -C captured_packet.bin</p>
              {analysisResult.hexDump.map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={isHTTP ? "text-red-400/80" : "text-emerald-500/60"}
                >
                  {line}
                </motion.p>
              ))}
              <p className="text-gray-600 mt-2">
                {isHTTP
                  ? "⚠ WARNING: All data readable in plain text"
                  : "🔒 Content encrypted — no readable data"}
              </p>
            </div>
          </div>

          {/* تفاصيل TLS (HTTPS فقط) */}
          {analysisResult.network.certificateInfo && (
            <div className="mt-4 rounded-xl bg-emerald-950/20 border border-emerald-500/15 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold text-emerald-400">شهادة TLS</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {Object.entries({
                  Subject: analysisResult.network.certificateInfo.subject,
                  Issuer: analysisResult.network.certificateInfo.issuer,
                  "Valid From": analysisResult.network.certificateInfo.validFrom,
                  "Valid To": analysisResult.network.certificateInfo.validTo,
                  Fingerprint: analysisResult.network.certificateInfo.fingerprint.slice(0, 30) + "...",
                  Status: analysisResult.network.certificateInfo.isValid ? "✓ Valid" : "✗ Invalid",
                }).map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="text-gray-600">{k}:</span>
                    <span className="text-emerald-400/80">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ═══ القسم 4: تقييم المخاطر والثغرات ═══ */}
      {analysisResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 80, damping: 18, delay: 0.2 }}
          className="rounded-2xl border backdrop-blur-xl bg-gray-900/40 border-gray-700/30 p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-100">تقييم المخاطر الأمنية</h3>
              <p className="text-xs text-gray-500">Risk Assessment — نتائج تحليل الثغرات</p>
            </div>
          </div>

          {/* مقياس المخاطر */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#1e293b" strokeWidth="3" />
                <motion.circle
                  cx="18" cy="18" r="15.5" fill="none"
                  stroke={analysisResult.riskScore > 70 ? "#ef4444" : analysisResult.riskScore > 40 ? "#f59e0b" : "#10b981"}
                  strokeWidth="3" strokeLinecap="round" strokeDasharray="97.4"
                  initial={{ strokeDashoffset: 97.4 }}
                  animate={{ strokeDashoffset: 97.4 - (97.4 * analysisResult.riskScore) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-lg font-bold ${
                  analysisResult.riskScore > 70 ? "text-red-400" : analysisResult.riskScore > 40 ? "text-amber-400" : "text-emerald-400"
                }`}>
                  {analysisResult.riskScore}%
                </span>
              </div>
            </div>
            <div>
              <p className={`text-lg font-bold ${
                analysisResult.riskLevel === "critical" ? "text-red-400"
                : analysisResult.riskLevel === "high" ? "text-orange-400"
                : analysisResult.riskLevel === "medium" ? "text-amber-400"
                : "text-emerald-400"
              }`}>
                {analysisResult.riskLevel === "critical" ? "خطر حرج"
                : analysisResult.riskLevel === "high" ? "خطر عالي"
                : analysisResult.riskLevel === "medium" ? "خطر متوسط"
                : "آمن"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                تم اكتشاف {analysisResult.vulnerabilities.length} ثغرة أمنية
              </p>
            </div>
          </div>

          {/* قائمة الثغرات */}
          <div className="space-y-2 mb-5">
            {analysisResult.vulnerabilities.map((vuln, i) => (
              <motion.div
                key={vuln.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08, type: "spring", stiffness: 100, damping: 16 }}
                className={`flex items-start gap-3 rounded-xl p-3 border ${
                  vuln.severity === "critical"
                    ? "bg-red-950/20 border-red-500/20"
                    : vuln.severity === "high"
                    ? "bg-orange-950/20 border-orange-500/20"
                    : "bg-emerald-950/20 border-emerald-500/20"
                }`}
              >
                <Bug className={`w-4 h-4 mt-0.5 shrink-0 ${
                  vuln.severity === "critical" ? "text-red-400"
                  : vuln.severity === "high" ? "text-orange-400"
                  : "text-emerald-400"
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-gray-200">{vuln.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                      vuln.severity === "critical" ? "bg-red-500/20 text-red-400"
                      : vuln.severity === "high" ? "bg-orange-500/20 text-orange-400"
                      : "bg-emerald-500/20 text-emerald-400"
                    }`}>
                      {vuln.severity.toUpperCase()}
                    </span>
                    <span className="text-[9px] text-gray-600 font-mono">{vuln.id}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">{vuln.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* التوصيات */}
          <div className="rounded-xl bg-gray-900/60 border border-gray-800/50 p-4">
            <h4 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              التوصيات الأمنية
            </h4>
            <ul className="space-y-1.5">
              {analysisResult.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                  <span className="text-emerald-400 mt-0.5">✓</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}

      {/* ═══ القسم 5: تفاصيل تقنية ═══ */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* كيف يعمل ARP Spoofing */}
        <div className="rounded-2xl border backdrop-blur-xl bg-gray-900/40 border-gray-700/30 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Radio className="w-5 h-5 text-orange-400" />
            <h3 className="font-bold text-gray-200 text-sm">كيف يتم هجوم ARP Spoofing؟</h3>
          </div>
          <div className="space-y-3 text-xs text-gray-400 leading-relaxed">
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
              <p>المهاجم يرسل رسائل ARP مزيفة للضحية يدّعي فيها أن عنوان MAC الخاص به هو عنوان البوابة (Router).</p>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
              <p>يرسل أيضاً رسائل ARP للبوابة يدّعي أن عنوانه هو عنوان الضحية.</p>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
              <p>الآن كل حركة المرور بين الضحية والإنترنت تمر عبر جهاز المهاجم.</p>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
              <p>المهاجم يقرأ كل حزمة HTTP غير مشفرة ويستخرج البيانات الحساسة.</p>
            </div>
          </div>
        </div>

        {/* لماذا HTTPS يحمي */}
        <div className="rounded-2xl border backdrop-blur-xl bg-gray-900/40 border-gray-700/30 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-gray-200 text-sm">لماذا HTTPS يوفر الحماية؟</h3>
          </div>
          <div className="space-y-3 text-xs text-gray-400 leading-relaxed">
            <div className="flex gap-3 items-start">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-400 mb-0.5">التشفير (Encryption)</p>
                <p>AES-256 يشفّر كل حزمة بمفتاح فريد. حتى لو اعترض المهاجم الحزمة، يرى بيانات عشوائية لا معنى لها.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <Fingerprint className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-400 mb-0.5">المصادقة (Authentication)</p>
                <p>شهادة SSL تثبت هوية الخادم الحقيقي. المهاجم لا يمكنه انتحال صفة الخادم بدون الشهادة.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-400 mb-0.5">سلامة البيانات (Integrity)</p>
                <p>HMAC يضمن عدم تعديل البيانات أثناء النقل. أي تلاعب يكتشفه المتصفح فوراً.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ماذا يمكن للمهاجم فعله */}
        <div className="rounded-2xl border backdrop-blur-xl bg-red-950/20 border-red-500/20 p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileWarning className="w-5 h-5 text-red-400" />
            <h3 className="font-bold text-gray-200 text-sm">ما يمكن للمهاجم فعله (HTTP)</h3>
          </div>
          <ul className="space-y-2 text-xs text-gray-400">
            <li className="flex gap-2 items-start">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
              <span><b className="text-red-400">سرقة بيانات الاعتماد:</b> اسم المستخدم وكلمة المرور تظهر كنص عادي</span>
            </li>
            <li className="flex gap-2 items-start">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
              <span><b className="text-red-400">اختطاف الجلسة:</b> سرقة Session Cookie والتحكم بالحساب</span>
            </li>
            <li className="flex gap-2 items-start">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
              <span><b className="text-red-400">حقن محتوى خبيث:</b> إضافة JavaScript أو تعديل صفحات الويب</span>
            </li>
            <li className="flex gap-2 items-start">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
              <span><b className="text-red-400">إعادة التوجيه:</b> توجيه الضحية لمواقع تصيد مزيفة</span>
            </li>
            <li className="flex gap-2 items-start">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
              <span><b className="text-red-400">تسجيل كامل:</b> حفظ كل نشاط التصفح والبريد والملفات</span>
            </li>
          </ul>
        </div>

        {/* كيف تحمي نفسك */}
        <div className="rounded-2xl border backdrop-blur-xl bg-emerald-950/20 border-emerald-500/20 p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-gray-200 text-sm">كيف تحمي نفسك؟</h3>
          </div>
          <ul className="space-y-2 text-xs text-gray-400">
            <li className="flex gap-2 items-start">
              <span className="text-emerald-400">✓</span>
              <span>تأكد دائماً من وجود <b className="text-emerald-400">HTTPS</b> ورمز القفل في شريط العنوان</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-emerald-400">✓</span>
              <span>استخدم <b className="text-emerald-400">VPN</b> عند الاتصال بشبكات Wi-Fi العامة</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-emerald-400">✓</span>
              <span>فعّل <b className="text-emerald-400">المصادقة الثنائية (2FA)</b> على جميع حساباتك</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-emerald-400">✓</span>
              <span>لا تتجاهل تحذيرات المتصفح عن <b className="text-emerald-400">الشهادات غير الصالحة</b></span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-emerald-400">✓</span>
              <span>استخدم <b className="text-emerald-400">DNS over HTTPS (DoH)</b> لمنع التلاعب بنتائج DNS</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
