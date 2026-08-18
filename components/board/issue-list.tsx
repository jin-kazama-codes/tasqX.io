import { useStrictModeDroppable } from "@/hooks/use-strictmode-droppable";
import { type IssueType } from "@/utils/types";
import { Droppable } from "react-beautiful-dnd";
import { Issue } from "./issue";
import clsx from "clsx";
import { EmtpyIssue } from "../issue/issue-empty";
import { HiOutlinePlus } from "react-icons/hi2";
import { useState } from "react";
import { useIssues } from "@/hooks/query-hooks/use-issues";
import { useIsAuthenticated } from "@/hooks/use-is-authed";

const formatStatus = (s: string) => {
  if (s === "TODO" || s === "To Do") return "To Do";
  if (s === "IN_PROGRESS" || s === "In Progress") return "In Progress";
  if (s === "DONE" || s === "Done") return "Done";
  return s;
};

const getStatusDotColor = (status: string) => {
  switch (status) {
    case "TODO":
    case "To Do":
      return "bg-slate-400";
    case "IN_PROGRESS":
    case "In Progress":
      return "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]";
    case "DONE":
    case "Done":
      return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]";
    default:
      return "bg-violet-500";
  }
};

const IssueList: React.FC<{
  sprintId: string | null;
  status: string;
  issues: IssueType[];
  showChild?: boolean;
  parentId?: string | null;
  statusColors?: any;
}> = ({ sprintId, status, issues, showChild, parentId, statusColors }) => {
  const [droppableEnabled] = useStrictModeDroppable();
  const { createIssue, isCreating } = useIssues(sprintId);
  const [isEditing, setIsEditing] = useState(false);
  const [isAuthenticated, openAuthModal] = useIsAuthenticated();

  if (!droppableEnabled) {
    return null;
  }

  function handleCreateIssue({
    name,
    type,
  }: {
    name: string;
    type: IssueType["type"];
  }) {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    if (!name) {
      return;
    }

    const issueParentId = showChild ? parentId : null;
    const newSprintId = showChild ? null : sprintId;

    createIssue(
      {
        name,
        type,
        status,
        parentId: issueParentId,
        sprintId: newSprintId,
        reporterId: null,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  }

  const columnIssues = issues.filter(
    (issue) =>
      issue.status === status ||
      (status === "TODO" && issue.status === "To Do") ||
      (status === "IN_PROGRESS" && issue.status === "In Progress") ||
      (status === "DONE" && issue.status === "Done")
  );

  const getDroppable = () => {
    return (
      <>
        <Droppable droppableId={status}>
          {({ droppableProps, innerRef, placeholder }) => (
            <div
              {...droppableProps}
              ref={innerRef}
              className="flex-1 min-h-[60px] flex flex-col gap-2 py-1"
            >
              {columnIssues
                .sort((a, b) => a.boardPosition - b.boardPosition)
                .map((child, index) => (
                  <Issue key={child.id} index={index} issue={child} />
                ))}
              {placeholder}
            </div>
          )}
        </Droppable>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 dark:border-surface-border-d py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-500/5 transition-all duration-150"
          >
            <HiOutlinePlus className="h-3.5 w-3.5" />
            <span>Create task</span>
          </button>
        ) : (
          <div className="mt-2">
            <EmtpyIssue
              data-state={isEditing ? "open" : "closed"}
              className="[&[data-state=closed]]:hidden"
              onCreate={({ name, type }) => handleCreateIssue({ name, type })}
              onCancel={() => setIsEditing(false)}
              isCreating={isCreating}
            />
          </div>
        )}
      </>
    );
  };

  return (
    <>
      {!showChild ? (
        <div className="flex flex-col w-[320px] shrink-0 rounded-2xl border border-slate-200/80 dark:border-surface-border-d bg-slate-50/70 dark:bg-surface-raised-d/60 backdrop-blur-sm p-3 shadow-sm max-h-full">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 px-1">
            <div className="flex items-center gap-2">
              <span
                className={clsx(
                  "h-2 w-2 rounded-full shrink-0",
                  getStatusDotColor(status)
                )}
              />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                {formatStatus(status)}
              </h2>
            </div>
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white dark:bg-surface-overlay-d border border-slate-200 dark:border-surface-border-d px-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 shadow-2xs">
              {columnIssues.length}
            </span>
          </div>

          {/* Issue items */}
          <div className="custom-scrollbar flex-1 overflow-y-auto pr-0.5">
            {getDroppable()}
          </div>
        </div>
      ) : (
        getDroppable()
      )}
    </>
  );
};

export { IssueList };
