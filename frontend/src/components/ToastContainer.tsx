"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { CheckCircle2, Info, AlertCircle, X } from "lucide-react";

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success" || !toast.type;
        const isInfo = toast.type === "info";
        const isError = toast.type === "error";

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 bg-[#222222] text-white rounded-xl shadow-2xl border border-neutral-700 text-sm animate-fade-in"
          >
            <div className="flex items-center gap-2.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-[#008A05] flex-shrink-0" />}
              {isInfo && <Info className="w-5 h-5 text-[#008489] flex-shrink-0" />}
              {isError && <AlertCircle className="w-5 h-5 text-[#FF385C] flex-shrink-0" />}
              <span className="font-medium text-[13px]">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-neutral-400 hover:text-white p-1 rounded-full transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
