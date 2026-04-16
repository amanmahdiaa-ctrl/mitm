"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScrollText,
  Search,
  Filter,
  ArrowUpDown,
  ShieldAlert,
  ShieldCheck,
  Wifi,
  Fish,
  KeyRound,
  Clock,
  Trash2,
  Crosshair,
  Globe,
  LockOpen,
  Cookie,
  Radio,
  Eye,
  FileKey,
  Mail,
} from "lucide-react";
import PageShell from "@/components/PageShell";
import type { AttackType } from "@/types";

interface AdvancedLogEntry {
  id: string;
  time: string;
  attackType: AttackType;
  data: string;
  status: "intercepted" | "secure" | "blocked";
  details: string;
}

// بيانات تجريبية
const sampleLogs: AdvancedLogEntry[] = [
  { id: "1", time: "14:23:05", attackType: "mitm", data: "admin / ****", status: "intercepted", details: "اعتراض HTTP على المنفذ 80" },
  { id: "2", time: "14:21:30", attackType: "phishing", data: "user@email.com", status: "blocked", details: "صفحة تصيد مزيفة تم اكتشافها" },
  { id: "3", time: "14:18:10", attackType: "bruteforce", data: "23 محاولة", status: "blocked", details: "هجوم قوة غاشمة على SSH" },
  { id: "4", time: "14:15:45", attackType: "mitm", data: "user1 / ****", status: "secure", details: "محاولة MITM فاشلة - HTTPS نشط" },
  { id: "5", time: "14:12:22", attackType: "phishing", data: "test@domain.com", status: "intercepted", details: "إدخال بيانات في صفحة مزيفة" },
  { id: "6", time: "14:08:05", attackType: "bruteforce", data: "150 محاولة", status: "blocked", details: "تم حظر IP المهاجم" },
  { id: "7", time: "14:05:33", attackType: "mitm", data: "employee / ****", status: "intercepted", details: "اعتراض بيانات تسجيل دخول" },
  { id: "8", time: "14:02:11", attackType: "phishing", data: "victim@mail.com", status: "secure", details: "تنبيه مضاد التصيد نشط" },
  { id: "9", time: "13:58:44", attackType: "bruteforce", data: "87 محاولة", status: "intercepted", details: "اختراق كلمة مرور ضعيفة" },
  { id: "10", time: "13:55:10", attackType: "mitm", data: "manager / ****", status: "secure", details: "TLS 1.3 يحمي الاتصال" },
];

const attackLabels: Record<AttackType, { label: string; icon: React.ElementType; color: string }> = {
  mitm: { label: "MITM", icon: Wifi, color: "text-blue-400 bg-blue-500/15 border-blue-500/20" },
  phishing: { label: "تصيد", icon: Fish, color: "text-yellow-400 bg-yellow-500/15 border-yellow-500/20" },
  bruteforce: { label: "قوة غاشمة", icon: KeyRound, color: "text-red-400 bg-red-500/15 border-red-500/20" },
  "arp-spoofing": { label: "انتحال ARP", icon: Crosshair, color: "text-orange-400 bg-orange-500/15 border-orange-500/20" },
  "dns-spoofing": { label: "تزييف DNS", icon: Globe, color: "text-purple-400 bg-purple-500/15 border-purple-500/20" },
  "ssl-stripping": { label: "تجريد SSL", icon: LockOpen, color: "text-pink-400 bg-pink-500/15 border-pink-500/20" },
  "session-hijacking": { label: "اختطاف جلسة", icon: Cookie, color: "text-amber-400 bg-amber-500/15 border-amber-500/20" },
  "evil-twin": { label: "توأم شرير", icon: Radio, color: "text-rose-400 bg-rose-500/15 border-rose-500/20" },
  "packet-sniffing": { label: "التقاط حزم", icon: Eye, color: "text-teal-400 bg-teal-500/15 border-teal-500/20" },
  "https-spoofing": { label: "شهادة مزيفة", icon: FileKey, color: "text-indigo-400 bg-indigo-500/15 border-indigo-500/20" },
  "email-hijacking": { label: "اعتراض بريد", icon: Mail, color: "text-sky-400 bg-sky-500/15 border-sky-500/20" },
};

const statusLabels: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  intercepted: { label: "تم الاختراق", icon: ShieldAlert, color: "text-red-400 bg-red-500/15 border-red-500/20" },
  secure: { label: "آمن", icon: ShieldCheck, color: "text-green-400 bg-green-500/15 border-green-500/20" },
  blocked: { label: "محجوب", icon: ShieldCheck, color: "text-cyan-400 bg-cyan-500/15 border-cyan-500/20" },
};

type SortField = "time" | "attackType" | "status";

export default function LogsPage() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<AttackType | "all">("all");
  const [sortField, setSortField] = useState<SortField>("time");
  const [sortAsc, setSortAsc] = useState(false);
  const [logs] = useState(sampleLogs);

  const filteredLogs = useMemo(() => {
    let result = [...logs];

    // البحث
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.data.toLowerCase().includes(q) ||
          l.details.toLowerCase().includes(q) ||
          attackLabels[l.attackType].label.includes(q)
      );
    }

    // التصفية
    if (filterType !== "all") {
      result = result.filter((l) => l.attackType === filterType);
    }

    // الترتيب
    result.sort((a, b) => {
      const dir = sortAsc ? 1 : -1;
      if (sortField === "time") return a.time.localeCompare(b.time) * dir;
      if (sortField === "attackType") return a.attackType.localeCompare(b.attackType) * dir;
      return a.status.localeCompare(b.status) * dir;
    });

    return result;
  }, [logs, search, filterType, sortField, sortAsc]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* العنوان */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <ScrollText className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold shimmer-text">السجلات والمراقبة</h1>
          </div>
          <p className="text-gray-500">مراقبة جميع الأنشطة الأمنية وسجلات الهجمات</p>
        </motion.div>

        {/* أدوات التحكم */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          {/* البحث */}
          <div className="relative flex-1">
            <Search className="absolute top-3 right-3 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث في السجلات..."
              className="w-full px-4 py-2.5 pr-10 rounded-xl bg-gray-900/60 border border-gray-700/50 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          {/* فلتر نوع الهجوم */}
          <div className="flex gap-2 flex-wrap">
            {(["all", "mitm", "phishing", "bruteforce"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all border ${
                  filterType === type
                    ? type === "all"
                      ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                      : attackLabels[type].color
                    : "bg-gray-800/50 text-gray-500 border-gray-700/30 hover:bg-gray-800"
                }`}
              >
                {type === "all" ? (
                  <Filter className="w-3.5 h-3.5" />
                ) : (
                  (() => {
                    const Icon = attackLabels[type].icon;
                    return <Icon className="w-3.5 h-3.5" />;
                  })()
                )}
                {type === "all" ? "الكل" : attackLabels[type].label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* الجدول */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border backdrop-blur-xl bg-gray-900/40 border-gray-700/30 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="text-right py-3.5 px-4 font-medium">
                    <button onClick={() => toggleSort("time")} className="flex items-center gap-1 cursor-pointer hover:text-gray-300">
                      <Clock className="w-3.5 h-3.5" />
                      الوقت
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-right py-3.5 px-4 font-medium">
                    <button onClick={() => toggleSort("attackType")} className="flex items-center gap-1 cursor-pointer hover:text-gray-300">
                      نوع الهجوم
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-right py-3.5 px-4 font-medium">البيانات</th>
                  <th className="text-right py-3.5 px-4 font-medium">التفاصيل</th>
                  <th className="text-right py-3.5 px-4 font-medium">
                    <button onClick={() => toggleSort("status")} className="flex items-center gap-1 cursor-pointer hover:text-gray-300">
                      الحالة
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredLogs.map((log, idx) => {
                    const attack = attackLabels[log.attackType];
                    const status = statusLabels[log.status];
                    const AttackIcon = attack.icon;
                    const StatusIcon = status.icon;
                    return (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: idx * 0.03 }}
                        className={`border-b border-gray-800/40 hover:bg-gray-800/20 transition-colors ${
                          log.status === "intercepted" ? "bg-red-950/5" : ""
                        }`}
                      >
                        <td className="py-3 px-4 text-gray-400 font-mono text-xs">{log.time}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${attack.color}`}>
                            <AttackIcon className="w-3 h-3" />
                            {attack.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-gray-300">{log.data}</td>
                        <td className="py-3 px-4 text-xs text-gray-500">{log.details}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-12 text-gray-600">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>لا توجد نتائج مطابقة</p>
            </div>
          )}

          {/* ملخص */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800/50 text-xs text-gray-500">
            <span>عرض {filteredLogs.length} من {logs.length} سجل</span>
            <span className="flex items-center gap-4">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> {logs.filter(l => l.status === "intercepted").length} مخترَق</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400" /> {logs.filter(l => l.status === "secure").length} آمن</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" /> {logs.filter(l => l.status === "blocked").length} محجوب</span>
            </span>
          </div>
        </motion.div>
      </div>
    </PageShell>
  );
}
