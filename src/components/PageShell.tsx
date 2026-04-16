"use client";

import Sidebar from "@/components/Sidebar";
import MatrixRain from "@/components/MatrixRain";
import FloatingParticles from "@/components/FloatingParticles";

export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 relative overflow-hidden bg-grid scanline">
        <MatrixRain />
        <FloatingParticles />
        <div className="fixed inset-0 pointer-events-none z-1">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 min-h-screen">{children}</div>
      </div>
    </div>
  );
}
