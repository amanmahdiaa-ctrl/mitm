"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Eye } from "lucide-react";
import Header from "@/components/Header";
import VictimPanel from "@/components/VictimPanel";
import AttackerPanel from "@/components/AttackerPanel";
import ServerPanel from "@/components/ServerPanel";
import MitmVisualScene from "@/components/MitmVisualScene";
import AttackAnalysis from "@/components/AttackAnalysis";
import LiveAttackFeed from "@/components/LiveAttackFeed";
import ProtocolToggle from "@/components/ProtocolToggle";
import LogsTable from "@/components/LogsTable";
import EducationalSection from "@/components/EducationalSection";
import PageShell from "@/components/PageShell";
import { useMitmSimulation } from "@/hooks/useMitmSimulation";

export default function Home() {
  const {
    protocol,
    setProtocol,
    phase,
    loginData,
    interceptedData,
    serverData,
    logs,
    analysisResult,
    startSimulation,
  } = useMitmSimulation();

  const isSimulating = phase !== "idle" && phase !== "complete";

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* الرأس */}
        <Header protocol={protocol} />

        {/* مؤشر "المهاجم يتنصت" */}
        <AnimatePresence>
          {protocol === "http" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-center gap-2 mb-4"
            >
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                <Eye className="w-4 h-4" />
                <span>المهاجم يتنصت على الشبكة...</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* مفتاح البروتوكول */}
        <div className="flex justify-center mb-8">
          <ProtocolToggle
            protocol={protocol}
            onToggle={setProtocol}
            disabled={isSimulating}
          />
        </div>

        {/* ═══ البث المباشر لتقنيات الهجوم ═══ */}
        <LiveAttackFeed
          phase={phase}
          protocol={protocol}
          loginData={loginData}
        />

        {/* ═══ المشهد المرئي: مجسمات الضحية والمهاجم والخادم ═══ */}
        <MitmVisualScene
          phase={phase}
          protocol={protocol}
          interceptedData={interceptedData}
        />

        {/* ═══ لوحات التحكم الثلاثة ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <VictimPanel phase={phase} onSubmit={startSimulation} />
          <AttackerPanel
            phase={phase}
            interceptedData={interceptedData}
            protocol={protocol}
          />
          <ServerPanel phase={phase} serverData={serverData} />
        </div>

        {/* ═══ التحليل التفصيلي للهجوم ═══ */}
        <AttackAnalysis
          phase={phase}
          protocol={protocol}
          interceptedData={interceptedData}
          loginData={loginData}
          analysisResult={analysisResult}
        />

        {/* جدول السجلات */}
        <LogsTable logs={logs} />

        {/* القسم التعليمي */}
        <EducationalSection />

        {/* التذييل */}
        <footer className="text-center mt-12 pb-8 text-gray-600 text-sm">
          <p>محاكاة تعليمية لأغراض التوعية الأمنية فقط</p>
          <p className="text-xs mt-1">لا يتم إرسال أي بيانات حقيقية</p>
        </footer>
      </div>
    </PageShell>
  );
}
