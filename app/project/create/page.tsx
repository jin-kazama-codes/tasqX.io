"use client";

import { useCookie } from "@/hooks/use-cookie";
import { useRouter } from "next/navigation";
import React, { useState, ChangeEvent, FormEvent } from "react";
import {
  HiOutlineFolderPlus,
  HiOutlineDocumentText,
  HiOutlineKey,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
} from "react-icons/hi2";

const PROJECT_ICONS = [
  { icon: "🚀", label: "Launch / Core" },
  { icon: "⚡", label: "Sprint / Fast" },
  { icon: "🤖", label: "AI / Bot" },
  { icon: "🌐", label: "Web / Platform" },
  { icon: "📱", label: "Mobile App" },
  { icon: "🎨", label: "Design System" },
  { icon: "🔒", label: "Security / Auth" },
  { icon: "💎", label: "Premium / VIP" },
  { icon: "🎯", label: "Goals / Milestones" },
  { icon: "🔥", label: "Hot / Priority" },
  { icon: "🛠️", label: "DevOps / Tools" },
  { icon: "💼", label: "Business / Ops" },
];

const CreateProject: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    key: "",
    icon: "🚀",
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Auto-generate key from name if key is untouched
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: val,
      key:
        prev.key === "" || prev.key === prev.name.slice(0, 4).toUpperCase()
          ? val
              .replace(/[^a-zA-Z0-9]/g, "")
              .slice(0, 4)
              .toUpperCase()
          : prev.key,
    }));
    if (error) setError(null);
  };

  const handleKeyChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      key: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""),
    }));
    if (error) setError(null);
  };

  const handleIconSelect = (icon: string) => {
    setFormData((prev) => ({ ...prev, icon }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const user = useCookie("user");
    const userId = String(user?.id ?? "");
    const { name, key, icon } = formData;

    try {
      const response = await fetch("/api/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, key, userId, icon, imageUrl: icon }),
      });

      const responseData = await response.json();

      if (response.ok) {
        setFormData({ name: "", key: "", icon: "🚀" });
        setSuccess("Project created successfully!");
        setTimeout(() => router.refresh(), 500);
      } else {
        setError(responseData.error || "Failed to create project");
      }
    } catch {
      setError("An error occurred while creating project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-surface-border-d bg-white dark:bg-surface-raised-d shadow-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-surface-border-d px-6 py-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 text-2xl border border-brand-500/20 shadow-xs">
          <span>{formData.icon}</span>
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Create New Project
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Set up a new workspace for your team
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Project Icon Picker */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Choose Project Icon
            </label>
            <div className="grid grid-cols-6 gap-2">
              {PROJECT_ICONS.map((item) => (
                <button
                  key={item.icon}
                  type="button"
                  onClick={() => handleIconSelect(item.icon)}
                  title={item.label}
                  className={`flex h-11 items-center justify-center rounded-xl text-xl transition-all duration-150 ${
                    formData.icon === item.icon
                      ? "bg-brand-500/15 border-2 border-brand-500 scale-105 shadow-xs"
                      : "bg-slate-100 dark:bg-surface-overlay-d border border-transparent hover:bg-slate-200 dark:hover:bg-surface-border-d hover:scale-105"
                  }`}
                >
                  <span>{item.icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Project Name */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="name"
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider"
            >
              Project Name
            </label>
            <div className="relative flex items-center">
              <HiOutlineDocumentText className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none z-10" />
              <input
                id="name"
                name="name"
                type="text"
                style={{ paddingLeft: "2.75rem", paddingRight: "1rem" }}
                className="input-field text-sm w-full"
                placeholder="e.g. Serali - Voice AI Workforce"
                value={formData.name}
                onChange={handleNameChange}
                required
              />
            </div>
          </div>

          {/* Project Key */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="key"
                className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider"
              >
                Project Key
              </label>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                Prefix for tasks (e.g. SERA-1)
              </span>
            </div>
            <div className="relative flex items-center">
              <HiOutlineKey className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none z-10" />
              <input
                id="key"
                name="key"
                type="text"
                maxLength={10}
                style={{ paddingLeft: "2.75rem", paddingRight: "1rem" }}
                className="input-field uppercase font-mono text-sm tracking-wider w-full"
                placeholder="e.g. SERA"
                value={formData.key}
                onChange={handleKeyChange}
                required
              />
            </div>
          </div>

          {/* Feedback banners */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-3.5 py-2.5 text-xs text-red-600 dark:text-red-400 animate-fade-in">
              <HiOutlineExclamationCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-3.5 py-2.5 text-xs text-emerald-600 dark:text-emerald-400 animate-fade-in">
              <HiOutlineCheckCircle className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-brand mt-1 py-3 text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <span>Creating project…</span>
              </>
            ) : (
              <span>Create Project</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;
