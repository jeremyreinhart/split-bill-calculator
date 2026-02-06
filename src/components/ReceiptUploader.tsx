"use client";

import NextImage from "next/image";
import { useEffect, useRef, useState } from "react";
import Tesseract from "tesseract.js";
import axios from "axios";

interface Props {
  setFile: (f: File | null) => void;
  setOcrText: (t: string) => void;
  setItems: (i: { name: string; price: number }[]) => void;
  setTax: (t: number) => void;
  setService: (s: number) => void;
}

export default function ReceiptUploader({
  setFile,
  setOcrText,
  setItems,
  setTax,
  setService,
}: Props) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Deteksi apakah user menggunakan mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };
    checkMobile();
  }, []);

  const preprocessImage = async (file: File): Promise<HTMLCanvasElement> => {
    const img = new window.Image();
    img.src = URL.createObjectURL(file);

    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const maxWidth = 1200;
    const scale = Math.min(1, maxWidth / img.width);

    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas;
  };

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPreviewFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const runOCR = async () => {
    if (!previewFile) return;
    setLoading(true);
    setProgress(0);

    try {
      const preview = await preprocessImage(previewFile);
      const result = await Tesseract.recognize(preview, "eng+ind", {
        logger: (m) => {
          if (m.status === "recognizing text")
            setProgress(Math.round(m.progress * 100));
        },
      });

      const rawText = result.data.text;
      setOcrText(rawText);

      const res = await axios.post("/api/gemini", { ocrText: rawText });
      setItems(res.data.items || []);
      setTax(res.data.tax || 0);
      setService(res.data.service || 0);
    } catch (err) {
      console.error("OCR ERROR:", err);
      alert("Gagal membaca struk.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setPreviewFile(null);
    setOcrText("");
    setItems([]);
    setTax(0);
    setService(0);
    setProgress(0);
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <div className="bg-white/10 backdrop-blur p-4 rounded-xl space-y-4">
      {!preview && (
        <div className="flex flex-col sm:flex-row gap-3">
          {isMobile && (
            <div>
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex-1 w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold active:scale-95 transition-transform"
              >
                📸 Take Photo
              </button>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleImageCapture}
              />
            </div>
          )}

          <button
            onClick={() => galleryInputRef.current?.click()}
            className="flex-1  cursor-pointer  py-3 rounded-lg"
          >
            🖼️ From Gallery
          </button>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageCapture}
          />
        </div>
      )}

      {preview && (
        <div className="space-y-4">
          <div className="relative w-full h-80 bg-black/30 rounded-lg overflow-hidden">
            <NextImage
              src={preview}
              alt="Preview"
              fill
              unoptimized
              style={{ objectFit: "contain" }}
            />
          </div>

          {loading && (
            <div className="space-y-2">
              <div className="flex flex-col justify-between text-emerald-300">
                <div className="flex justify-between">
                  <span>Processing</span>
                  <span>{progress}%</span>
                </div>
                <span>Extracting items and prices...</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={reset}
              className="flex-1 cursor-pointer bg-slate-800 text-white py-3 rounded-xl hover:bg-slate-700"
            >
              Choose Another Photo
            </button>
            <button
              disabled={loading}
              onClick={async () => {
                setFile(previewFile);
                await runOCR();
              }}
              className="flex-1 cursor-pointer bg-emerald-600 hover:bg-green-400 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Scanning..." : "Scan & Extract"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
