"use client";

import { useLocalStorage } from "@/hooks/local-storage";
import { useMemo } from "react";

interface Item {
  name: string;
  price: number;
}

interface Participant {
  name: string;
}

interface Props {
  total: number;
  items?: Item[];
}

export default function SplitBill({ total, items = [] }: Props) {
  const [mode, setMode] = useLocalStorage<"equal" | "item">(
    "split_mode",
    "equal",
  );
  const [people, setPeople] = useLocalStorage<Participant[]>(
    "split_people",
    [],
  );
  const [itemAssignments, setItemAssignments] = useLocalStorage<
    Record<number, number[]>
  >("split_item_assignments", {});

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);

  const results = useMemo(() => {
    if (mode === "equal") {
      const perPerson = total / (people.length || 1);
      return people.map(() => Math.round(perPerson));
    }

    // Mode Split by Item
    // Total sudah termasuk tax & service
    const subtotalItems = items.reduce((sum, item) => sum + item.price, 0);
    const totalsPerPerson = new Array(people.length).fill(0);

    items.forEach((item, itemIdx) => {
      const assignedIndices = itemAssignments[itemIdx] || [];
      if (assignedIndices.length > 0) {
        // Hitung proporsi item ini terhadap total bill
        const itemProportion = item.price / subtotalItems;
        const itemTotalWithTax = total * itemProportion;
        const pricePerPerson = itemTotalWithTax / assignedIndices.length;

        assignedIndices.forEach((pIdx) => {
          if (totalsPerPerson[pIdx] !== undefined) {
            totalsPerPerson[pIdx] += pricePerPerson;
          }
        });
      }
    });

    return totalsPerPerson.map(Math.round);
  }, [mode, total, items, people, itemAssignments]);

  const togglePersonInItem = (itemIdx: number, pIdx: number) => {
    setItemAssignments((prev) => {
      const current = prev[itemIdx] || [];
      const next = current.includes(pIdx)
        ? current.filter((id) => id !== pIdx)
        : [...current, pIdx];
      return { ...prev, [itemIdx]: next };
    });
  };

  const generateMessage = () => {
    const header = `RINCIAN SPLIT BILL`;
    const totalBill = `Total: ${formatRupiah(total)}`;

    const summary = people
      .map((p, idx) => {
        const name = p.name || `Orang ${idx + 1}`;
        const amount = formatRupiah(results[idx] || 0);

        let itemDetail = "";
        if (mode === "item") {
          const assignedItems = items
            .filter((_, itemIdx) =>
              (itemAssignments[itemIdx] || []).includes(idx),
            )
            .map((item) => item.name);

          if (assignedItems.length > 0) {
            itemDetail = `  (${assignedItems.join(", ")})`;
          }
        }

        return `${name}: ${amount}${itemDetail}`;
      })
      .join("\n\n");

    return `${header}\n${totalBill}\n\n${summary}\n\nvia Split Bill App`;
  };

  const shareWA = () => {
    const text = encodeURIComponent(generateMessage());
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareTelegram = () => {
    const text = encodeURIComponent(generateMessage());
    const url = encodeURIComponent("http://localhost:3000/upload");
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, "_blank");
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="flex p-1 bg-slate-900/40 rounded-2xl border border-emerald-500/20">
        {(["equal", "item"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
              mode === m
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                : "text-emerald-300/40 hover:text-emerald-300"
            }`}
          >
            {m === "item" ? "Split By Item" : "Split Equal"}
          </button>
        ))}
      </div>

      <div className="rounded-3xl bg-slate-800/40 backdrop-blur-sm border border-emerald-500/20 overflow-hidden shadow-xl">
        <div className="px-6 py-5 bg-emerald-500/5 border-b border-emerald-500/10">
          <p className="text-xs text-emerald-300/60 font-bold uppercase tracking-widest mb-1">
            Total to Split
          </p>
          <p className="text-3xl font-black text-emerald-400">
            {formatRupiah(total)}
          </p>
        </div>

        <div className="p-6 space-y-8">
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">
              Person
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {people.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-slate-900/40 p-2 rounded-xl border border-emerald-500/10"
                >
                  <input
                    value={p.name}
                    onChange={(e) => {
                      const copy = [...people];
                      copy[idx].name = e.target.value;
                      setPeople(copy);
                    }}
                    placeholder={`Person ${idx + 1}`}
                    className="flex-1 bg-transparent text-sm text-white outline-none px-2"
                  />
                  <button
                    onClick={() =>
                      setPeople(people.filter((_, i) => i !== idx))
                    }
                    className="w-8 h-8 flex items-center justify-center text-red-400/40 hover:text-red-400"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => setPeople([...people, { name: "" }])}
                className="py-2.5 rounded-xl border-2 border-dashed border-emerald-500/20 text-xs text-emerald-300/50 hover:bg-emerald-500/5 transition-all"
              >
                + Add Person
              </button>
            </div>
          </section>

          {mode === "item" && (
            <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">
                Assign items to people
              </h3>
              <div className="space-y-3">
                {items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-500/10"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-sm font-bold text-white leading-tight">
                        {item.name}
                      </span>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                        {formatRupiah(item.price)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {people.map((p, pIdx) => {
                        const isSelected = (
                          itemAssignments[itemIdx] || []
                        ).includes(pIdx);
                        return (
                          <button
                            key={pIdx}
                            onClick={() => togglePersonInItem(itemIdx, pIdx)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                              isSelected
                                ? "bg-emerald-500 border-emerald-400 text-white shadow-lg"
                                : "bg-slate-800 border-emerald-500/5 text-emerald-300/30 hover:border-emerald-500/20"
                            }`}
                          >
                            {p.name || `P${pIdx + 1}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="space-y-4 pt-4 border-t border-emerald-500/10">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">
              Summary
            </h3>

            <div className="space-y-3">
              {people.map((p, idx) => {
                const assignedItems = items.filter((_, itemIdx) =>
                  (itemAssignments[itemIdx] || []).includes(idx),
                );
                return (
                  <div
                    key={idx}
                    className="flex flex-col p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-white uppercase tracking-tighter">
                        {p.name || `Person ${idx + 1}`}
                      </span>
                      <span className="text-xl font-black text-white">
                        {formatRupiah(results[idx] || 0)}
                      </span>
                    </div>

                    {mode === "item" && assignedItems.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {assignedItems.map((item, i) => (
                          <span
                            key={i}
                            className="text-sm bg-slate-900/60 text-white px-2 py-0.5 rounded-md border border-emerald-500/5"
                          >
                            {item.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {people.length > 0 && (
            <div className="flex  gap-3 pt-2">
              <button
                onClick={shareWA}
                className="w-full py-4 bg-green-600 hover:bg-green-500 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl cursor-pointer  transition-all shadow-xl shadow-green-900/20 active:scale-[0.98]"
              >
                Share to WhatsApp
              </button>
              <button
                onClick={shareTelegram}
                className="w-full py-4 bg-sky-500 hover:bg-sky-400 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl cursor-pointer transition-all shadow-xl shadow-sky-900/20 active:scale-[0.98]"
              >
                Share to Telegram
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
