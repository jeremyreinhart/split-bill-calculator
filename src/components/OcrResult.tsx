"use client";

import { useEffect, useMemo, useState } from "react";

interface Item {
  name: string;
  price: number;
}

interface Props {
  ocrText: string;
  items: Item[];
  tax: number;
  service: number;
  reset: () => void;
  onItemsChange: (items: Item[]) => void;
}

export default function OCRResult({
  ocrText,
  items,
  tax,
  service,
  reset,
  onItemsChange,
}: Props) {
  const [editableItems, setEditableItems] = useState<Item[]>([]);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    setEditableItems(items);
  }, [items]);

  const subtotal = useMemo(
    () => editableItems.reduce((sum, item) => sum + (item.price || 0), 0),
    [editableItems],
  );

  const calculatedTax = Math.round(subtotal * 0.1);
  const calculatedService = service ?? 0;
  const total = subtotal + calculatedTax + calculatedService;

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);

  const updateItem = (
    index: number,
    field: "name" | "price",
    value: string,
  ) => {
    const copy = [...editableItems];
    if (field === "price") copy[index].price = parseInt(value) || 0;
    else copy[index].name = value;
    setEditableItems(copy);
    onItemsChange(copy);
  };

  const addItem = () => {
    const newItems = [...editableItems, { name: "New item", price: 0 }];
    setEditableItems(newItems);
    onItemsChange(newItems);
  };

  const deleteItem = (index: number) => {
    const newItems = editableItems.filter((_, i) => i !== index);
    setEditableItems(newItems);
    onItemsChange(newItems);
  };

  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-slate-800/40 backdrop-blur-sm border border-emerald-500/20 p-6 text-sm text-emerald-300/70">
        <pre className="whitespace-pre-wrap font-mono">{ocrText}</pre>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-slate-800/40 backdrop-blur-sm border border-emerald-500/20 overflow-hidden shadow-xl">
      <div className="px-6 py-5 bg-linear-to-r from-emerald-500/10 to-teal-500/10 border-b border-emerald-500/20">
        <h3 className="text-xl font-bold text-white">Scanned Receipt</h3>
      </div>

      <div className="px-6 py-5 space-y-3">
        {editableItems.map((item, idx) => (
          <div key={idx} className="group">
            {editMode ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <input
                  className="w-full sm:flex-1 rounded-xl border border-emerald-500/20 bg-slate-900/60 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  value={item.name}
                  onChange={(e) => updateItem(idx, "name", e.target.value)}
                  placeholder="Item name"
                />

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    className="flex-1 sm:w-36 rounded-xl border border-emerald-500/20 bg-slate-900/60 px-4 py-2.5 text-right text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    value={item.price}
                    onChange={(e) => updateItem(idx, "price", e.target.value)}
                    placeholder="0"
                  />

                  <button
                    onClick={() => deleteItem(idx)}
                    className="w-10 h-10 cursor-pointer shrink-0 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center"
                  >
                    X
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between py-2 px-4 rounded-xl bg-slate-900/30 group-hover:border group-hover:border-emerald-500/20 group-hover:bg-slate-900/50 transition-all">
                <span className="text-white">{item.name}</span>
                <span className="font-semibold text-emerald-400">
                  {formatRupiah(item.price)}
                </span>
              </div>
            )}
          </div>
        ))}

        {editMode && (
          <button
            onClick={addItem}
            className="w-full rounded-xl cursor-pointer border-2 border-dashed border-emerald-500/30 bg-slate-900/20 py-3 text-sm text-emerald-300 hover:border-emerald-500/50 transition-all flex items-center justify-center gap-2"
          >
            Add Item
          </button>
        )}
      </div>

      <div className="border-t border-emerald-500/20 mx-6" />
      <div className="px-6 py-5 space-y-3">
        <div className="flex justify-between text-white">
          <span className="text-emerald-300/70">Subtotal</span>
          <span>{formatRupiah(subtotal)}</span>
        </div>
        <div className="flex justify-between text-white">
          <span className="text-emerald-300/70">Tax (10%)</span>
          <span>{formatRupiah(calculatedTax)}</span>
        </div>
        <div className="flex justify-between text-white">
          <span className="text-emerald-300/70">Service</span>
          <span>{formatRupiah(calculatedService)}</span>
        </div>
        <div className="pt-3 border-t border-emerald-500/20">
          <div className="flex justify-between text-xl font-bold text-white">
            <span>Total</span>
            <span className="text-emerald-400">{formatRupiah(total)}</span>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 space-y-3">
        <button
          onClick={() => setEditMode(!editMode)}
          className="w-full rounded-2xl border cursor-pointer border-emerald-500/30 bg-slate-900/40 py-3.5 text-white font-medium hover:bg-slate-900/60 transition-all"
        >
          {editMode ? "Done Editing" : "Edit Items"}
        </button>

        <button
          onClick={reset}
          className="w-full cursor-pointer rounded-2xl bg-linear-to-r from-red-500/80 to-red-600/80 py-3.5 text-white font-semibold"
        >
          Delete / Scan Again
        </button>
      </div>
    </div>
  );
}
