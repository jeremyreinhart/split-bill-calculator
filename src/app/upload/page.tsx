"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import ReceiptUploader from "@/components/ReceiptUploader";
import OCRResult from "@/components/OcrResult";
import SplitBill from "@/components/SplitBill";
import Link from "next/link";
import { MoveLeft } from "lucide-react";
import { useLocalStorage } from "@/hooks/local-storage";

// Helper untuk check apakah kita di client-side
const subscribe = () => () => {};
const useIsClient = () => {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
};

export default function UploadPage() {
  const [, setFile] = useState<File | null>(null);
  const isClient = useIsClient();

  const [ocrText, setOcrText] = useLocalStorage<string>("receipt_ocr_text", "");
  const [items, setItems] = useLocalStorage<{ name: string; price: number }[]>(
    "receipt_items",
    [],
  );
  const [tax, setTax] = useLocalStorage<number>("receipt_tax", 0);
  const [service, setService] = useLocalStorage<number>("receipt_service", 0);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price, 0),
    [items],
  );

  const calculatedTax = Math.round(subtotal * 0.1);
  const total = subtotal + calculatedTax + service;

  const clearAllLocalStorage = () => {
    // Clear receipt data
    localStorage.removeItem("receipt_ocr_text");
    localStorage.removeItem("receipt_items");
    localStorage.removeItem("receipt_tax");
    localStorage.removeItem("receipt_service");

    // Clear split bill data
    localStorage.removeItem("split_mode");
    localStorage.removeItem("split_people");
    localStorage.removeItem("split_item_assignments");
  };

  const resetAll = () => {
    setFile(null);
    setOcrText("");
    setItems([]);
    setTax(0);
    setService(0);

    clearAllLocalStorage();
  };

  const steps = [
    {
      id: "01",
      desc: "Photo struk",
    },
    {
      id: "02",
      desc: "Auto-detect items & prices",
    },
    {
      id: "03",
      desc: "Double check the results, edit if necessary.",
    },
    {
      id: "04",
      desc: "Choose split method",
    },
    {
      id: "05",
      desc: "Share to WhatsApp or Telegram",
    },
  ];

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-900 via-teal-900 to-emerald-900">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-emerald-300 text-sm hover:text-emerald-200 mb-6"
        >
          <MoveLeft />
          Back to Home
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Split Bill Calculator
          </h1>
        </div>
      </div>
      <section className="max-w-4xl mx-auto px-6 mb-12">
        <h2 className="text-white text-center text-xl font-bold uppercase tracking-[0.3em] mb-8 opacity-50">
          How It Works
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className="group p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-lg  text-white  tracking-tighter transition-colors">
                  {step.id}
                </span>
              </div>
              <p className="text-white uppercase text-sm leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        <ReceiptUploader
          setFile={setFile}
          setOcrText={setOcrText}
          setItems={setItems}
          setTax={setTax}
          setService={setService}
        />

        {isClient && items.length > 0 && (
          <OCRResult
            ocrText={ocrText}
            items={items}
            tax={tax}
            service={service}
            reset={resetAll}
            onItemsChange={setItems}
          />
        )}

        {isClient && items.length > 0 && total > 0 && (
          <SplitBill total={total} items={items} />
        )}
      </section>

      <footer className="py-8 text-center text-sm text-white uppercase tracking-widest">
        Split Bill Calculator With OCR
      </footer>
    </main>
  );
}
