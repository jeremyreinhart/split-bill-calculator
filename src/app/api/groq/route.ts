import { NextResponse } from "next/server";
import axios from "axios";

interface ReceiptItem {
  name: string;
  price: number;
}

interface ParsedReceipt {
  items: ReceiptItem[];
  tax?: number | null;
  service?: number | null;
}

export async function POST(req: Request) {
  try {
    const { ocrText } = await req.json();

    if (!ocrText) {
      return NextResponse.json(
        { error: "OCR text is required" },
        { status: 400 },
      );
    }

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "You extract receipt text into clean JSON only. No explanation.",
          },
          {
            role: "user",
            content: `
Return JSON ONLY with this format:
{
  "items": [{ "name": string, "price": number }],
  "tax": number | null,
  "service": number | null
}

Receipt text:
${ocrText}
            `,
          },
        ],
        temperature: 0,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const raw = response.data.choices[0].message.content;

    const data: ParsedReceipt = JSON.parse(raw);

    const items = data.items ?? [];
    const subtotal = items.reduce(
      (sum: number, item: ReceiptItem) => sum + item.price,
      0,
    );

    const tax = data.tax ?? Math.round(subtotal * 0.1);
    const service = data.service ?? 0;

    return NextResponse.json({
      items,
      tax,
      service,
      total: subtotal + tax + service,
    });
  } catch (error) {
    console.error("GROQ ERROR:", error);
    return NextResponse.json(
      { error: "Groq processing failed" },
      { status: 500 },
    );
  }
}
