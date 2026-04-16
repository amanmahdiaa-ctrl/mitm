// أنواع البيانات المستخدمة في المحاكاة
export interface LoginData {
  username: string;
  password: string;
}

export interface LogEntry {
  id: string;
  time: string;
  username: string;
  password: string;
  status: "intercepted" | "secure";
  attackType?: AttackType;
}

export type Protocol = "http" | "https";

export type SimulationPhase =
  | "idle"
  | "sending"
  | "intercepting"
  | "delivering"
  | "complete";

// أنواع الهجمات
export type AttackType = "mitm" | "phishing" | "bruteforce" | "arp-spoofing" | "dns-spoofing" | "ssl-stripping" | "session-hijacking" | "evil-twin" | "packet-sniffing" | "https-spoofing" | "email-hijacking";

// أنواع هجمات MITM الفرعية
export type MitmAttackType = "arp-spoofing" | "dns-spoofing" | "ssl-stripping" | "session-hijacking" | "evil-twin" | "packet-sniffing" | "https-spoofing" | "email-hijacking";

export type MitmSubPhase = "idle" | "preparing" | "attacking" | "capturing" | "complete";

// إنذار الكشف
export interface DetectionAlert {
  id: string;
  time: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  attackType: AttackType;
}

// سؤال الاختبار
export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// إحصائيات لوحة التحكم
export interface DashboardStats {
  totalAttacks: number;
  stolenData: number;
  securityScore: number;
  blockedAttacks: number;
}

// رسالة المساعد الذكي
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
}

// ═══ أنواع التحليل الأمني ═══

export interface CapturedToken {
  type: "jwt" | "session" | "csrf" | "cookie" | "auth";
  name: string;
  value: string;
  decoded?: Record<string, unknown>;
  risk: "critical" | "high" | "medium" | "low";
}

export interface NetworkAnalysis {
  totalPackets: number;
  capturedPackets: number;
  bytesTransferred: number;
  avgLatency: number;
  mitmOverhead: number;
  srcIP: string;
  dstIP: string;
  attackerIP: string;
  srcMAC: string;
  dstMAC: string;
  attackerMAC: string;
  tlsVersion?: string;
  cipherSuite?: string;
  certificateInfo?: {
    subject: string;
    issuer: string;
    validFrom: string;
    validTo: string;
    fingerprint: string;
    isValid: boolean;
  };
}

export interface Vulnerability {
  id: string;
  name: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
}

export interface AnalysisResult {
  tokens: CapturedToken[];
  network: NetworkAnalysis;
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
  hexDump: string[];
  riskScore: number;
  riskLevel: "critical" | "high" | "medium" | "low";
  vulnerabilities: Vulnerability[];
  recommendations: string[];
}
