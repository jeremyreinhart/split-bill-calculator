"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Tesseract from "tesseract.js";
import axios from "axios";

interface Props {
  file: File | null;
  setFile: (f: File | null) => void;
  setOcrText: (t: string) => void;
  setItems: (i: { name: string; price: number }[]) => void;
  setTax: (t: number) => void;
  setService: (s: number) => void;
}

export default function ReceiptUploader({
  file,
  setFile,
  setOcrText,
  setItems,
  setTax,
  setService,
}: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > 10 * 1024 * 1024) {
      alert("Max 10MB");
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setOcrText("");
    setItems([]);
    setProgress(0);
  };

  const blobLoader = () => preview || "";

  const runOCR = async () => {
    if (!file) return;
    setLoading(true);
    setProgress(0);
    setOcrText("");
    setItems([]);

    try {
      const result = await Tesseract.recognize(file, "eng+ind", {
        logger: (e) => {
          if (e.status === "recognizing text" && e.progress)
            setProgress(Math.round(e.progress * 100));
        },
      });

      setOcrText(result.data.text);

      const res = await axios.post("/api/groq", {
        ocrText: result.data.text,
      });
      const data = res.data;

      setItems(data.items || []);
      setTax(data.tax || 0);
      setService(data.service || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setOcrText("");
    setItems([]);
    setProgress(0);
    setTax(0);
    setService(0);
  };

  return (
    <div className="space-y-4">
      {!preview && (
        <label className="group relative block cursor-pointer">
          <div className="relative rounded-3xl border-2 border-dashed border-emerald-500/30 bg-slate-800/40 backdrop-blur-sm p-16 hover:border-emerald-500/60 hover:bg-slate-800/60 transition-all">
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition-transform">
                <svg
                  className="w-9 h-9 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>

              <div className="text-center">
                <p className="text-lg font-semibold text-white mb-1">
                  Drop receipt or click to upload
                </p>
                <p className="text-sm text-emerald-300/60">JPG, PNG or PDF</p>
              </div>
            </div>
          </div>

          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleChange}
          />
        </label>
      )}

      {preview && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-emerald-500/20 bg-slate-800/40 backdrop-blur-sm overflow-hidden">
            <div className="relative w-full h-80 sm:h-96">
              <Image
                loader={blobLoader}
                src={preview}
                alt="Receipt preview"
                fill
                style={{ objectFit: "contain" }}
                className="p-4"
              />
            </div>
          </div>

          {loading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-emerald-300">Processing...</span>
                <span className="text-emerald-400 font-semibold">
                  {progress}%
                </span>
              </div>
              <div className="h-2 bg-slate-800/60 rounded-full border border-emerald-500/20 overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-emerald-500 to-teal-500 transition-all rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={reset}
              className="flex-1 bg-slate-800/60 text-white py-3.5 rounded-2xl hover:bg-slate-800/80 transition-all font-medium border border-slate-700/50"
            >
              Choose Another
            </button>
            <button
              onClick={runOCR}
              disabled={loading}
              className="flex-1 bg-linear-to-r from-emerald-500 to-teal-500 text-white py-3.5 rounded-2xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all font-semibold disabled:opacity-50"
            >
              {loading ? "Scanning..." : "Scan & Extract"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
