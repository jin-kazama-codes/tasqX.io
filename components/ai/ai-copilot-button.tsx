"use client";

import React, { useState } from "react";
import { HiOutlineSparkles } from "react-icons/hi2";
import dynamic from "next/dynamic";

// Lazy load the heavy modal
const AICopilotModal = dynamic(() => import("./ai-copilot-modal"), {
  ssr: false,
});

const AICopilotButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating action button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Copilot"
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-brand-gradient shadow-glow hover:shadow-glow transition-all duration-200 hover:scale-110 active:scale-95 group"
      >
        <HiOutlineSparkles className="h-5 w-5 text-white" />

        {/* Tooltip */}
        <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-xl bg-slate-900 dark:bg-slate-100 px-3 py-1.5 text-xs font-semibold text-white dark:text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-md">
          AI Copilot
        </span>

        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-brand-500/40 animate-ping [animation-duration:2s]" />
      </button>

      <AICopilotModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default AICopilotButton;
