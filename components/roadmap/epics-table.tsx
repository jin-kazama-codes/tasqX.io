"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
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
import {
  assigneeNotInFilters,
  epicNotInFilters,
  isSubtask,
  issueNotInSearch,
  issueSprintNotInFilters,
  issueTypeNotInFilters,
} from "@/utils/helpers";
import { useFiltersContext } from "@/context/use-filters-context";
import { useIsAuthenticated } from "@/hooks/use-is-authed";
import { useCookie } from "@/hooks/use-cookie";
import {
  HiOutlineBolt,
  HiOutlinePlus,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
} from "react-icons/hi2";

type CreateIssueProps = {
  name: string;
  type: IssueType["type"];
  parentId?: IssueType["id"] | null;
  sprintColor?: string | null;
};

const EpicsTable: React.FC = () => {
  const { createIssue, isCreating, issues, issuesLoading } = useIssues();
  const [isCreatingEpic, setIsCreatingEpic] = useState(false);
  const renderContainerRef = useRef<HTMLDivElement>(null);
  const [isAuthenticated, openAuthModal] = useIsAuthenticated();
  const user = useCookie("user");
  const userId = `${user?.id}`;

  useLayoutEffect(() => {
    if (!renderContainerRef.current) return;
    const calculatedHeight = renderContainerRef.current.offsetTop + 15;
    renderContainerRef.current.style.height = `calc(100vh - ${calculatedHeight}px)`;
  }, []);

  function handleCreateIssue({
    name,
    type,
    parentId = null,
    sprintColor = null,
  }: CreateIssueProps) {
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
      <div className="w-full space-y-3 p-4">
        <div className="skeleton h-16 w-full rounded-2xl" />
        <div className="skeleton h-16 w-full rounded-2xl" />
        <div className="skeleton h-16 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div
      className="w-full overflow-y-auto rounded-2xl border border-slate-200/80 dark:border-surface-border-d bg-white dark:bg-surface-raised-d shadow-card flex flex-col"
      ref={renderContainerRef}
    >
      {/* Top Action Bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 dark:border-surface-border-d bg-slate-50/80 dark:bg-surface-overlay-d/80 backdrop-blur-md px-5 py-3">
        <div className="flex items-center gap-2">
          <HiOutlineBolt className="h-4 w-4 text-violet-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Epics & Initiatives
          </span>
        </div>

        <button
          onClick={() => setIsCreatingEpic(true)}
          className="btn-brand py-1.5 px-3 text-xs inline-flex items-center gap-1"
        >
          <HiOutlinePlus className="h-3.5 w-3.5" />
          <span>New Epic</span>
        </button>
      </div>

      {/* Accordion / Table */}
      <div className="flex-1 p-3">
        <EpicsAccordion handleCreateIssue={handleCreateIssue} />
      </div>

      {/* Inline Create Epic Form */}
      {isCreatingEpic && (
        <div className="p-4 border-t border-slate-100 dark:border-surface-border-d bg-slate-50/50 dark:bg-surface-overlay-d/40">
          <EmtpyIssue
            data-state={isCreatingEpic ? "open" : "closed"}
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

const EpicsAccordion: React.FC<{
  handleCreateIssue: (props: CreateIssueProps) => void;
}> = ({ handleCreateIssue }) => {
  const [creationParent, setCreationParent] = useState<string | null>(null);
  const { setIssueKey, issueKey: selectedIssueKey } = useSelectedIssueContext();
  const { issues, isCreating } = useIssues();
  const { search, assignees, issueTypes, epics, sprints } = useFiltersContext();
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);

  const epicsList = (issues || []).filter((issue) => issue.type === "EPIC");

  // Get child tasks linked to this epic
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

  if (epicsList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 dark:bg-violet-500/20 text-violet-500 mb-3 border border-violet-500/20">
          <HiOutlineBolt className="h-7 w-7" />
        </div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          No Epics Found
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1">
          Create an Epic to group user stories, track major features, and visualize roadmap progress.
        </p>
      </div>
    );
  }

  return (
    <Accordion
      value={openAccordions}
      onValueChange={setOpenAccordions}
      type="multiple"
      className="space-y-3"
    >
      {epicsList.map((epic) => {
        const { percent, completed, total } = calculateProgress(epic.id);
        const children = getEpicChildren(epic.id);

        return (
          <AccordionItem
            key={epic.id}
            value={epic.key}
            className="rounded-2xl border border-slate-200/80 dark:border-surface-border-d bg-white dark:bg-surface-raised-d overflow-hidden shadow-2xs transition-all"
          >
            <div className="flex items-center justify-between p-3.5 hover:bg-slate-50/70 dark:hover:bg-surface-overlay-d/40 transition-colors">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <AccordionTrigger className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-border-d transition-transform [&[data-state=open]>svg]:rotate-90">
                  <FaChevronRight className="h-3 w-3 text-slate-400" />
                </AccordionTrigger>

                <div
                  className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                  onClick={() => setIssueKey(epic.key)}
                >
                  <IssueIcon issueType="EPIC" />
                  <span className="font-mono text-[11px] font-extrabold px-2 py-0.5 rounded-lg bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/20">
                    {epic.key}
                  </span>
                  <span className="truncate text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                    {epic.name}
                  </span>
                </div>
              </div>

              {/* Progress & Metadata */}
              <div className="flex items-center gap-4 shrink-0 pl-2">
                {total > 0 && (
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="w-24 h-2 rounded-full bg-slate-100 dark:bg-surface-border-d overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {completed}/{total} ({percent}%)
                    </span>
                  </div>
                )}

                <IssueSelectStatus
                  key={epic.id + epic.status}
                  currentStatus={epic.status}
                  issueId={epic.id}
                  variant="sm"
                />

                <IssueAssigneeSelect issue={epic} avatarOnly />
              </div>
            </div>

            {/* Child items listed inside Epic */}
            <AccordionContent className="border-t border-slate-100 dark:border-surface-border-d bg-slate-50/40 dark:bg-surface-overlay-d/20 p-3 space-y-2">
              {children.length === 0 ? (
                <p className="text-xs text-slate-400 px-3 py-2">
                  No tasks or stories linked to this Epic yet.
                </p>
              ) : (
                children.map((child) => (
                  <div
                    key={child.id}
                    onClick={() => setIssueKey(child.key)}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/60 dark:border-surface-border-d bg-white dark:bg-surface-raised-d hover:border-brand-300 dark:hover:border-brand-500/40 cursor-pointer transition-colors shadow-2xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <IssueIcon issueType={child.type} />
                      <span className="font-mono text-[11px] font-extrabold text-slate-500">
                        {child.key}
                      </span>
                      <span className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {child.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <IssueSelectStatus
                        currentStatus={child.status}
                        issueId={child.id}
                        variant="sm"
                      />
                      <IssueAssigneeSelect issue={child} avatarOnly />
                    </div>
                  </div>
                ))
              )}

              {/* Add Task to Epic Button */}
              {creationParent === epic.id ? (
                <div className="pt-2">
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
                <button
                  onClick={() => setCreationParent(epic.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 px-3 py-1.5 rounded-lg hover:bg-brand-50/50 dark:hover:bg-brand-500/10 transition-colors"
                >
                  <HiOutlinePlus className="h-3.5 w-3.5" />
                  <span>Add story or task to this Epic</span>
                </button>
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};

export { EpicsTable };
