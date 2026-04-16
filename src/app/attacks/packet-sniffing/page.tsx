"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Play,
  Square,
  RotateCcw,
  Filter,
  Monitor,
  Wifi,
  Server,
  Skull,
  Radio,
  ChevronDown,
  ChevronLeft,
  Activity,
  Shield,
  Info,
  Wrench,
  Bug,
  Lock,
  Layers,
  Search,
} from "lucide-react";
import PageShell from "@/components/PageShell";

/* ─── Types ─── */
interface Packet {
  id: number;
  time: string;
  src: string;
  dst: string;
  protocol: "TCP" | "HTTP" | "DNS" | "ARP" | "HTTPS" | "UDP";
  length: number;
  info: string;
  srcMac: string;
  dstMac: string;
  srcPort?: number;
  dstPort?: number;
  ttl: number;
  flags?: string;
  payload?: string;
  hex: string;
}

/* ─── Colour map ─── */
const PROTO_COLOR: Record<string, string> = {
  TCP: "bg-purple-500/15 border-purple-500/30 text-purple-300",
  HTTP: "bg-green-500/15 border-green-500/30 text-green-300",
  DNS: "bg-blue-500/15 border-blue-500/30 text-blue-300",
  ARP: "bg-yellow-500/15 border-yellow-500/30 text-yellow-300",
  HTTPS: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
  UDP: "bg-orange-500/15 border-orange-500/30 text-orange-300",
};

const PROTO_BG: Record<string, string> = {
  TCP: "bg-purple-900/20 hover:bg-purple-900/30",
  HTTP: "bg-green-900/20 hover:bg-green-900/30",
  DNS: "bg-blue-900/20 hover:bg-blue-900/30",
  ARP: "bg-yellow-900/20 hover:bg-yellow-900/30",
  HTTPS: "bg-emerald-900/20 hover:bg-emerald-900/30",
  UDP: "bg-orange-900/20 hover:bg-orange-900/30",
};

/* ─── Mock packets ─── */
const ALL_PACKETS: Packet[] = [
  { id: 1, time: "0.000000", src: "192.168.1.105", dst: "192.168.1.1", protocol: "ARP", length: 42, info: "Who has 192.168.1.1? Tell 192.168.1.105", srcMac: "AA:BB:CC:11:22:33", dstMac: "FF:FF:FF:FF:FF:FF", ttl: 0, hex: "ff ff ff ff ff ff aa bb cc 11 22 33 08 06 00 01 08 00 06 04 00 01 aa bb cc 11 22 33 c0 a8 01 69 00 00 00 00 00 00 c0 a8 01 01" },
  { id: 2, time: "0.000342", src: "192.168.1.1", dst: "192.168.1.105", protocol: "ARP", length: 42, info: "192.168.1.1 is at DD:EE:FF:00:11:22", srcMac: "DD:EE:FF:00:11:22", dstMac: "AA:BB:CC:11:22:33", ttl: 0, hex: "aa bb cc 11 22 33 dd ee ff 00 11 22 08 06 00 01 08 00 06 04 00 02 dd ee ff 00 11 22 c0 a8 01 01 aa bb cc 11 22 33 c0 a8 01 69" },
  { id: 3, time: "0.512100", src: "192.168.1.105", dst: "93.184.216.34", protocol: "TCP", length: 66, info: "[SYN] Seq=0 Win=64240 Len=0 MSS=1460", srcMac: "AA:BB:CC:11:22:33", dstMac: "DD:EE:FF:00:11:22", srcPort: 49152, dstPort: 80, ttl: 64, flags: "SYN", hex: "dd ee ff 00 11 22 aa bb cc 11 22 33 08 00 45 00 00 34 1a 2b 40 00 40 06 a1 b2 c0 a8 01 69 5d b8 d8 22 c0 00 00 50 00 00 00 00" },
  { id: 4, time: "0.545230", src: "93.184.216.34", dst: "192.168.1.105", protocol: "TCP", length: 66, info: "[SYN, ACK] Seq=0 Ack=1 Win=65535", srcMac: "DD:EE:FF:00:11:22", dstMac: "AA:BB:CC:11:22:33", srcPort: 80, dstPort: 49152, ttl: 56, flags: "SYN, ACK", hex: "aa bb cc 11 22 33 dd ee ff 00 11 22 08 00 45 00 00 34 5f 3c 40 00 38 06 04 a1 5d b8 d8 22 c0 a8 01 69 00 50 c0 00 00 00 00 01" },
  { id: 5, time: "0.545500", src: "192.168.1.105", dst: "93.184.216.34", protocol: "TCP", length: 54, info: "[ACK] Seq=1 Ack=1 Win=64240", srcMac: "AA:BB:CC:11:22:33", dstMac: "DD:EE:FF:00:11:22", srcPort: 49152, dstPort: 80, ttl: 64, flags: "ACK", hex: "dd ee ff 00 11 22 aa bb cc 11 22 33 08 00 45 00 00 28 1a 2c 40 00 40 06 a1 bd c0 a8 01 69 5d b8 d8 22 c0 00 00 50 00 00 00 01" },
  { id: 6, time: "1.023400", src: "192.168.1.105", dst: "8.8.8.8", protocol: "DNS", length: 74, info: "Standard query A bank.example.com", srcMac: "AA:BB:CC:11:22:33", dstMac: "DD:EE:FF:00:11:22", srcPort: 53214, dstPort: 53, ttl: 64, hex: "dd ee ff 00 11 22 aa bb cc 11 22 33 08 00 45 00 00 3c 2b 3c 40 00 40 06 00 00 c0 a8 01 69 08 08 08 08 cf de 00 35 04 62 61 6e 6b" },
  { id: 7, time: "1.056100", src: "8.8.8.8", dst: "192.168.1.105", protocol: "DNS", length: 90, info: "Standard query response A bank.example.com → 93.184.216.34", srcMac: "DD:EE:FF:00:11:22", dstMac: "AA:BB:CC:11:22:33", srcPort: 53, dstPort: 53214, ttl: 128, hex: "aa bb cc 11 22 33 dd ee ff 00 11 22 08 00 45 00 00 4c 3c 4d 00 00 80 11 00 00 08 08 08 08 c0 a8 01 69 00 35 cf de 93 b8 d8 22" },
  { id: 8, time: "2.103000", src: "192.168.1.105", dst: "93.184.216.34", protocol: "HTTP", length: 310, info: "GET /login HTTP/1.1", srcMac: "AA:BB:CC:11:22:33", dstMac: "DD:EE:FF:00:11:22", srcPort: 49152, dstPort: 80, ttl: 64, flags: "PSH, ACK", payload: "GET /login HTTP/1.1\r\nHost: bank.example.com\r\nUser-Agent: Mozilla/5.0\r\nAccept: text/html\r\nCookie: session_id=abc123", hex: "47 45 54 20 2f 6c 6f 67 69 6e 20 48 54 54 50 2f 31 2e 31 0d 0a 48 6f 73 74 3a 20 62 61 6e 6b 2e 65 78 61 6d 70 6c 65 2e 63 6f 6d" },
  { id: 9, time: "3.245100", src: "93.184.216.34", dst: "192.168.1.105", protocol: "HTTP", length: 840, info: "HTTP/1.1 200 OK (text/html)", srcMac: "DD:EE:FF:00:11:22", dstMac: "AA:BB:CC:11:22:33", srcPort: 80, dstPort: 49152, ttl: 56, flags: "PSH, ACK", payload: "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nSet-Cookie: session_id=abc123\r\n\r\n<html><form action='/login'>...</form></html>", hex: "48 54 54 50 2f 31 2e 31 20 32 30 30 20 4f 4b 0d 0a 43 6f 6e 74 65 6e 74 2d 54 79 70 65 3a 20 74 65 78 74 2f 68 74 6d 6c" },
  { id: 10, time: "5.410300", src: "192.168.1.105", dst: "93.184.216.34", protocol: "HTTP", length: 284, info: "POST /login HTTP/1.1 (application/x-www-form-urlencoded)", srcMac: "AA:BB:CC:11:22:33", dstMac: "DD:EE:FF:00:11:22", srcPort: 49152, dstPort: 80, ttl: 64, flags: "PSH, ACK", payload: "POST /login HTTP/1.1\r\nHost: bank.example.com\r\nContent-Type: application/x-www-form-urlencoded\r\n\r\nusername=admin&password=secret123", hex: "50 4f 53 54 20 2f 6c 6f 67 69 6e 20 48 54 54 50 2f 31 2e 31 0d 0a 75 73 65 72 6e 61 6d 65 3d 61 64 6d 69 6e 26 70 61 73 73 77 6f 72 64 3d 73 65 63 72 65 74 31 32 33" },
  { id: 11, time: "6.820100", src: "192.168.1.105", dst: "93.184.216.34", protocol: "HTTPS", length: 583, info: "Application Data [TLS 1.3] (encrypted)", srcMac: "AA:BB:CC:11:22:33", dstMac: "DD:EE:FF:00:11:22", srcPort: 49200, dstPort: 443, ttl: 64, flags: "PSH, ACK", payload: "\\x17\\x03\\x03\\x02\\x43...encrypted payload...\\xa3\\xf1\\x09", hex: "17 03 03 02 43 a1 b2 c3 d4 e5 f6 07 08 09 0a 0b 0c 0d 0e 0f 10 11 12 13 14 15 16 17 18 19 1a 1b" },
  { id: 12, time: "7.930500", src: "192.168.1.105", dst: "8.8.8.8", protocol: "DNS", length: 70, info: "Standard query A api.example.com", srcMac: "AA:BB:CC:11:22:33", dstMac: "DD:EE:FF:00:11:22", srcPort: 54100, dstPort: 53, ttl: 64, hex: "dd ee ff 00 11 22 aa bb cc 11 22 33 08 00 45 00 00 38 3c 4e 40 00 40 06 00 00 c0 a8 01 69 08 08 08 08 d3 54 00 35" },
  { id: 13, time: "9.110200", src: "192.168.1.105", dst: "93.184.216.34", protocol: "TCP", length: 54, info: "[FIN, ACK] Seq=285 Ack=841 Win=64240", srcMac: "AA:BB:CC:11:22:33", dstMac: "DD:EE:FF:00:11:22", srcPort: 49152, dstPort: 80, ttl: 64, flags: "FIN, ACK", hex: "dd ee ff 00 11 22 aa bb cc 11 22 33 08 00 45 00 00 28 1a 30 40 00 40 06 a1 b9 c0 a8 01 69 5d b8 d8 22 c0 00 00 50" },
  { id: 14, time: "10.510000", src: "192.168.1.105", dst: "93.184.216.34", protocol: "HTTP", length: 356, info: "GET /api/account/balance HTTP/1.1", srcMac: "AA:BB:CC:11:22:33", dstMac: "DD:EE:FF:00:11:22", srcPort: 49300, dstPort: 80, ttl: 64, flags: "PSH, ACK", payload: "GET /api/account/balance HTTP/1.1\r\nHost: bank.example.com\r\nAuthorization: Bearer eyJhbGciOiJIUzI1NiJ9...\r\nCookie: session_id=abc123", hex: "47 45 54 20 2f 61 70 69 2f 61 63 63 6f 75 6e 74 2f 62 61 6c 61 6e 63 65 20 48 54 54 50 2f 31 2e 31" },
  { id: 15, time: "12.230000", src: "192.168.1.100", dst: "192.168.1.255", protocol: "ARP", length: 42, info: "Who has 192.168.1.105? Tell 192.168.1.100", srcMac: "11:22:33:44:55:66", dstMac: "FF:FF:FF:FF:FF:FF", ttl: 0, hex: "ff ff ff ff ff ff 11 22 33 44 55 66 08 06 00 01 08 00 06 04 00 01 11 22 33 44 55 66 c0 a8 01 64 00 00 00 00 00 00 c0 a8 01 69" },
  { id: 16, time: "14.800200", src: "192.168.1.105", dst: "93.184.216.34", protocol: "HTTPS", length: 490, info: "Client Hello [TLS 1.3]", srcMac: "AA:BB:CC:11:22:33", dstMac: "DD:EE:FF:00:11:22", srcPort: 49400, dstPort: 443, ttl: 64, flags: "PSH, ACK", payload: "\\x16\\x03\\x01\\x02\\x00...Client Hello...cipher_suites=[TLS_AES_256_GCM_SHA384, TLS_CHACHA20_POLY1305_SHA256]", hex: "16 03 01 02 00 01 00 01 fc 03 03 a1 b2 c3 d4 e5 f6 07 08 09 0a 0b 0c 0d 0e 0f 10 11 12 13 14" },
  { id: 17, time: "16.012000", src: "192.168.1.105", dst: "93.184.216.34", protocol: "HTTP", length: 298, info: "POST /api/transfer HTTP/1.1", srcMac: "AA:BB:CC:11:22:33", dstMac: "DD:EE:FF:00:11:22", srcPort: 49500, dstPort: 80, ttl: 64, flags: "PSH, ACK", payload: "POST /api/transfer HTTP/1.1\r\nHost: bank.example.com\r\nContent-Type: application/json\r\n\r\n{\"to\":\"attacker_account\",\"amount\":5000}", hex: "50 4f 53 54 20 2f 61 70 69 2f 74 72 61 6e 73 66 65 72 20 48 54 54 50 2f 31 2e 31 0d 0a 7b 22 74 6f 22 3a 22 61 74 74 22 7d" },
  { id: 18, time: "17.500100", src: "93.184.216.34", dst: "192.168.1.105", protocol: "TCP", length: 54, info: "[RST] Seq=842 Win=0", srcMac: "DD:EE:FF:00:11:22", dstMac: "AA:BB:CC:11:22:33", srcPort: 80, dstPort: 49500, ttl: 56, flags: "RST", hex: "aa bb cc 11 22 33 dd ee ff 00 11 22 08 00 45 00 00 28 5f 40 40 00 38 06 04 99 5d b8 d8 22 c0 a8 01 69 00 50 c1 74" },
  { id: 19, time: "18.920000", src: "192.168.1.105", dst: "8.8.8.8", protocol: "DNS", length: 68, info: "Standard query AAAA bank.example.com", srcMac: "AA:BB:CC:11:22:33", dstMac: "DD:EE:FF:00:11:22", srcPort: 55010, dstPort: 53, ttl: 64, hex: "dd ee ff 00 11 22 aa bb cc 11 22 33 08 00 45 00 00 36 4e 5f 40 00 40 06 00 00 c0 a8 01 69 08 08 08 08 d6 e2 00 35" },
  { id: 20, time: "19.800000", src: "192.168.1.105", dst: "93.184.216.34", protocol: "HTTPS", length: 610, info: "Application Data [TLS 1.3] (encrypted)", srcMac: "AA:BB:CC:11:22:33", dstMac: "DD:EE:FF:00:11:22", srcPort: 49400, dstPort: 443, ttl: 64, flags: "PSH, ACK", payload: "\\x17\\x03\\x03\\x02\\x60...encrypted_data...\\xfe\\xdc\\xba", hex: "17 03 03 02 60 c1 d2 e3 f4 05 16 27 38 49 5a 6b 7c 8d 9e af b0 c1 d2 e3 f4 05 16 27 38 49 5a 6b" },
];

const INTERFACES = ["eth0", "wlan0", "lo"];

export default function PacketSniffingPage() {
  const [capturing, setCapturing] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const [selectedPacket, setSelectedPacket] = useState<Packet | null>(null);
  const [filterText, setFilterText] = useState("");
  const [selectedInterface, setSelectedInterface] = useState("eth0");
  const [promiscuous, setPromiscuous] = useState(true);
  const [expandedLayers, setExpandedLayers] = useState<Record<string, boolean>>({ ethernet: true, ipv4: true, transport: true, app: true });
  const [animatingPkt, setAnimatingPkt] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);

  /* protocol stats */
  const capturedPackets = ALL_PACKETS.slice(0, visibleCount);
  const protocolCounts: Record<string, number> = {};
  let totalBytes = 0;
  capturedPackets.forEach((p) => {
    protocolCounts[p.protocol] = (protocolCounts[p.protocol] || 0) + 1;
    totalBytes += p.length;
  });
  const topTalkers: Record<string, number> = {};
  capturedPackets.forEach((p) => {
    topTalkers[p.src] = (topTalkers[p.src] || 0) + 1;
    topTalkers[p.dst] = (topTalkers[p.dst] || 0) + 1;
  });
  const sortedTalkers = Object.entries(topTalkers).sort((a, b) => b[1] - a[1]).slice(0, 4);

  /* filter logic */
  const filteredPackets = capturedPackets.filter((p) => {
    if (!filterText) return true;
    const f = filterText.toLowerCase();
    if (f === "http") return p.protocol === "HTTP";
    if (f === "https") return p.protocol === "HTTPS";
    if (f === "dns") return p.protocol === "DNS";
    if (f === "arp") return p.protocol === "ARP";
    if (f === "tcp") return p.protocol === "TCP" || p.protocol === "HTTP" || p.protocol === "HTTPS";
    if (f === "udp") return p.protocol === "UDP" || p.protocol === "DNS";
    if (f.startsWith("tcp.port==")) { const port = parseInt(f.split("==")[1]); return p.srcPort === port || p.dstPort === port; }
    if (f.startsWith("ip.addr==")) { const ip = f.split("==")[1]; return p.src === ip || p.dst === ip; }
    return p.info.toLowerCase().includes(f) || p.src.includes(f) || p.dst.includes(f);
  });

  const cleanup = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);
  useEffect(() => () => cleanup(), [cleanup]);

  const startCapture = () => {
    cleanup();
    setCapturing(true);
    setVisibleCount(0);
    setSelectedPacket(null);
    startTimeRef.current = Date.now();
    let count = 0;
    timerRef.current = setInterval(() => {
      count++;
      if (count > ALL_PACKETS.length) { cleanup(); setCapturing(false); return; }
      setVisibleCount(count);
      setAnimatingPkt(count - 1);
    }, 1000);
  };

  const stopCapture = () => { cleanup(); setCapturing(false); };
  const resetCapture = () => { cleanup(); setCapturing(false); setVisibleCount(0); setSelectedPacket(null); setAnimatingPkt(-1); };

  const toggleLayer = (layer: string) => setExpandedLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));

  useEffect(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, [visibleCount]);

  const pps = capturing ? (visibleCount / Math.max((Date.now() - startTimeRef.current) / 1000, 0.1)).toFixed(1) : "0.0";

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
        {/* ───── HEADER ───── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Eye className="w-9 h-9 text-cyan-400" />
            <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-cyan-400 via-purple-400 to-red-400 bg-clip-text text-transparent">
              التقاط وتحليل الحزم
            </h1>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
            هجوم التقاط الحزم يسمح للمهاجم بمراقبة وتسجيل كل حركة المرور عبر الشبكة باستخدام بطاقة الشبكة في الوضع المختلط (Promiscuous Mode)
          </p>
        </motion.div>

        {/* ───── CONTROL PANEL ───── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-gray-950/80 border border-gray-700/50 rounded-2xl p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Capture/Stop */}
            <button onClick={capturing ? stopCapture : startCapture} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${capturing ? "bg-red-600 hover:bg-red-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}`}>
              {capturing ? <><Square className="w-4 h-4" /> إيقاف</> : <><Play className="w-4 h-4" /> بدء الالتقاط</>}
            </button>
            <button onClick={resetCapture} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 transition-all">
              <RotateCcw className="w-4 h-4" /> إعادة تعيين
            </button>

            {/* Filter */}
            <div className="flex items-center gap-2 bg-gray-800/80 border border-gray-600/50 rounded-lg px-3 py-1.5 flex-1 min-w-50">
              <Filter className="w-4 h-4 text-gray-400 shrink-0" />
              <input value={filterText} onChange={(e) => setFilterText(e.target.value)} placeholder='فلتر: http, dns, tcp.port==80, ip.addr==192.168.1.105' className="bg-transparent text-sm text-gray-200 placeholder-gray-500 outline-none w-full font-mono" dir="ltr" />
            </div>

            {/* Interface */}
            <select value={selectedInterface} onChange={(e) => setSelectedInterface(e.target.value)} className="bg-gray-800 border border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none">
              {INTERFACES.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>

            {/* Promiscuous */}
            <button onClick={() => setPromiscuous(!promiscuous)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all ${promiscuous ? "bg-cyan-600/20 border-cyan-500/50 text-cyan-300" : "bg-gray-800 border-gray-600/50 text-gray-400"}`}>
              <Radio className={`w-4 h-4 ${promiscuous ? "animate-pulse" : ""}`} />
              الوضع المختلط
            </button>

            {/* Counter */}
            <div className="text-sm text-gray-400 font-mono">
              الحزم: <span className="text-cyan-400">{visibleCount}</span>
            </div>
          </div>
        </motion.div>

        {/* ───── WIRESHARK-STYLE PACKET CAPTURE ───── */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-gray-950/80 border border-gray-700/50 rounded-2xl overflow-hidden mb-6">
          <div className="px-4 py-2 border-b border-gray-700/50 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-cyan-400">واجهة التقاط الحزم — {selectedInterface}</h2>
            {capturing && <span className="mr-auto inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
          </div>

          {/* Packet List Table */}
          <div ref={listRef} className="overflow-auto max-h-95 custom-scrollbar" dir="ltr">
            <table className="w-full text-xs font-mono">
              <thead className="sticky top-0 z-10 bg-gray-900 text-gray-400 border-b border-gray-700/50">
                <tr>
                  <th className="px-2 py-1.5 text-left w-12">No.</th>
                  <th className="px-2 py-1.5 text-left w-24">Time</th>
                  <th className="px-2 py-1.5 text-left w-32">Source</th>
                  <th className="px-2 py-1.5 text-left w-32">Destination</th>
                  <th className="px-2 py-1.5 text-left w-16">Protocol</th>
                  <th className="px-2 py-1.5 text-left w-16">Length</th>
                  <th className="px-2 py-1.5 text-left">Info</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredPackets.map((pkt) => (
                    <motion.tr
                      key={pkt.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`cursor-pointer border-b border-gray-800/40 transition-colors ${PROTO_BG[pkt.protocol]} ${selectedPacket?.id === pkt.id ? "bg-cyan-800/30! ring-1 ring-cyan-500/40" : ""}`}
                      onClick={() => setSelectedPacket(pkt)}
                    >
                      <td className="px-2 py-1">{pkt.id}</td>
                      <td className="px-2 py-1 text-gray-400">{pkt.time}</td>
                      <td className="px-2 py-1">{pkt.src}</td>
                      <td className="px-2 py-1">{pkt.dst}</td>
                      <td className="px-2 py-1"><span className={`px-1.5 py-0.5 rounded text-[10px] border ${PROTO_COLOR[pkt.protocol]}`}>{pkt.protocol}</span></td>
                      <td className="px-2 py-1 text-gray-400">{pkt.length}</td>
                      <td className="px-2 py-1 text-gray-300 truncate max-w-75">{pkt.info}</td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            {visibleCount === 0 && (
              <div className="text-center py-12 text-gray-600 text-sm">اضغط &quot;بدء الالتقاط&quot; لبدء التقاط الحزم...</div>
            )}
          </div>
        </motion.div>

        {/* ───── PACKET INSPECTOR + HEX DUMP ───── */}
        <AnimatePresence>
          {selectedPacket && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="grid md:grid-cols-2 gap-4 mb-6">
              {/* Inspector */}
              <div className="bg-gray-950/80 border border-gray-700/50 rounded-2xl p-4 overflow-hidden">
                <h3 className="text-sm font-bold text-cyan-400 mb-3 flex items-center gap-2"><Layers className="w-4 h-4" /> تحليل طبقات الحزمة #{selectedPacket.id}</h3>
                <div className="font-mono text-xs space-y-1" dir="ltr">
                  {/* Ethernet */}
                  <LayerBlock title="Ethernet II" color="purple" open={expandedLayers.ethernet} toggle={() => toggleLayer("ethernet")}>
                    <div>Src: {selectedPacket.srcMac}</div>
                    <div>Dst: {selectedPacket.dstMac}</div>
                    <div>Type: {selectedPacket.protocol === "ARP" ? "0x0806 (ARP)" : "0x0800 (IPv4)"}</div>
                  </LayerBlock>
                  {/* IPv4 */}
                  {selectedPacket.protocol !== "ARP" && (
                    <LayerBlock title="IPv4" color="blue" open={expandedLayers.ipv4} toggle={() => toggleLayer("ipv4")}>
                      <div>Src: {selectedPacket.src}</div>
                      <div>Dst: {selectedPacket.dst}</div>
                      <div>TTL: {selectedPacket.ttl} | Protocol: {selectedPacket.protocol === "DNS" || selectedPacket.protocol === "UDP" ? "UDP (17)" : "TCP (6)"}</div>
                    </LayerBlock>
                  )}
                  {/* Transport */}
                  {selectedPacket.srcPort && (
                    <LayerBlock title={selectedPacket.protocol === "DNS" || selectedPacket.protocol === "UDP" ? "UDP" : "TCP"} color="green" open={expandedLayers.transport} toggle={() => toggleLayer("transport")}>
                      <div>Src Port: {selectedPacket.srcPort}</div>
                      <div>Dst Port: {selectedPacket.dstPort}</div>
                      {selectedPacket.flags && <div>Flags: [{selectedPacket.flags}]</div>}
                    </LayerBlock>
                  )}
                  {/* Application */}
                  {selectedPacket.payload && (
                    <LayerBlock title={selectedPacket.protocol} color="yellow" open={expandedLayers.app} toggle={() => toggleLayer("app")}>
                      {selectedPacket.payload.split("\r\n").map((l, i) => <div key={i} className={l.includes("password") || l.includes("secret") ? "text-red-400 font-bold" : ""}>{l}</div>)}
                    </LayerBlock>
                  )}
                </div>
              </div>
              {/* Hex Dump */}
              <div className="bg-gray-950/80 border border-gray-700/50 rounded-2xl p-4 overflow-hidden">
                <h3 className="text-sm font-bold text-cyan-400 mb-3 flex items-center gap-2"><Search className="w-4 h-4" /> البيانات الخام (Hex Dump)</h3>
                <div className="font-mono text-[11px] text-green-400/80 bg-black/40 rounded-lg p-3 overflow-auto max-h-60 leading-5 whitespace-pre-wrap break-all" dir="ltr">
                  {formatHex(selectedPacket.hex)}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ───── SVG NETWORK VISUALIZATION ───── */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="bg-gray-950/80 border border-gray-700/50 rounded-2xl p-4 mb-6 overflow-hidden">
          <h2 className="text-sm font-bold text-cyan-400 mb-3 flex items-center gap-2" dir="rtl"><Eye className="w-5 h-5" /> مشهد الشبكة — الوضع المختلط</h2>
          <svg viewBox="0 0 800 340" className="w-full h-auto">
            <defs>
              <filter id="glow-c"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              <filter id="glow-r"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>
            {/* Hub/Switch */}
            <rect x="340" y="120" width="120" height="50" rx="10" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
            <text x="400" y="150" textAnchor="middle" fill="#94a3b8" fontSize="12" fontFamily="monospace">Switch / Hub</text>
            {/* Victim */}
            <rect x="50" y="125" width="120" height="50" rx="10" fill="#1e293b" stroke="#22d3ee" strokeWidth="1.5" filter="url(#glow-c)" />
            <text x="110" y="146" textAnchor="middle" fill="#22d3ee" fontSize="11" fontFamily="monospace">Victim</text>
            <text x="110" y="163" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">192.168.1.105</text>
            {/* Attacker */}
            <rect x="340" y="250" width="120" height="60" rx="10" fill="#1e293b" stroke="#ef4444" strokeWidth="1.5" filter="url(#glow-r)" />
            <text x="400" y="272" textAnchor="middle" fill="#ef4444" fontSize="11" fontFamily="monospace">Attacker (NIC)</text>
            <text x="400" y="289" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">192.168.1.77</text>
            {promiscuous && <text x="400" y="303" textAnchor="middle" fill="#f59e0b" fontSize="8" fontFamily="monospace">⚡ Promiscuous Mode</text>}
            {promiscuous && (
              <motion.circle cx="400" cy="280" r="4" fill="#f59e0b" initial={{ opacity: 0.3 }} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} />
            )}
            {/* Server */}
            <rect x="630" y="125" width="120" height="50" rx="10" fill="#1e293b" stroke="#a855f7" strokeWidth="1.5" />
            <text x="690" y="146" textAnchor="middle" fill="#a855f7" fontSize="11" fontFamily="monospace">Server</text>
            <text x="690" y="163" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">93.184.216.34</text>
            {/* Lines */}
            <line x1="170" y1="150" x2="340" y2="150" stroke="#475569" strokeWidth="1.5" />
            <line x1="460" y1="150" x2="630" y2="150" stroke="#475569" strokeWidth="1.5" />
            <line x1="400" y1="170" x2="400" y2="250" stroke="#475569" strokeWidth="1.5" strokeDasharray="6 4" />
            {/* Animated packets */}
            {capturing && animatingPkt >= 0 && (
              <>
                <motion.circle r="5" fill="#22d3ee" filter="url(#glow-c)" initial={{ cx: 170, cy: 150 }} animate={{ cx: [170, 400, 630], cy: 150 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
                {promiscuous && (
                  <motion.circle r="4" fill="#ef4444" filter="url(#glow-r)" initial={{ cx: 400, cy: 150, opacity: 0 }} animate={{ cx: 400, cy: [150, 250], opacity: [0, 1, 1] }} transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.7, ease: "easeIn" }} />
                )}
              </>
            )}
          </svg>
        </motion.div>

        {/* ───── LIVE STATS DASHBOARD ───── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid md:grid-cols-4 gap-4 mb-6">
          {/* Protocol Distribution */}
          <div className="bg-gray-950/80 border border-gray-700/50 rounded-2xl p-4 md:col-span-2">
            <h3 className="text-sm font-bold text-cyan-400 mb-3" dir="rtl">توزيع البروتوكولات</h3>
            <div className="space-y-2">
              {(["TCP", "HTTP", "DNS", "ARP", "HTTPS", "UDP"] as const).map((proto) => {
                const count = protocolCounts[proto] || 0;
                const pct = visibleCount > 0 ? (count / visibleCount) * 100 : 0;
                return (
                  <div key={proto} className="flex items-center gap-2 text-xs">
                    <span className={`w-14 text-left font-mono border rounded px-1 py-0.5 ${PROTO_COLOR[proto]}`}>{proto}</span>
                    <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div className={`h-full rounded-full ${proto === "TCP" ? "bg-purple-500" : proto === "HTTP" ? "bg-green-500" : proto === "DNS" ? "bg-blue-500" : proto === "ARP" ? "bg-yellow-500" : proto === "HTTPS" ? "bg-emerald-500" : "bg-orange-500"}`} initial={{ width: 0 }} animate={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-gray-400 w-8 text-left font-mono">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
          {/* PPS + Bytes */}
          <div className="bg-gray-950/80 border border-gray-700/50 rounded-2xl p-4 flex flex-col items-center justify-center">
            <Activity className="w-6 h-6 text-green-400 mb-1" />
            <div className="text-2xl font-bold text-green-400 font-mono">{pps}</div>
            <div className="text-xs text-gray-500" dir="rtl">حزمة / ثانية</div>
            <div className="border-t border-gray-700/50 w-full my-2" />
            <div className="text-lg font-bold text-purple-400 font-mono">{totalBytes.toLocaleString()}</div>
            <div className="text-xs text-gray-500" dir="rtl">بايت ملتقط</div>
          </div>
          {/* Top Talkers */}
          <div className="bg-gray-950/80 border border-gray-700/50 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-cyan-400 mb-3" dir="rtl">أكثر العناوين نشاطاً</h3>
            <div className="space-y-2">
              {sortedTalkers.map(([ip, count]) => (
                <div key={ip} className="flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-300">{ip}</span>
                  <span className="text-cyan-400">{count}</span>
                </div>
              ))}
              {sortedTalkers.length === 0 && <div className="text-xs text-gray-600 text-center" dir="rtl">لا توجد بيانات</div>}
            </div>
          </div>
        </motion.div>

        {/* ───── ANALYSIS CARDS ───── */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="grid md:grid-cols-2 gap-4 mb-8">
          <InfoCard icon={<Info className="w-5 h-5 text-cyan-400" />} title="كيف يعمل التقاط الحزم؟" items={[
            "يضع المهاجم بطاقة الشبكة في الوضع المختلط (Promiscuous Mode)",
            "في هذا الوضع تستقبل البطاقة جميع الحزم وليس فقط الموجهة لها",
            "يتم نسخ كل حزمة تمر عبر الشبكة وتسجيلها للتحليل لاحقاً",
            "في شبكات Hub، جميع الحزم مرئية — في شبكات Switch يحتاج لتقنيات إضافية",
            "يمكن استخراج بيانات الدخول والكوكيز من الحزم غير المشفرة",
          ]} />
          <InfoCard icon={<Wrench className="w-5 h-5 text-green-400" />} title="أدوات التقاط الحزم" items={[
            "Wireshark — أشهر أداة لتحليل الحزم بواجهة رسومية",
            "tcpdump — أداة سطر أوامر قوية لالتقاط الحزم في Linux",
            "tshark — نسخة سطر الأوامر من Wireshark",
            "NetworkMiner — أداة تحليل شبكي متقدمة لاستخراج الملفات والصور",
            "Ettercap — أداة شاملة لهجمات MITM والتقاط الحزم",
          ]} />
          <InfoCard icon={<Bug className="w-5 h-5 text-purple-400" />} title="نموذج OSI والتقاط الحزم" items={[
            "الطبقة 2 (Data Link): التقاط إطارات Ethernet و MAC addresses",
            "الطبقة 3 (Network): تحليل عناوين IP والتوجيه",
            "الطبقة 4 (Transport): فحص منافذ TCP/UDP وحالة الاتصال",
            "الطبقة 7 (Application): استخراج بيانات HTTP, DNS, FTP وغيرها",
            "التقاط الحزم يعمل بشكل أساسي في الطبقة 2 ويحلل جميع الطبقات",
          ]} />
          <InfoCard icon={<Lock className="w-5 h-5 text-yellow-400" />} title="الحماية من التقاط الحزم" items={[
            "استخدام التشفير TLS/HTTPS لجميع الاتصالات",
            "استخدام VPN لتشفير كامل حركة المرور",
            "استخدام Switch بدلاً من Hub لتقليل البث",
            "تفعيل 802.1X للمصادقة على الشبكة",
            "مراقبة الشبكة لاكتشاف بطاقات في الوضع المختلط",
          ]} />
        </motion.div>
      </div>
    </PageShell>
  );
}

/* ───── LayerBlock component ───── */
function LayerBlock({ title, color, open, toggle, children }: { title: string; color: string; open: boolean; toggle: () => void; children: React.ReactNode }) {
  const borderColor = color === "purple" ? "border-purple-500/40" : color === "blue" ? "border-blue-500/40" : color === "green" ? "border-green-500/40" : "border-yellow-500/40";
  const textColor = color === "purple" ? "text-purple-400" : color === "blue" ? "text-blue-400" : color === "green" ? "text-green-400" : "text-yellow-400";
  return (
    <div className={`border-l-2 ${borderColor} rounded-r`}>
      <button onClick={toggle} className={`w-full flex items-center gap-1 px-2 py-1 text-left ${textColor} hover:bg-white/5 rounded-r transition-colors`}>
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        <span className="font-bold">{title}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-4 pb-1 text-gray-300 overflow-hidden">
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───── InfoCard component ───── */
function InfoCard({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <div className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3" dir="rtl">{icon}<h3 className="text-sm font-bold text-gray-200">{title}</h3></div>
      <ul className="space-y-1.5" dir="rtl">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
            <span className="text-cyan-500 mt-0.5 shrink-0">●</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ───── Hex formatter ───── */
function formatHex(hex: string): string {
  const bytes = hex.split(" ");
  let result = "";
  for (let i = 0; i < bytes.length; i += 16) {
    const chunk = bytes.slice(i, i + 16);
    const offset = i.toString(16).padStart(4, "0");
    const hexPart = chunk.join(" ").padEnd(47);
    const ascii = chunk.map((b) => { const n = parseInt(b, 16); return n >= 32 && n <= 126 ? String.fromCharCode(n) : "."; }).join("");
    result += `${offset}  ${hexPart}  |${ascii}|\n`;
  }
  return result;
}
