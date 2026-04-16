import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "منصة محاكاة الأمن السيبراني - أداة تعليمية",
  description:
    "منصة تعليمية تفاعلية لمحاكاة الهجمات السيبرانية مثل MITM والتصيد والقوة الغاشمة وفهم طرق الحماية منها",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-(family-name:--font-cairo) bg-gray-950 text-white">
        {children}
      </body>
    </html>
  );
}
