"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import ThemeToggle from "./theme-button";
import { useCompany } from "@/hooks/query-hooks/use-company";
import { useCookie } from "@/hooks/use-cookie";
import {
  HiOutlineBell,
  HiOutlineSparkles,
  HiOutlineCog6Tooth,
  HiArrowRightOnRectangle,
  HiOutlineUser,
} from "react-icons/hi2";
import { BiSearch } from "react-icons/bi";

const TopNavbar: React.FC = () => {
  const user = useCookie("user");
  const companyId = user?.companyId;
  const { company } = useCompany(companyId);
  const router = useRouter();

  const [showDropdown, setShowDropdown] = useState(false);
  const [companyName, setCompanyName] = useState("TasqX");
  const [logo, setLogo] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isSuperAdmin = user?.role === "superAdmin";
  const isAdminOrManager = user?.role === "admin";
  const isProMember = company?.proMember;
  const isOnTrial = company?.subscriptionType === "Trial";

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((p) => p.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  function getAvatarColor(id: string | number): string {
    const saved = JSON.parse(
      typeof window !== "undefined"
        ? localStorage.getItem("colorMap") || "{}"
        : "{}"
    );
    return saved[id] || "#6366f1";
  }

  function handleLogout() {
    document.cookie.split(";").forEach((cookie) => {
      document.cookie = cookie
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/");
    });
    router.push("/login");
    window.location.reload();
  }

  function handleNavigation() {
    if (isSuperAdmin) return;
    router.push("/project");
  }

  useEffect(() => {
    if (company) {
      setLogo(company.logo);
      if (isProMember || isOnTrial) setCompanyName(company.name);
    }
  }, [company]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = user.name ? getInitials(user.name) : "?";
  const avatarColor = user.id ? getAvatarColor(user.id) : "#6366f1";

  return (
    <header className="relative z-50 flex h-12 w-full items-center justify-between border-b border-slate-200/80 dark:border-surface-border-d bg-white/90 dark:bg-darkSprint-20/90 backdrop-blur-md px-4 gap-4 shadow-[0_1px_0_0_rgba(0,0,0,0.04)] dark:shadow-none">
      {/* Left — Logo & brand */}
      <button
        onClick={handleNavigation}
        className="flex shrink-0 items-center gap-2 group"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-gradient shadow-glow-sm group-hover:shadow-glow transition-shadow duration-200">
          {logo ? (
            <Image src={logo} alt="logo" width={28} height={28} className="rounded-lg" />
          ) : (
            <span className="text-[11px] font-extrabold text-white tracking-tight">TQ</span>
          )}
        </div>
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors duration-150">
          {companyName}
        </span>
      </button>

      {/* Center — Quick search hint */}
      <button
        className="hidden md:flex flex-1 max-w-xs items-center gap-2 rounded-xl border border-slate-200 dark:border-surface-border-d bg-slate-50 dark:bg-surface-overlay-d px-3 py-1.5 text-sm text-slate-400 dark:text-slate-500 hover:border-brand-300 dark:hover:border-brand-500 transition-all duration-150 group"
        aria-label="Open search"
      >
        <BiSearch className="h-4 w-4 text-slate-400 group-hover:text-brand-500 transition-colors" />
        <span className="flex-1 text-left">Search tasks, stories, epics…</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md bg-slate-200 dark:bg-surface-border-d px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
          ⌘K
        </kbd>
      </button>

      {/* Right — Actions & profile */}
      <div className="flex shrink-0 items-center gap-1">
        {/* AI Copilot */}
        <button
          aria-label="AI Copilot"
          className="hidden sm:flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:text-brand-600 dark:hover:text-brand-300 transition-all duration-150"
        >
          <HiOutlineSparkles className="h-[18px] w-[18px]" />
        </button>

        {/* Notifications */}
        <button
          aria-label="Notifications"
          className="relative h-8 w-8 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-slate-200 transition-all duration-150"
        >
          <HiOutlineBell className="h-[18px] w-[18px]" />
          <span className="absolute top-1 right-1.5 h-1.5 w-1.5 rounded-full bg-brand-500 ring-2 ring-white dark:ring-darkSprint-20" />
        </button>

        {/* Theme toggle */}
        <div className="mx-1">
          <ThemeToggle />
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-surface-border-d mx-1" />

        {/* User avatar + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown((p) => !p)}
            className="flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-transparent hover:ring-brand-400 transition-all duration-150 font-bold text-xs text-white select-none"
            style={{ backgroundColor: avatarColor }}
            aria-label="Account menu"
            aria-expanded={showDropdown}
          >
            {initials}
          </button>

          {/* Dropdown panel */}
          {showDropdown && (
            <div className="absolute right-0 top-10 z-50 w-72 rounded-2xl border border-slate-200 dark:border-surface-border-d bg-white dark:bg-surface-raised-d shadow-modal animate-slide-down overflow-hidden">
              {/* User info */}
              <div className="flex items-center gap-3 px-4 py-4">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: avatarColor }}
                >
                  {initials}
                </div>
                <div className="overflow-hidden">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="h-px bg-slate-100 dark:bg-surface-border-d" />

              {/* Menu items */}
              <div className="p-1.5">
                {!isSuperAdmin && isAdminOrManager && (
                  <Link href="/organization/profile">
                    <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-surface-overlay-d transition-colors duration-100">
                      <HiOutlineCog6Tooth className="h-4 w-4 shrink-0 text-slate-400" />
                      Organization settings
                    </button>
                  </Link>
                )}
                <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-surface-overlay-d transition-colors duration-100">
                  <HiOutlineUser className="h-4 w-4 shrink-0 text-slate-400" />
                  My profile
                </button>
              </div>

              <div className="h-px bg-slate-100 dark:bg-surface-border-d" />

              <div className="p-1.5">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-100"
                >
                  <HiArrowRightOnRectangle className="h-4 w-4 shrink-0" />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export { TopNavbar };
