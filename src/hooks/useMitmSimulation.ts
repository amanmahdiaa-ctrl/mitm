"use client";

import { useState, useCallback, useRef } from "react";
import type {
  LoginData,
  LogEntry,
  Protocol,
  SimulationPhase,
  AnalysisResult,
  CapturedToken,
  Vulnerability,
} from "@/types";

// ═══ أدوات توليد البيانات الواقعية ═══

function base64url(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function randomHex(len: number): string {
  return Array.from({ length: len }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
}

function generateJWT(username: string): {
  raw: string;
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
} {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: `uid_${randomHex(8)}`,
    name: username,
    email: `${username}@example.com`,
    role: "user",
    iat: now,
    exp: now + 3600,
    jti: randomHex(16),
  };
  const sig = randomHex(32);
  const raw = `${base64url(JSON.stringify(header))}.${base64url(
    JSON.stringify(payload)
  )}.${sig}`;
  return { raw, header, payload };
}

function generateHexDump(data: string): string[] {
  const lines: string[] = [];
  const bytes = Array.from(data).map((c) => c.charCodeAt(0));
  for (let i = 0; i < Math.min(bytes.length, 128); i += 16) {
    const chunk = bytes.slice(i, i + 16);
    const hex = chunk.map((b) => b.toString(16).padStart(2, "0")).join(" ");
    const ascii = chunk
      .map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : "."))
      .join("");
    const offset = i.toString(16).padStart(8, "0");
    lines.push(`${offset}  ${hex.padEnd(48)}  |${ascii}|`);
  }
  return lines;
}

function buildAnalysis(
  data: LoginData,
  protocol: Protocol
): AnalysisResult {
  const isHTTP = protocol === "http";
  const jwt = generateJWT(data.username);
  const sessionId = randomHex(32);
  const csrfToken = randomHex(24);
  const authBearer = `Bearer ${jwt.raw}`;

  const srcIP = `192.168.1.${105 + Math.floor(Math.random() * 50)}`;
  const attackerIP = "192.168.1.77";
  const serverIP = "93.184.216.34";
  const srcMAC = `AA:BB:CC:${randomHex(2)}:${randomHex(2)}:${randomHex(2)}`.toUpperCase();
  const attackerMAC = "DE:AD:BE:EF:00:77";
  const dstMAC = `00:1A:2B:${randomHex(2)}:${randomHex(2)}:${randomHex(2)}`.toUpperCase();

  // الرموز الملتقطة
  const tokens: CapturedToken[] = isHTTP
    ? [
        {
          type: "jwt",
          name: "Authorization Token (JWT)",
          value: jwt.raw,
          decoded: jwt.payload as Record<string, unknown>,
          risk: "critical",
        },
        {
          type: "session",
          name: "Session ID",
          value: sessionId,
          risk: "critical",
        },
        {
          type: "csrf",
          name: "CSRF Token",
          value: csrfToken,
          risk: "high",
        },
        {
          type: "cookie",
          name: "Auth Cookie",
          value: `auth=${jwt.raw.slice(0, 40)}...`,
          risk: "critical",
        },
        {
          type: "auth",
          name: "Basic Credentials",
          value: `${data.username}:${data.password}`,
          risk: "critical",
        },
      ]
    : [
        {
          type: "jwt",
          name: "Authorization Token (JWT)",
          value: "••• TLS ENCRYPTED •••",
          risk: "low",
        },
        {
          type: "session",
          name: "Session ID",
          value: "••• TLS ENCRYPTED •••",
          risk: "low",
        },
      ];

  // الثغرات المكتشفة
  const vulnerabilities: Vulnerability[] = isHTTP
    ? [
        {
          id: "CVE-HTTP-001",
          name: "نقل بيانات بدون تشفير",
          severity: "critical",
          description:
            "البيانات تُنقل كنص عادي عبر HTTP مما يسمح بقراءتها بالكامل",
        },
        {
          id: "CVE-TOKEN-002",
          name: "تسريب JWT Token",
          severity: "critical",
          description:
            "رمز JWT المميز مكشوف — يمكن استخدامه لانتحال هوية المستخدم",
        },
        {
          id: "CVE-SESS-003",
          name: "اختطاف الجلسة",
          severity: "critical",
          description:
            "معرّف الجلسة مرئي — يمكن سرقة الجلسة كاملة بدون كلمة مرور",
        },
        {
          id: "CVE-CSRF-004",
          name: "تسريب CSRF Token",
          severity: "high",
          description:
            "رمز CSRF مكشوف — يمكن تزوير طلبات باسم المستخدم",
        },
        {
          id: "CVE-PASS-005",
          name: "كلمة المرور مكشوفة",
          severity: "critical",
          description:
            "كلمة المرور مرسلة كنص عادي في جسم الطلب",
        },
      ]
    : [
        {
          id: "INFO-TLS-001",
          name: "اتصال مشفر",
          severity: "low",
          description: "TLS 1.3 يحمي جميع البيانات — لا يمكن قراءتها",
        },
      ];

  // بناء النص الخام للـ hex dump
  const rawBody = isHTTP
    ? `POST /login HTTP/1.1\r\nHost: example.com\r\nContent-Type: application/x-www-form-urlencoded\r\nCookie: session=${sessionId}\r\nAuthorization: ${authBearer}\r\n\r\nusername=${data.username}&password=${data.password}&csrf=${csrfToken}`
    : `\\x17\\x03\\x03\\x00\\x45\\xa2\\xf8\\xc1\\x9b\\x3e\\x7d\\x4a\\x1c\\x82\\xfe\\x09\\xd7\\x63\\x5b\\x21\\xa0\\xe4\\xb8\\xcc\\x74\\x10\\xf5\\x3d\\x6e\\x91\\x2b\\x87`;

  const reqHeaders: Record<string, string> = isHTTP
    ? {
        Method: "POST",
        URL: "http://example.com/login",
        Host: "example.com",
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: `session_id=${sessionId}`,
        Authorization: authBearer.slice(0, 60) + "...",
        "X-CSRF-Token": csrfToken,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        Accept: "text/html,application/json",
        Connection: "keep-alive",
      }
    : {
        Method: "POST",
        URL: "https://example.com/login",
        Protocol: "TLS 1.3",
        Cipher: "TLS_AES_256_GCM_SHA384",
        "Content-Type": "••• مشفّر •••",
        Authorization: "••• مشفّر •••",
        Payload: "17 03 03 00 45 a2 f8 c1 9b ...",
      };

  const resHeaders: Record<string, string> = isHTTP
    ? {
        Status: "200 OK",
        "Set-Cookie": `session=${sessionId}; Path=/`,
        "Content-Type": "application/json",
        Server: "nginx/1.24.0",
        Body: `{"status":"ok","user":"${data.username}","token":"${jwt.raw.slice(0, 30)}..."}`,
      }
    : {
        Status: "200 OK (encrypted)",
        "Content-Type": "••• مشفّر •••",
        Protocol: "HTTP/2 over TLS 1.3",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
      };

  const packetCount = 24 + Math.floor(Math.random() * 12);
  const bytesBase = isHTTP ? 2048 : 3200;

  return {
    tokens,
    network: {
      totalPackets: packetCount,
      capturedPackets: isHTTP ? packetCount : 0,
      bytesTransferred: bytesBase + Math.floor(Math.random() * 800),
      avgLatency: 12 + Math.floor(Math.random() * 8),
      mitmOverhead: isHTTP ? 3 + Math.floor(Math.random() * 4) : 0,
      srcIP,
      dstIP: serverIP,
      attackerIP,
      srcMAC,
      dstMAC,
      attackerMAC,
      tlsVersion: isHTTP ? undefined : "TLS 1.3",
      cipherSuite: isHTTP ? undefined : "TLS_AES_256_GCM_SHA384",
      certificateInfo: isHTTP
        ? undefined
        : {
            subject: "CN=example.com",
            issuer: "CN=R3, O=Let's Encrypt, C=US",
            validFrom: "2025-01-15",
            validTo: "2026-04-15",
            fingerprint: `SHA256:${randomHex(32).toUpperCase()}`,
            isValid: true,
          },
    },
    requestHeaders: reqHeaders,
    responseHeaders: resHeaders,
    hexDump: generateHexDump(rawBody),
    riskScore: isHTTP ? 95 : 8,
    riskLevel: isHTTP ? "critical" : "low",
    vulnerabilities,
    recommendations: isHTTP
      ? [
          "استخدم HTTPS بدلاً من HTTP",
          "فعّل HSTS على الخادم",
          "استخدم شهادة SSL/TLS صالحة",
          "فعّل HttpOnly و Secure على الكوكيز",
          "استخدم Certificate Pinning",
        ]
      : [
          "الاتصال يستخدم HTTPS — الحماية فعّالة ✓",
          "تأكد من تحديث شهادة TLS بانتظام",
        ],
  };
}

// ═══ الأصوات ═══

function playBeep(
  type: "intercept" | "send" | "deliver" | "success" | "blocked"
) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const config: Record<
      string,
      { freq: number; dur: number; wave: OscillatorType }
    > = {
      intercept: { freq: 880, dur: 0.15, wave: "sawtooth" },
      send: { freq: 440, dur: 0.1, wave: "sine" },
      deliver: { freq: 660, dur: 0.12, wave: "triangle" },
      success: { freq: 523, dur: 0.2, wave: "sine" },
      blocked: { freq: 200, dur: 0.3, wave: "square" },
    };

    const c = config[type];
    osc.type = c.wave;
    osc.frequency.setValueAtTime(c.freq, ctx.currentTime);

    if (type === "success")
      osc.frequency.linearRampToValueAtTime(784, ctx.currentTime + c.dur);
    if (type === "intercept")
      osc.frequency.linearRampToValueAtTime(440, ctx.currentTime + c.dur);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + c.dur);

    osc.start();
    osc.stop(ctx.currentTime + c.dur + 0.05);
  } catch {
    // ignore
  }
}

// ═══ الهوك الرئيسي ═══

export function useMitmSimulation() {
  const [protocol, setProtocol] = useState<Protocol>("http");
  const [phase, setPhase] = useState<SimulationPhase>("idle");
  const [loginData, setLoginData] = useState<LoginData | null>(null);
  const [interceptedData, setInterceptedData] = useState<LoginData | null>(
    null
  );
  const [serverData, setServerData] = useState<LoginData | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [analysisResult, setAnalysisResult] =
    useState<AnalysisResult | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playInterceptSound = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio("/sounds/intercept.mp3");
        audioRef.current.volume = 0.3;
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } catch {
      // ignore
    }
  }, []);

  const addLog = useCallback((data: LoginData, isSecure: boolean) => {
    const now = new Date();
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      time: now.toLocaleTimeString("ar-SA"),
      username: isSecure ? "••••••" : data.username,
      password: isSecure ? "••••••" : data.password,
      status: isSecure ? "secure" : "intercepted",
    };
    setLogs((prev) => [entry, ...prev]);
  }, []);

  const startSimulation = useCallback(
    (data: LoginData) => {
      const isSecure = protocol === "https";

      setInterceptedData(null);
      setServerData(null);
      setLoginData(data);
      setAnalysisResult(null);

      // المرحلة 1: إرسال البيانات
      setPhase("sending");
      playBeep("send");

      setTimeout(() => {
        // المرحلة 2: اعتراض البيانات
        setPhase("intercepting");

        if (!isSecure) {
          setInterceptedData(data);
          playInterceptSound();
          playBeep("intercept");
        } else {
          setInterceptedData({
            username: "🔒 مشفّر",
            password: "🔒 مشفّر",
          });
          playBeep("blocked");
        }

        // توليد التحليل أثناء الاعتراض
        const analysis = buildAnalysis(data, protocol);
        setTimeout(() => {
          setAnalysisResult(analysis);
        }, 2000);

        setTimeout(() => {
          // المرحلة 3: توصيل البيانات
          setPhase("delivering");
          playBeep("deliver");

          setTimeout(() => {
            setServerData(data);
            setPhase("complete");
            addLog(data, isSecure);
            playBeep("success");

            setTimeout(() => {
              setPhase("idle");
            }, 8000);
          }, 3500);
        }, 5000);
      }, 3500);
    },
    [protocol, playInterceptSound, addLog]
  );

  const reset = useCallback(() => {
    setPhase("idle");
    setLoginData(null);
    setInterceptedData(null);
    setServerData(null);
    setAnalysisResult(null);
  }, []);

  return {
    protocol,
    setProtocol,
    phase,
    loginData,
    interceptedData,
    serverData,
    logs,
    analysisResult,
    startSimulation,
    reset,
  };
}
