import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT = `أنت مساعد أمن سيبراني متخصص. اسمك "المساعد الأمني". أنت جزء من منصة تعليمية لمحاكاة هجمات الأمن السيبراني.

مهمتك:
- الإجابة على أسئلة المستخدمين حول الأمن السيبراني بشكل تعليمي ومفصل
- شرح أنواع الهجمات مثل MITM، ARP Spoofing، DNS Spoofing، SSL Stripping، Session Hijacking، Evil Twin، Packet Sniffing، HTTPS Spoofing، Email Hijacking، التصيد الاحتيالي، هجمات القوة الغاشمة
- شرح طرق الحماية والكشف عن الهجمات
- تقديم نصائح عملية لتعزيز الأمان الرقمي
- شرح المفاهيم التقنية مثل التشفير، الشهادات الرقمية، بروتوكولات الشبكة، الجدران النارية، VPN

القواعد:
- أجب دائماً باللغة العربية
- كن تعليمياً ومفيداً
- لا تساعد في تنفيذ هجمات حقيقية على أنظمة بدون إذن
- وضّح أن المعلومات للأغراض التعليمية فقط
- استخدم أمثلة عملية وتشبيهات بسيطة
- اجعل إجاباتك منظمة باستخدام النقاط والعناوين`;

export async function POST(req: NextRequest) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "لم يتم تكوين مفتاح API" },
      { status: 500 }
    );
  }

  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "الرسالة مطلوبة" },
        { status: 400 }
      );
    }

    // Build messages array with conversation history
    const messages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...((history ?? []) as { role: string; content: string }[])
        .slice(-10) // Keep last 10 messages for context
        .map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      { role: "user" as const, content: message },
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenAI API error:", response.status, errorData);
      return NextResponse.json(
        { error: "حدث خطأ في الاتصال بالذكاء الاصطناعي" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content ?? "لم أتمكن من توليد إجابة.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع" },
      { status: 500 }
    );
  }
}
