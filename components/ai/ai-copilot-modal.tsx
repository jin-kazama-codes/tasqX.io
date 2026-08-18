"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  HiOutlineSparkles,
  HiOutlineXMark,
  HiOutlinePaperAirplane,
  HiOutlineClipboardDocument,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import clsx from "clsx";

/* ─── Types ──────────────────────────────────────────────────────────────── */
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type Prompt = { label: string; prompt: string; icon: string };

const QUICK_PROMPTS: Prompt[] = [
  { label: "Generate user story",     icon: "📝", prompt: "Write a detailed user story with acceptance criteria for: " },
  { label: "Break into subtasks",     icon: "🧩", prompt: "Break this feature into actionable subtasks: " },
  { label: "Sprint summary",          icon: "📊", prompt: "Summarize the current sprint status and flag any blockers based on: " },
  { label: "Estimate story points",   icon: "⚡", prompt: "Estimate story points and explain reasoning for: " },
];

/* ─── Component ─────────────────────────────────────────────────────────── */
const AICopilotModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "👋 Hi! I'm your AI Project Copilot. I can help you write user stories, break down tasks, estimate effort, or summarize sprints. What would you like to work on?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-ai",
          role: "assistant",
          content: data.response ?? "Sorry, I couldn't process that request.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-err",
          role: "assistant",
          content: "⚠️ Connection error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-end p-4 sm:p-6 pointer-events-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm pointer-events-auto animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={clsx(
          "relative z-10 pointer-events-auto",
          "flex flex-col w-full max-w-md h-[600px] max-h-[90vh]",
          "rounded-2xl border border-slate-200 dark:border-surface-border-d",
          "bg-white dark:bg-surface-raised-d shadow-modal",
          "animate-slide-up"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-surface-border-d">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-gradient shadow-glow-sm">
              <HiOutlineSparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                AI Copilot
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Powered by TasqX Intelligence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-overlay-d hover:text-slate-600 dark:hover:text-slate-200 transition-all"
          >
            <HiOutlineXMark className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="custom-scrollbar flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={clsx(
                "group flex",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "assistant" && (
                <div className="mr-2 mt-0.5 h-6 w-6 shrink-0 flex items-center justify-center rounded-full bg-brand-gradient shadow-glow-sm">
                  <HiOutlineSparkles className="h-3 w-3 text-white" />
                </div>
              )}
              <div
                className={clsx(
                  "relative max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-brand-500 text-white rounded-tr-sm"
                    : "bg-slate-100 dark:bg-surface-overlay-d text-slate-700 dark:text-slate-200 rounded-tl-sm"
                )}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.role === "assistant" && msg.id !== "welcome" && (
                  <button
                    onClick={() => handleCopy(msg.id, msg.content)}
                    className="absolute -bottom-2 -right-2 opacity-0 group-hover:opacity-100 h-6 w-6 flex items-center justify-center rounded-full bg-white dark:bg-surface-raised-d border border-slate-200 dark:border-surface-border-d shadow-sm transition-all"
                    title="Copy"
                  >
                    {copiedId === msg.id ? (
                      <HiOutlineCheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <HiOutlineClipboardDocument className="h-3 w-3 text-slate-400" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 flex items-center justify-center rounded-full bg-brand-gradient shadow-glow-sm">
                <HiOutlineSparkles className="h-3 w-3 text-white" />
              </div>
              <div className="flex items-center gap-1 rounded-2xl bg-slate-100 dark:bg-surface-overlay-d px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompts */}
        <div className="flex gap-1.5 overflow-x-auto px-4 py-2 border-t border-slate-200 dark:border-surface-border-d scrollbar-hide">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p.label}
              onClick={() => sendMessage(p.prompt)}
              className="shrink-0 flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-surface-border-d bg-white dark:bg-surface-overlay-d px-2.5 py-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:border-brand-300 dark:hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-300 transition-all"
            >
              <span>{p.icon}</span>
              {p.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex items-end gap-2 border-t border-slate-200 dark:border-surface-border-d px-4 py-4">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your project…"
            rows={1}
            className="custom-scrollbar flex-1 resize-none rounded-xl border border-slate-200 dark:border-surface-border-d bg-slate-50 dark:bg-surface-overlay-d px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            style={{ maxHeight: "100px" }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-glow-sm hover:shadow-glow"
          >
            <HiOutlinePaperAirplane className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AICopilotModal;
