"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ReceiptUploader from "@/components/ReceiptUploader";
import OCRResult from "@/components/OcrResult";
import SplitBill from "@/components/SplitBill";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [ocrText, setOcrText] = useState("");
  const [items, setItems] = useState<{ name: string; price: number }[]>([]);
  const [tax, setTax] = useState(0);
  const [service, setService] = useState(0);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price, 0),
    [items],
  );

  const total = subtotal + tax + service;

  const resetAll = () => {
    setFile(null);
    setOcrText("");
    setItems([]);
    setTax(0);
    setService(0);
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-900 via-teal-900 to-emerald-900">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-emerald-300 text-sm hover:text-emerald-200 mb-6"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Home
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
              <svg
                className="w-7 h-7 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Split Bill Scanner</h1>
          <p className="text-emerald-300/70 text-sm mt-2">
            Upload • Edit • Split
          </p>
        </div>
      </div>

      <section className="max-w-2xl mx-auto px-6 pb-12 space-y-6">
        <ReceiptUploader
          file={file}
          setFile={setFile}
          setOcrText={setOcrText}
          setItems={setItems}
          setTax={setTax}
          setService={setService}
        />

        {items.length > 0 && (
          <OCRResult
            ocrText={ocrText}
            items={items}
            tax={tax}
            service={service}
            reset={resetAll}
            onItemsChange={setItems}
          />
        )}

        {items.length > 0 && total > 0 && <SplitBill total={total} />}
      </section>

      <footer className="py-8 text-center text-xs text-emerald-300/40">
        Split Bill Calculator With OCR
      </footer>
    </main>
  );
}
