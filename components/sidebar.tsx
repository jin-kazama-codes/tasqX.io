"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiOutlineRectangleStack,
  HiOutlineViewColumns,
  HiOutlineDocument,
  HiOutlineFolder,
  HiOutlineUsers,
  HiOutlineCog6Tooth,
  HiOutlineChartBar,
  HiOutlineFire,
  HiOutlineSparkles,
  HiChevronRight,
  HiOutlineClipboardDocumentList,
  HiOutlineMapPin,
} from "react-icons/hi2";
import { CgGoogleTasks } from "react-icons/cg";
import { useCookie } from "@/hooks/use-cookie";
import { useFiltersContext } from "@/context/use-filters-context";
import { SidebarSkeleton } from "./skeletons";
import clsx from "clsx";

/* ─── Navigation item type ─────────────────────────────────────────────── */
type NavItemType = {
  id: string;
  label: string;
  Icon: React.ElementType;
  href: string;
};

const Sidebar: React.FC = () => {
  const user = useCookie("user");
  const project = useCookie("project");
  const pathname = usePathname();
  const [loading, setLoading] = useState(!project);
  const { assignees, setAssignees } = useFiltersContext();
  const [collapsed, setCollapsed] = useState(true);
  const [hovered, setHovered] = useState(false);

  const isAdminOrManager =
    user && (user.role === "admin" || user.role === "manager");

  useEffect(() => {
    if (project) setLoading(false);
  }, [project]);

  const toggleAssigneeFilter = () => {
    setAssignees(assignees.length === 0 ? [user.id] : []);
  };

  /* ── nav sections ───────────────────────────────────────────────────── */
  const planningItems: NavItemType[] = [
    { id: "roadmap",  label: "Roadmap",   Icon: HiOutlineMapPin,              href: `/${project?.key}/roadmap` },
    { id: "backlog",  label: "Backlog",   Icon: HiOutlineClipboardDocumentList, href: `/${project?.key}/backlog` },
    { id: "board",    label: "Board",     Icon: HiOutlineViewColumns,          href: `/${project?.key}/board` },
    { id: "document", label: "Documents", Icon: HiOutlineDocument,            href: `/${project?.key}/document` },
  ];

  const workspaceItems: NavItemType[] = [
    { id: "projects", label: "Projects", Icon: HiOutlineFolder, href: "/project" },
  ];

  const configItems: NavItemType[] = [
    { id: "users",    label: "Users",    Icon: HiOutlineUsers,      href: `/${project?.key}/users` },
    { id: "settings", label: "Settings", Icon: HiOutlineCog6Tooth,  href: `/${project?.key}/settings` },
  ];

  const reportItems: NavItemType[] = [
    { id: "burndown", label: "Burndown",  Icon: HiOutlineFire,     href: `/${project?.key}/report/burndown` },
    { id: "velocity", label: "Velocity",  Icon: HiOutlineChartBar, href: `/${project?.key}/report/velocity` },
  ];

  if (loading) return <SidebarSkeleton />;

  const expanded = !collapsed || hovered;
  const sidebarWidth = expanded ? "w-56" : "w-14";

  return (
    <aside
      className={clsx(
        "relative flex flex-col h-[92vh] z-50 transition-all duration-200",
        "bg-white dark:bg-darkSprint-20",
        "border-r border-slate-200/80 dark:border-surface-border-d",
        sidebarWidth,
        !collapsed && "shadow-md"
      )}
      style={{ position: collapsed ? "absolute" : "relative" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Project chip header ───────────────────────────────────────── */}
      <div
        className={clsx(
          "flex items-center border-b border-slate-200/80 dark:border-surface-border-d px-3 py-4",
          expanded ? "gap-2.5" : "justify-center"
        )}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-gradient shadow-glow-sm text-sm">
          {project?.imageUrl ? (
            <span>{project.imageUrl}</span>
          ) : (
            <HiOutlineRectangleStack className="h-4 w-4 text-white" />
          )}
        </div>
        {expanded && (
          <div className="min-w-0 flex-1 animate-fade-in">
            <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
              {project?.name ?? "Select project"}
            </p>
            <p className="truncate text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">
              {project?.key ?? "—"}
            </p>
          </div>
        )}
      </div>

      {/* ── Scrollable nav ────────────────────────────────────────────── */}
      <div className="custom-scrollbar flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-y-4">
        <NavSection
          label="PLANNING"
          items={planningItems}
          expanded={expanded}
          pathname={pathname}
        />

        <NavSection
          label="WORKSPACE"
          items={workspaceItems}
          expanded={expanded}
          pathname={pathname}
        />

        {/* My Tasks toggle */}
        {!pathname.includes("/users") && !pathname.includes("/project") && (
          <button
            onClick={toggleAssigneeFilter}
            title={assignees.length === 0 ? "My Tasks" : "All Tasks"}
            className={clsx(
              "sidebar-item w-full",
              "border-l-2 border-transparent",
              assignees.length > 0 && "sidebar-item-active"
            )}
          >
            <CgGoogleTasks className="h-4 w-4 shrink-0" />
            {expanded && (
              <span className="truncate animate-fade-in">
                {assignees.length === 0 ? "My Tasks" : "All Tasks"}
              </span>
            )}
          </button>
        )}

        {isAdminOrManager && (
          <NavSection
            label="CONFIG"
            items={configItems}
            expanded={expanded}
            pathname={pathname}
          />
        )}

        <NavSection
          label="REPORTS"
          items={reportItems}
          expanded={expanded}
          pathname={pathname}
        />
      </div>

      {/* ── AI Copilot CTA ────────────────────────────────────────────── */}
      <div className={clsx("px-2 pb-3 mt-auto border-t border-slate-200/80 dark:border-surface-border-d pt-3")}>
        <button
          className={clsx(
            "flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-sm font-semibold",
            "bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-300",
            "hover:bg-brand-100 dark:hover:bg-brand-500/20 transition-all duration-150"
          )}
          title="AI Copilot"
        >
          <HiOutlineSparkles className="h-4 w-4 shrink-0" />
          {expanded && <span className="animate-fade-in">AI Copilot</span>}
        </button>
      </div>
    </aside>
  );
};

/* ─── NavSection ────────────────────────────────────────────────────────── */
const NavSection: React.FC<{
  label: string;
  items: NavItemType[];
  expanded: boolean;
  pathname: string;
}> = ({ label, items, expanded, pathname }) => {
  const [visible, setVisible] = useState(true);

  return (
    <div className="flex flex-col gap-y-0.5">
      {expanded && (
        <button
          onClick={() => setVisible((v) => !v)}
          className="flex items-center gap-1 group mb-1"
        >
          <HiChevronRight
            className={clsx(
              "h-3 w-3 text-slate-400 transition-transform duration-150",
              visible && "rotate-90"
            )}
          />
          <span className="section-label">{label}</span>
        </button>
      )}

      {visible &&
        items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.id} href={item.href} passHref>
              <div
                title={!expanded ? item.label : undefined}
                className={clsx(
                  "sidebar-item border-l-2",
                  isActive
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300 font-semibold"
                    : "border-transparent",
                  !expanded && "justify-center px-0"
                )}
              >
                <item.Icon className="h-4 w-4 shrink-0" />
                {expanded && (
                  <span className="truncate text-sm animate-fade-in">
                    {item.label}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
    </div>
  );
};

export { Sidebar };