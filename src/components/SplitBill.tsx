"use client";

import { useMemo, useState } from "react";

interface Props {
  total: number;
}

export default function SplitBill({ total }: Props) {
  const [mode, setMode] = useState<"equal" | "percentage">("equal");
  const [peopleNames, setPeopleNames] = useState<string[]>([]);
  const [percentages, setPercentages] = useState<number[]>([]);

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);

  const equalResult = useMemo(() => {
    if (peopleNames.length === 0) return [];
    return Array.from({ length: peopleNames.length }, () =>
      Math.round(total / peopleNames.length),
    );
  }, [peopleNames.length, total]);

  const percentageResult = useMemo(() => {
    return percentages.map((p) => Math.round((p / 100) * total));
  }, [percentages, total]);

  const updatePercentage = (index: number, value: number) => {
    const copy = [...percentages];
    copy[index] = value;
    setPercentages(copy);
  };

  const updatePersonName = (index: number, name: string) => {
    const copy = [...peopleNames];
    copy[index] = name;
    setPeopleNames(copy);
  };

  const addPerson = () => {
    setPeopleNames([...peopleNames, ""]);
  };

  const addPercentagePerson = () => {
    setPercentages([...percentages, 0]);
  };

  const removePerson = (index: number) => {
    setPeopleNames(peopleNames.filter((_, i) => i !== index));
  };

  const removePercentagePerson = (index: number) => {
    setPercentages(percentages.filter((_, i) => i !== index));
  };

  const totalPercentage = percentages.reduce((a, b) => a + b, 0);

  return (
    <div className="mt-8 rounded-3xl bg-slate-800/40 backdrop-blur-sm border border-emerald-500/20 overflow-hidden shadow-xl">
      <div className="px-6 py-5 bg-linear-to-r from-teal-500/10 to-emerald-500/10 border-b border-emerald-500/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center border border-teal-500/30">
            <svg
              className="w-5 h-5 text-teal-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">Split Bill</h2>
        </div>
        <div>
          <p className="text-sm text-emerald-300/60 mb-1">Total Amount</p>
          <p className="text-3xl font-bold text-emerald-400">
            {formatRupiah(total)}
          </p>
        </div>
      </div>

      <div className="px-6 py-4 flex gap-2 bg-slate-900/20">
        <button
          onClick={() => setMode("equal")}
          className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            mode === "equal"
              ? "bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25"
              : "bg-slate-900/40 text-emerald-300/60 border border-emerald-500/20 hover:bg-slate-900/60"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          Equal Split
        </button>

        <button
          onClick={() => setMode("percentage")}
          className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            mode === "percentage"
              ? "bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25"
              : "bg-slate-900/40 text-emerald-300/60 border border-emerald-500/20 hover:bg-slate-900/60"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Percentage
        </button>
      </div>

      <div className="px-6 py-5 space-y-4">
        {mode === "equal" && (
          <>
            {peopleNames.length > 0 && (
              <div className="space-y-3">
                {peopleNames.map((name, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-semibold text-sm border border-emerald-500/30 shrink-0">
                      {idx + 1}
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => updatePersonName(idx, e.target.value)}
                      className="flex-1 rounded-xl border border-emerald-500/20 bg-slate-900/60 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      placeholder="Enter name"
                    />
                    <button
                      onClick={() => removePerson(idx)}
                      className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center shrink-0"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={addPerson}
              className="w-full rounded-xl border-2 border-dashed border-emerald-500/30 bg-slate-900/20 py-3 text-sm text-emerald-300 hover:border-emerald-500/50 transition-all flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Person
            </button>

            {peopleNames.length > 0 && (
              <div className="pt-2 mt-4 border-t border-emerald-500/20">
                <div className="flex justify-between items-center rounded-xl bg-linear-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 px-6 py-4">
                  <span className="text-white font-medium">Each person</span>
                  <span className="font-bold text-emerald-400 text-2xl">
                    {formatRupiah(equalResult[0] || 0)}
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        {mode === "percentage" && (
          <>
            {percentages.length > 0 && (
              <div className="space-y-3">
                {percentages.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400 font-semibold text-sm border border-teal-500/30">
                      {idx + 1}
                    </div>
                    <input
                      type="number"
                      value={p}
                      onChange={(e) =>
                        updatePercentage(idx, parseInt(e.target.value) || 0)
                      }
                      className="flex-1 rounded-xl border border-emerald-500/20 bg-slate-900/60 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      placeholder="0"
                    />
                    <span className="text-emerald-300/70 font-medium w-8">
                      %
                    </span>
                    <span className="w-32 text-right font-bold text-emerald-400">
                      {formatRupiah(percentageResult[idx] || 0)}
                    </span>
                    <button
                      onClick={() => removePercentagePerson(idx)}
                      className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center shrink-0"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={addPercentagePerson}
              className="w-full rounded-xl border-2 border-dashed border-emerald-500/30 bg-slate-900/20 py-3 text-sm text-emerald-300 hover:border-emerald-500/50 transition-all flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Person
            </button>

            {percentages.length > 0 && (
              <div
                className={`text-right text-sm font-semibold pt-2 ${totalPercentage === 100 ? "text-emerald-400" : "text-red-400"}`}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/40 border border-current/20">
                  {totalPercentage === 100 ? (
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
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
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  )}
                  Total: {totalPercentage}%{" "}
                  {totalPercentage === 100 ? "" : "(must be 100%)"}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
