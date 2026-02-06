import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

    if (!ocrText || typeof ocrText !== "string") {
      return NextResponse.json(
        { error: "OCR text is required" },
        { status: 400 },
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You extract receipt text into clean JSON only.
No explanation. No markdown. No backticks.

Return JSON ONLY with this format:
{
  "items": [{ "name": string, "price": number }],
  "tax": number | null,
  "service": number | null
}

Rules:
- item name must be short and clean
- price must be number only
- ignore totals

Receipt text:
${ocrText}
`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text();

    console.log("GEMINI RAW:", raw);

    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");

    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("Invalid Gemini JSON output");
    }

    const cleanJson = raw.slice(jsonStart, jsonEnd + 1);
    const data: ParsedReceipt = JSON.parse(cleanJson);

    const items = data.items ?? [];

    const subtotal = items.reduce(
      (sum, item) => sum + (Number(item.price) || 0),
      0,
    );
    const tax =
      data.tax !== undefined && data.tax !== null
        ? Number(data.tax)
        : Math.round(subtotal * 0.1);
    const service = data.service ? Number(data.service) : 0;

    return NextResponse.json({
      items,
      tax,
      service,
      total: subtotal + tax + service,
    });
  } catch (error) {
    console.error("GEMINI ERROR:", error);
    return NextResponse.json(
      { error: "Gemini processing failed" },
      { status: 500 },
    );
  }
}
