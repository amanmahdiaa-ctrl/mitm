"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Wifi,
  Fish,
  KeyRound,
  Columns2,
  ScrollText,
  HelpCircle,
  Bot,
  Menu,
  X,
  Shield,
  ChevronLeft,
  ChevronDown,
  Crosshair,
  Globe,
  LockOpen,
  Cookie,
  Radio,
  Eye,
  FileKey,
  Mail,
} from "lucide-react";

const mitmAttacks = [
  { href: "/attacks/arp-spoofing", label: "ARP Spoofing", icon: Crosshair },
  { href: "/attacks/dns-spoofing", label: "DNS Spoofing", icon: Globe },
  { href: "/attacks/ssl-stripping", label: "SSL Stripping", icon: LockOpen },
  { href: "/attacks/session-hijacking", label: "Session Hijacking", icon: Cookie },
  { href: "/attacks/evil-twin", label: "Evil Twin", icon: Radio },
  { href: "/attacks/packet-sniffing", label: "Packet Sniffing", icon: Eye },
  { href: "/attacks/https-spoofing", label: "HTTPS Spoofing", icon: FileKey },
  { href: "/attacks/email-hijacking", label: "Email Hijacking", icon: Mail },
];

const navItems = [
  { href: "/", label: "محاكاة MITM", icon: Wifi },
  { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/phishing", label: "محاكاة التصيد", icon: Fish },
  { href: "/bruteforce", label: "Brute Force", icon: KeyRound },
  { href: "/compare", label: "وضع المقارنة", icon: Columns2 },
  { href: "/logs", label: "السجلات والمراقبة", icon: ScrollText },
  { href: "/quiz", label: "اختبار تفاعلي", icon: HelpCircle },
  { href: "/assistant", label: "المساعد الذكي", icon: Bot },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [attacksOpen, setAttacksOpen] = useState(pathname.startsWith("/attacks"));

  const isAttackActive = pathname.startsWith("/attacks");

  const content = (
    <nav className="flex flex-col h-full">
      {/* الشعار */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800/60">
        <Shield className="w-8 h-8 text-cyan-400 shrink-0" />
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="text-lg font-bold shimmer-text whitespace-nowrap overflow-hidden"
          >
            منصة الأمن السيبراني
          </motion.span>
        )}
      </div>

      {/* روابط التنقل */}
      <div className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {/* العنصر الأول: محاكاة MITM */}
        {navItems.slice(0, 1).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                ${
                  isActive
                    ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20"
                    : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 border border-transparent"
                }
              `}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-cyan-400" : "text-gray-500 group-hover:text-gray-300"}`} />
              {!collapsed && (
                <span className="whitespace-nowrap">{item.label}</span>
              )}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-400 rounded-l-full"
                />
              )}
            </Link>
          );
        })}

        {/* ═══ قائمة هجمات MITM الفرعية ═══ */}
        <div>
          <button
            onClick={() => !collapsed && setAttacksOpen(!attacksOpen)}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative cursor-pointer
              ${
                isAttackActive
                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                  : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 border border-transparent"
              }
            `}
          >
            <Crosshair className={`w-5 h-5 shrink-0 ${isAttackActive ? "text-red-400" : "text-gray-500 group-hover:text-gray-300"}`} />
            {!collapsed && (
              <>
                <span className="whitespace-nowrap flex-1 text-right">أنواع هجمات MITM</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${attacksOpen ? "rotate-180" : ""}`} />
              </>
            )}
            {isAttackActive && (
              <motion.div
                layoutId="sidebar-active"
                className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-red-400 rounded-l-full"
              />
            )}
          </button>
          <AnimatePresence>
            {attacksOpen && !collapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mr-4 pr-3 border-r border-red-500/20 mt-1 space-y-0.5">
                  {mitmAttacks.map((item, i) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={`
                            flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 group
                            ${
                              isActive
                                ? "bg-red-500/15 text-red-300 border border-red-500/20"
                                : "text-gray-500 hover:bg-gray-800/40 hover:text-gray-300 border border-transparent"
                            }
                          `}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-red-400" : "text-gray-600 group-hover:text-gray-400"}`} />
                          <span className="whitespace-nowrap">{item.label}</span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* باقي عناصر التنقل */}
        {navItems.slice(1).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                ${
                  isActive
                    ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20"
                    : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 border border-transparent"
                }
              `}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-cyan-400" : "text-gray-500 group-hover:text-gray-300"}`} />
              {!collapsed && (
                <span className="whitespace-nowrap">{item.label}</span>
              )}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-400 rounded-l-full"
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* زر الطي - سطح المكتب فقط */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center gap-2 px-3 py-3 border-t border-gray-800/60 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
      >
        <ChevronLeft
          className={`w-5 h-5 transition-transform duration-300 ${
            collapsed ? "rotate-180" : ""
          }`}
        />
        {!collapsed && <span className="text-xs">طي القائمة</span>}
      </button>
    </nav>
  );

  return (
    <>
      {/* زر الهامبرغر للهاتف */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-xl bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 text-gray-300 cursor-pointer"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* الشريط الجانبي - سطح المكتب */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 h-screen sticky top-0 bg-gray-950/80 backdrop-blur-xl border-l border-gray-800/40 transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {content}
      </aside>

      {/* الشريط الجانبي - هاتف (overlay) */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              transition={{ type: "spring", damping: 25 }}
              className="lg:hidden fixed top-0 right-0 bottom-0 w-72 bg-gray-950/95 backdrop-blur-xl border-l border-gray-800/40 z-50 flex flex-col"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 left-4 p-1 text-gray-500 hover:text-gray-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
