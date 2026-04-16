"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Shield,
  AlertTriangle,
  Wifi,
  Lock,
  Eye,
  Globe,
  Key,
  CheckCircle,
} from "lucide-react";

const cards = [
  {
    title: "ما هو هجوم الرجل في المنتصف؟",
    icon: <AlertTriangle className="w-6 h-6" />,
    color: "from-red-500/20 to-orange-500/20",
    borderColor: "border-red-500/20",
    iconColor: "text-red-400",
    content: [
      "هجوم الرجل في المنتصف (MITM) هو نوع من الهجمات السيبرانية حيث يتسلل المهاجم بين طرفين يتواصلان مع بعضهما البعض.",
      "يقوم المهاجم باعتراض الاتصال وقراءة البيانات المتبادلة أو حتى تعديلها دون علم الطرفين.",
      "يمكن أن يحدث هذا الهجوم في شبكات WiFi العامة أو الشبكات غير المؤمنة.",
    ],
  },
  {
    title: "أنواع هجمات MITM",
    icon: <Eye className="w-6 h-6" />,
    color: "from-purple-500/20 to-pink-500/20",
    borderColor: "border-purple-500/20",
    iconColor: "text-purple-400",
    content: [
      "🔹 ARP Spoofing - انتحال بروتوكول تحليل العنوان",
      "🔹 DNS Spoofing - انتحال نظام أسماء النطاقات",
      "🔹 SSL Stripping - تجريد طبقة المقابس الآمنة",
      "🔹 WiFi Eavesdropping - التنصت على شبكات الواي فاي",
      "🔹 Email Hijacking - اختطاف البريد الإلكتروني",
    ],
  },
  {
    title: "طرق الحماية",
    icon: <Shield className="w-6 h-6" />,
    color: "from-green-500/20 to-emerald-500/20",
    borderColor: "border-green-500/20",
    iconColor: "text-green-400",
    content: [
      "✅ استخدم HTTPS دائماً وتأكد من شهادة SSL",
      "✅ تجنب شبكات WiFi العامة غير المؤمنة",
      "✅ استخدم VPN لتشفير اتصالك",
      "✅ فعّل المصادقة الثنائية (2FA)",
      "✅ حدّث برامجك ونظام التشغيل باستمرار",
      "✅ استخدم مدير كلمات مرور موثوق",
    ],
  },
];

const stats = [
  {
    icon: <Globe className="w-5 h-5" />,
    label: "من الهجمات تستهدف HTTP",
    value: "35%",
    color: "text-red-400",
  },
  {
    icon: <Lock className="w-5 h-5" />,
    label: "حماية بواسطة HTTPS",
    value: "95%",
    color: "text-green-400",
  },
  {
    icon: <Key className="w-5 h-5" />,
    label: "يمنعها التشفير",
    value: "99%",
    color: "text-blue-400",
  },
  {
    icon: <Wifi className="w-5 h-5" />,
    label: "من شبكات WiFi العامة معرضة",
    value: "60%",
    color: "text-yellow-400",
  },
];

export default function EducationalSection() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      className="mt-12"
    >
      {/* عنوان القسم */}
      <div className="flex items-center gap-3 mb-8">
        <BookOpen className="w-7 h-7 text-cyan-400" />
        <h2 className="text-2xl font-bold text-white">القسم التعليمي</h2>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + index * 0.1 }}
            className="rounded-xl p-4 bg-gray-900/40 border border-gray-700/30 backdrop-blur-sm text-center"
          >
            <div className={`${stat.color} flex justify-center mb-2`}>
              {stat.icon}
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* بطاقات المعلومات */}
      <div className="grid md:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + index * 0.15 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className={`rounded-2xl p-6 border backdrop-blur-xl bg-linear-to-b ${card.color} ${card.borderColor}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-10 h-10 rounded-xl bg-gray-900/50 flex items-center justify-center ${card.iconColor}`}
              >
                {card.icon}
              </div>
              <h3 className="text-lg font-bold text-white">{card.title}</h3>
            </div>

            <ul className="space-y-2">
              {card.content.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.15 + i * 0.05 }}
                  className="text-sm text-gray-300 leading-relaxed"
                >
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* تنبيه تعليمي */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-8 rounded-xl p-4 bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-3"
      >
        <CheckCircle className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-yellow-400 font-bold text-sm mb-1">
            تنبيه: هذه محاكاة تعليمية فقط
          </p>
          <p className="text-gray-400 text-xs leading-relaxed">
            هذا التطبيق مصمم لأغراض تعليمية فقط لتوضيح كيفية عمل هجمات الرجل
            في المنتصف. لا يتم إرسال أي بيانات حقيقية ولا يتم تنفيذ أي هجمات
            فعلية. الهدف هو زيادة الوعي الأمني وتعليم طرق الحماية.
          </p>
        </div>
      </motion.div>
    </motion.section>
  );
}
