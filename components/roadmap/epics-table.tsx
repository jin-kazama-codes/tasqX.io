"use client";

import React, { useCallback, useLayoutEffect, useRef, useState, useMemo } from "react";
import {
  AccordionItem,
  Accordion,
  AccordionTrigger,
  AccordionContent,
} from "../ui/accordion";
import { FaChevronRight } from "react-icons/fa";
import { IssueIcon } from "../issue/issue-icon";
import { useIssues } from "@/hooks/query-hooks/use-issues";
import clsx from "clsx";
import { IssueSelectStatus } from "../issue/issue-select-status";
import { IssueAssigneeSelect } from "../issue/issue-select-assignee";
import { useSelectedIssueContext } from "@/context/use-selected-issue-context";
import { EmtpyIssue } from "../issue/issue-empty";
import { type IssueType } from "@/utils/types";
import { LIGHT_COLORS } from "../color-picker";
import { useFiltersContext } from "@/context/use-filters-context";
import { useIsAuthenticated } from "@/hooks/use-is-authed";
import { useCookie } from "@/hooks/use-cookie";
import {
  HiOutlineBolt,
  HiOutlinePlus,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineArrowsPointingOut,
} from "react-icons/hi2";

type ViewMode = "weeks" | "months" | "quarters";

const EpicsTable: React.FC = () => {
  const { createIssue, isCreating, issues, issuesLoading } = useIssues();
  const [isCreatingEpic, setIsCreatingEpic] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("months");
  const [isAuthenticated, openAuthModal] = useIsAuthenticated();
  const user = useCookie("user");
  const userId = `${user?.id}`;

  function handleCreateIssue({
    name,
    type,
    parentId = null,
    sprintColor = null,
  }: {
    name: string;
    type: IssueType["type"];
    parentId?: IssueType["id"] | null;
    sprintColor?: string | null;
  }) {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    if (!name) return;

    createIssue(
      {
        name,
        type,
        parentId,
        sprintId: null,
        reporterId: userId,
        sprintColor,
      },
      {
        onSuccess: () => {
          setIsCreatingEpic(false);
        },
      }
    );
  }

  if (issuesLoading) {
    return (
      <div className="w-full space-y-4 p-6">
        <div className="skeleton h-12 w-full rounded-2xl" />
        <div className="skeleton h-28 w-full rounded-2xl" />
        <div className="skeleton h-28 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col rounded-2xl border border-slate-200/80 dark:border-surface-border-d bg-white dark:bg-surface-raised-d shadow-card overflow-hidden">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-surface-border-d bg-slate-50/80 dark:bg-surface-overlay-d/80 px-5 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400">
            <HiOutlineBolt className="h-4 w-4" />
          </div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Roadmap Timeline
          </span>
        </div>

        {/* Controls: View switch & New Epic */}
        <div className="flex items-center gap-2.5">
          <div className="inline-flex rounded-xl bg-slate-200/70 dark:bg-surface-overlay-d p-0.5">
            {(["weeks", "months", "quarters"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={clsx(
                  "px-2.5 py-1 text-[11px] font-bold capitalize rounded-lg transition-all",
                  viewMode === mode
                    ? "bg-white dark:bg-surface-raised-d text-slate-900 dark:text-slate-100 shadow-2xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                )}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsCreatingEpic(true)}
            className="btn-brand py-1.5 px-3 text-xs inline-flex items-center gap-1"
          >
            <HiOutlinePlus className="h-3.5 w-3.5" />
            <span>New Epic</span>
          </button>
        </div>
      </div>

      {/* Main Roadmap Timeline Container */}
      <div className="flex-1 overflow-y-auto">
        <RoadmapTimeline
          viewMode={viewMode}
          handleCreateIssue={handleCreateIssue}
        />
      </div>

      {/* Inline Create Epic Form */}
      {isCreatingEpic && (
        <div className="p-4 border-t border-slate-100 dark:border-surface-border-d bg-slate-50/50 dark:bg-surface-overlay-d/40">
          <EmtpyIssue
            data-state="open"
            onCreate={({ name }) =>
              handleCreateIssue({
                name,
                type: "EPIC",
                sprintColor: LIGHT_COLORS[0]?.hex ?? "#7c3aed",
              })
            }
            onCancel={() => setIsCreatingEpic(false)}
            isCreating={isCreating}
            isEpic
          />
        </div>
      )}
    </div>
  );
};

const RoadmapTimeline: React.FC<{
  viewMode: ViewMode;
  handleCreateIssue: (props: any) => void;
}> = ({ viewMode, handleCreateIssue }) => {
  const [creationParent, setCreationParent] = useState<string | null>(null);
  const { setIssueKey, issueKey: selectedIssueKey } = useSelectedIssueContext();
  const { issues, isCreating } = useIssues();
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);

  const epicsList = useMemo(
    () => (issues || []).filter((issue) => issue.type === "EPIC"),
    [issues]
  );

  // Define Timeline Columns
  const timeColumns = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();

    if (viewMode === "weeks") {
      return [
        "W1 (Aug)",
        "W2 (Aug)",
        "W3 (Aug)",
        "W4 (Aug)",
        "W1 (Sep)",
        "W2 (Sep)",
        "W3 (Sep)",
        "W4 (Sep)",
      ];
    }
    if (viewMode === "quarters") {
      return [
        `Q1 ${currentYear}`,
        `Q2 ${currentYear}`,
        `Q3 ${currentYear}`,
        `Q4 ${currentYear}`,
        `Q1 ${currentYear + 1}`,
      ];
    }
    // Default: Months
    return [
      "Jul 2026",
      "Aug 2026",
      "Sep 2026",
      "Oct 2026",
      "Nov 2026",
      "Dec 2026",
      "Jan 2027",
    ];
  }, [viewMode]);

  const getEpicChildren = (epicId: string) => {
    return (issues || []).filter((item) => item.parentId === epicId);
  };

  const calculateProgress = (epicId: string) => {
    const children = getEpicChildren(epicId);
    if (children.length === 0) return { percent: 0, completed: 0, total: 0 };
    const completed = children.filter((c) => c.status === "DONE").length;
    return {
      percent: Math.round((completed / children.length) * 100),
      completed,
      total: children.length,
    };
  };

  // Helper to generate consistent Gantt bar span for each Epic
  const getGanttBarStyle = (index: number, percent: number) => {
    if (viewMode === "weeks") {
      const left = index === 0 ? "12%" : "36%";
      const width = index === 0 ? "48%" : "52%";
      return { left, width };
    }
    if (viewMode === "quarters") {
      const left = index === 0 ? "40%" : "55%";
      const width = index === 0 ? "35%" : "30%";
      return { left, width };
    }
    // Months view
    const left = index === 0 ? "14%" : "28%";
    const width = index === 0 ? "42%" : "48%";
    return { left, width };
  };

  if (epicsList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-violet-500/10 dark:bg-violet-500/20 text-violet-500 mb-3 border border-violet-500/20">
          <HiOutlineBolt className="h-7 w-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
          No Epics on Roadmap
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
          Create an Epic to schedule milestones, visualize delivery dates, and track completion progress across months.
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-[800px] flex flex-col">
      {/* Timeline Grid Header */}
      <div className="flex border-b border-slate-100 dark:border-surface-border-d bg-slate-50/50 dark:bg-surface-overlay-d/40 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky top-0 z-10">
        {/* Left column header: Epics list */}
        <div className="w-[360px] shrink-0 px-5 py-3 border-r border-slate-100 dark:border-surface-border-d flex items-center justify-between">
          <span>Epics & Deliverables</span>
          <span className="text-[10px] font-normal text-slate-400">
            {epicsList.length} epics
          </span>
        </div>

        {/* Right column header: Timeline columns */}
        <div className="flex-1 grid grid-flow-col auto-cols-fr">
          {timeColumns.map((col, idx) => (
            <div
              key={col}
              className={clsx(
                "px-3 py-3 text-center border-r border-slate-100 dark:border-surface-border-d/60",
                idx === 1 && "bg-brand-500/5 text-brand-600 dark:text-brand-400 font-extrabold"
              )}
            >
              {col}
            </div>
          ))}
        </div>
      </div>

      {/* Accordion Rows */}
      <Accordion
        value={openAccordions}
        onValueChange={setOpenAccordions}
        type="multiple"
        className="divide-y divide-slate-100 dark:divide-surface-border-d"
      >
        {epicsList.map((epic, index) => {
          const { percent, completed, total } = calculateProgress(epic.id);
          const children = getEpicChildren(epic.id);
          const barStyle = getGanttBarStyle(index, percent);

          return (
            <AccordionItem
              key={epic.id}
              value={epic.key}
              className="border-none"
            >
              {/* Epic Row (Split into Left details + Right Gantt Bar) */}
              <div className="flex items-center group hover:bg-slate-50/60 dark:hover:bg-surface-overlay-d/30 transition-colors">
                {/* Left Hierarchy Details (360px) */}
                <div className="w-[360px] shrink-0 p-3.5 border-r border-slate-100 dark:border-surface-border-d flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <AccordionTrigger className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-border-d transition-transform [&[data-state=open]>svg]:rotate-90">
                      <FaChevronRight className="h-3 w-3 text-slate-400" />
                    </AccordionTrigger>

                    <div
                      className="flex items-center gap-2 cursor-pointer min-w-0 flex-1"
                      onClick={() => setIssueKey(epic.key)}
                    >
                      <IssueIcon issueType="EPIC" />
                      <span className="font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/20 shrink-0">
                        {epic.key}
                      </span>
                      <span className="truncate text-xs font-bold text-slate-800 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                        {epic.name}
                      </span>
                    </div>
                  </div>

                  <IssueSelectStatus
                    key={epic.id + epic.status}
                    currentStatus={epic.status}
                    issueId={epic.id}
                    variant="sm"
                  />
                </div>

                {/* Right Gantt Bar Area */}
                <div className="flex-1 relative h-14 flex items-center px-4">
                  {/* Background grid vertical lines */}
                  <div className="absolute inset-0 grid grid-flow-col auto-cols-fr pointer-events-none">
                    {timeColumns.map((col, idx) => (
                      <div
                        key={col}
                        className={clsx(
                          "border-r border-slate-100/70 dark:border-surface-border-d/40 h-full",
                          idx === 1 && "bg-brand-500/[0.03]"
                        )}
                      />
                    ))}
                  </div>

                  {/* Gantt Timeline Bar */}
                  <div
                    onClick={() => setIssueKey(epic.key)}
                    style={{ left: barStyle.left, width: barStyle.width }}
                    className="absolute h-7 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm flex items-center justify-between px-3 cursor-pointer hover:shadow-glow-sm transition-all duration-150 group/bar z-1"
                  >
                    <span className="truncate text-[11px] font-bold text-white drop-shadow-xs">
                      {epic.name}
                    </span>

                    {total > 0 ? (
                      <span className="text-[10px] font-extrabold bg-white/20 px-1.5 py-0.5 rounded-md shrink-0 ml-2">
                        {percent}%
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-white/80 shrink-0 ml-2">
                        Planning
                      </span>
                    )}

                    {/* Inner progress fill */}
                    {percent > 0 && (
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-white/20 rounded-l-xl pointer-events-none"
                        style={{ width: `${percent}%` }}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Expandable Child Tasks inside Epic */}
              <AccordionContent className="border-t border-slate-100 dark:border-surface-border-d bg-slate-50/30 dark:bg-surface-overlay-d/10 p-0">
                {children.length === 0 ? (
                  <div className="py-2.5 px-12 text-xs text-slate-400">
                    No linked tasks or stories.
                  </div>
                ) : (
                  children.map((child, cIdx) => (
                    <div
                      key={child.id}
                      className="flex items-center border-t border-slate-100/60 dark:border-surface-border-d/40 hover:bg-slate-50/80 dark:hover:bg-surface-overlay-d/40 transition-colors"
                    >
                      {/* Left Child Details */}
                      <div
                        onClick={() => setIssueKey(child.key)}
                        className="w-[360px] shrink-0 py-2 px-6 border-r border-slate-100 dark:border-surface-border-d flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1 pl-4">
                          <IssueIcon issueType={child.type} />
                          <span className="font-mono text-[10px] font-bold text-slate-500">
                            {child.key}
                          </span>
                          <span className="truncate text-xs font-medium text-slate-700 dark:text-slate-300">
                            {child.name}
                          </span>
                        </div>
                        <IssueSelectStatus
                          currentStatus={child.status}
                          issueId={child.id}
                          variant="sm"
                        />
                      </div>

                      {/* Right Child Sub-bar */}
                      <div className="flex-1 relative h-9 flex items-center px-4">
                        <div className="absolute inset-0 grid grid-flow-col auto-cols-fr pointer-events-none">
                          {timeColumns.map((col) => (
                            <div
                              key={col}
                              className="border-r border-slate-100/40 dark:border-surface-border-d/20 h-full"
                            />
                          ))}
                        </div>

                        {/* Child Task Mini Bar */}
                        <div
                          onClick={() => setIssueKey(child.key)}
                          style={{
                            left: `${parseFloat(barStyle.left) + cIdx * 5}%`,
                            width: `${parseFloat(barStyle.width) * 0.45}%`,
                          }}
                          className={clsx(
                            "absolute h-4 rounded-md flex items-center px-2 cursor-pointer text-[10px] font-bold shadow-2xs transition-all",
                            child.status === "DONE"
                              ? "bg-emerald-500 text-white"
                              : child.status === "IN_PROGRESS"
                              ? "bg-brand-500 text-white"
                              : "bg-slate-200 dark:bg-surface-border-d text-slate-700 dark:text-slate-300"
                          )}
                        >
                          <span className="truncate">{child.key}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* Add Story / Task directly under Epic */}
                {creationParent === epic.id ? (
                  <div className="p-3 border-t border-slate-100 dark:border-surface-border-d">
                    <EmtpyIssue
                      data-state="open"
                      onCreate={({ name, type }) => {
                        handleCreateIssue({
                          name,
                          type,
                          parentId: epic.id,
                        });
                        setCreationParent(null);
                      }}
                      onCancel={() => setCreationParent(null)}
                      isCreating={isCreating}
                    />
                  </div>
                ) : (
                  <div className="py-2 px-10 border-t border-slate-100/50 dark:border-surface-border-d/30">
                    <button
                      onClick={() => setCreationParent(epic.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 transition-colors"
                    >
                      <HiOutlinePlus className="h-3 w-3" />
                      <span>Add story or task to this Epic</span>
                    </button>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export { EpicsTable };
