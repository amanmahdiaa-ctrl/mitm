"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  CheckCircle,
  XCircle,
  RotateCcw,
  Trophy,
  ArrowLeft,
  Star,
} from "lucide-react";
import PageShell from "@/components/PageShell";
import type { QuizQuestion } from "@/types";

const questions: QuizQuestion[] = [
  {
    id: 1,
    question: "ما هو هجوم الرجل في المنتصف (MITM)؟",
    options: [
      "هجوم يستهدف الخوادم مباشرة",
      "اعتراض الاتصال بين طرفين دون علمهما",
      "إرسال رسائل بريد مزعجة",
      "هجوم على الأجهزة المادية",
    ],
    correctIndex: 1,
    explanation: "هجوم MITM يعتمد على اعتراض الاتصال بين الضحية والخادم، حيث يقوم المهاجم بالتنصت على البيانات أو تعديلها.",
  },
  {
    id: 2,
    question: "أي بروتوكول يوفر حماية من هجمات MITM؟",
    options: ["HTTP", "FTP", "HTTPS", "Telnet"],
    correctIndex: 2,
    explanation: "HTTPS يستخدم تشفير TLS/SSL الذي يمنع المهاجم من قراءة البيانات حتى لو اعترضها.",
  },
  {
    id: 3,
    question: "ما هو التصيد الاحتيالي (Phishing)؟",
    options: [
      "برنامج لحماية البريد الإلكتروني",
      "اختراق شبكات WiFi",
      "إنشاء مواقع مزيفة لسرقة بيانات المستخدمين",
      "تشفير الملفات وطلب فدية",
    ],
    correctIndex: 2,
    explanation: "التصيد الاحتيالي يعتمد على إنشاء صفحات مزيفة تبدو مطابقة للمواقع الحقيقية بهدف خداع المستخدم.",
  },
  {
    id: 4,
    question: "أي كلمة مرور هي الأقوى؟",
    options: ["password123", "MyD0g2024", "H&k9$mP2!xR@5", "123456789"],
    correctIndex: 2,
    explanation: "كلمة المرور القوية تحتوي على مزيج من الأحرف الكبيرة والصغيرة والأرقام والرموز الخاصة.",
  },
  {
    id: 5,
    question: "ما هي المصادقة الثنائية (2FA)؟",
    options: [
      "استخدام كلمتي مرور مختلفتين",
      "تسجيل الدخول من جهازين في نفس الوقت",
      "إضافة طبقة تحقق إضافية بجانب كلمة المرور",
      "تشفير البيانات مرتين",
    ],
    correctIndex: 2,
    explanation: "المصادقة الثنائية تضيف طبقة أمان إضافية كرمز SMS أو تطبيق مصادقة بجانب كلمة المرور.",
  },
  {
    id: 6,
    question: "ما هو هجوم القوة الغاشمة (Brute Force)؟",
    options: [
      "اختراق الخادم فيزيائياً",
      "تجربة جميع كلمات المرور المحتملة",
      "إغراق الخادم بالطلبات",
      "سرقة قاعدة البيانات",
    ],
    correctIndex: 1,
    explanation: "هجوم القوة الغاشمة يجرب جميع الاحتمالات الممكنة حتى يجد كلمة المرور الصحيحة.",
  },
  {
    id: 7,
    question: "كيف تتعرف على موقع تصيد احتيالي؟",
    options: [
      "التصميم جميل ومحترف",
      "يوجد شعار الشركة",
      "عنوان URL مشبوه أو مختلف عن الأصلي",
      "يطلب منك إدخال اسم المستخدم فقط",
    ],
    correctIndex: 2,
    explanation: "فحص عنوان URL هو أهم خطوة - مواقع التصيد تستخدم عناوين مشابهة لكنها مختلفة عن المواقع الحقيقية.",
  },
  {
    id: 8,
    question: "ما الذي يشير إليه رمز القفل في المتصفح؟",
    options: [
      "الموقع خالٍ من الفيروسات",
      "الاتصال مشفر بشهادة SSL/TLS",
      "الموقع موثوق 100%",
      "يمكنك مشاركة كلمة المرور بأمان",
    ],
    correctIndex: 1,
    explanation: "رمز القفل يعني أن الاتصال مشفر، لكنه لا يعني بالضرورة أن الموقع نفسه موثوق.",
  },
  {
    id: 9,
    question: "ما أفضل ممارسة لحماية حساباتك؟",
    options: [
      "استخدام نفس كلمة المرور لجميع الحسابات",
      "كتابة كلمات المرور على ورقة",
      "استخدام مدير كلمات مرور + 2FA",
      "تغيير كلمة المرور كل يوم",
    ],
    correctIndex: 2,
    explanation: "مدير كلمات المرور يحفظ كلمات مرور فريدة وقوية لكل حساب، و2FA تضيف طبقة حماية إضافية.",
  },
  {
    id: 10,
    question: "ما هو TLS 1.3؟",
    options: [
      "نظام تشغيل جديد",
      "بروتوكول تشفير حديث للاتصالات",
      "برنامج مكافحة فيروسات",
      "شبكة VPN مجانية",
    ],
    correctIndex: 1,
    explanation: "TLS 1.3 هو أحدث إصدار من بروتوكول التشفير المستخدم في HTTPS لحماية الاتصالات.",
  },
];

export default function QuizPage() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const q = questions[current];

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    const correct = idx === q.correctIndex;
    if (correct) setScore((s) => s + 1);
    setAnswers((a) => [...a, correct]);
  };

  const next = () => {
    if (current >= questions.length - 1) {
      setFinished(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const restart = () => {
    setCurrent(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setFinished(false);
    setAnswers([]);
  };

  const scorePercent = Math.round((score / questions.length) * 100);

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* العنوان */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <HelpCircle className="w-8 h-8 text-amber-400" />
            <h1 className="text-3xl font-bold shimmer-text">اختبار الأمن السيبراني</h1>
          </div>
          <p className="text-gray-500">اختبر معلوماتك في أمن المعلومات</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!finished ? (
            <motion.div
              key={`q-${current}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
            >
              {/* شريط التقدم */}
              <div className="mb-6">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>السؤال {current + 1} من {questions.length}</span>
                  <span>النتيجة: {score}/{current + (answered ? 1 : 0)}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
                  <motion.div
                    animate={{ width: `${((current + (answered ? 1 : 0)) / questions.length) * 100}%` }}
                    className="h-full rounded-full bg-amber-500"
                  />
                </div>
              </div>

              {/* السؤال */}
              <div className="rounded-2xl p-6 border backdrop-blur-xl bg-gray-900/40 border-gray-700/30 mb-6">
                <h2 className="text-xl font-bold text-gray-100 mb-6">{q.question}</h2>

                <div className="space-y-3">
                  {q.options.map((option, idx) => {
                    let styles = "bg-gray-800/50 border-gray-700/30 text-gray-300 hover:bg-gray-800 hover:border-gray-600";
                    if (answered) {
                      if (idx === q.correctIndex) {
                        styles = "bg-green-500/15 border-green-500/30 text-green-400";
                      } else if (idx === selected && idx !== q.correctIndex) {
                        styles = "bg-red-500/15 border-red-500/30 text-red-400";
                      } else {
                        styles = "bg-gray-800/30 border-gray-800/30 text-gray-600";
                      }
                    }

                    return (
                      <motion.button
                        key={idx}
                        whileHover={!answered ? { scale: 1.01 } : {}}
                        whileTap={!answered ? { scale: 0.99 } : {}}
                        onClick={() => handleSelect(idx)}
                        disabled={answered}
                        className={`w-full text-right px-4 py-3.5 rounded-xl border font-medium cursor-pointer transition-all flex items-center gap-3 ${styles} disabled:cursor-default`}
                      >
                        <span className="w-8 h-8 rounded-lg bg-gray-900/50 flex items-center justify-center text-sm shrink-0">
                          {answered && idx === q.correctIndex ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : answered && idx === selected ? (
                            <XCircle className="w-5 h-5 text-red-400" />
                          ) : (
                            String.fromCharCode(1571 + idx) // أ ب ت ث
                          )}
                        </span>
                        <span>{option}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* التفسير */}
              <AnimatePresence>
                {answered && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-2xl p-5 border backdrop-blur-xl bg-blue-950/20 border-blue-500/20 mb-6"
                  >
                    <p className="text-sm text-blue-400 font-bold mb-1">التفسير:</p>
                    <p className="text-sm text-gray-400">{q.explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* زر التالي */}
              {answered && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={next}
                  className="w-full py-3 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-500 cursor-pointer flex items-center justify-center gap-2 transition-colors"
                >
                  {current >= questions.length - 1 ? "عرض النتيجة" : "السؤال التالي"}
                  <ArrowLeft className="w-5 h-5" />
                </motion.button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl p-8 border backdrop-blur-xl bg-gray-900/40 border-gray-700/30 text-center"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Trophy
                  className={`w-20 h-20 mx-auto mb-4 ${
                    scorePercent >= 70 ? "text-amber-400" : "text-gray-500"
                  }`}
                />
              </motion.div>

              <h2 className="text-3xl font-bold mb-2">
                {scorePercent >= 90
                  ? "ممتاز! 🌟"
                  : scorePercent >= 70
                  ? "جيد جداً! 👏"
                  : scorePercent >= 50
                  ? "لا بأس 💪"
                  : "تحتاج مراجعة 📚"}
              </h2>

              <p className="text-5xl font-bold my-4">
                <span className={scorePercent >= 70 ? "text-green-400" : "text-yellow-400"}>
                  {score}
                </span>
                <span className="text-gray-600">/{questions.length}</span>
              </p>
              <p className="text-gray-500 mb-6">نسبة النجاح: {scorePercent}%</p>

              {/* ملخص الإجابات */}
              <div className="flex justify-center gap-2 mb-6 flex-wrap">
                {answers.map((correct, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      correct
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>

              <button
                onClick={restart}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold bg-amber-600 hover:bg-amber-500 text-white cursor-pointer transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                إعادة الاختبار
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageShell>
  );
}
