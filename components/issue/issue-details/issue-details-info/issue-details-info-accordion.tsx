"use client";

import { useState } from "react";
import { type IssueType } from "@/utils/types";
import { Avatar } from "@/components/avatar";
import { IssueAssigneeSelect } from "../../issue-select-assignee";
import { useIssues } from "@/hooks/query-hooks/use-issues";
import { useIsAuthenticated } from "@/hooks/use-is-authed";
import { useCookie } from "@/hooks/use-cookie";
import TimeTrackingModal from "@/components/modals/time-track";
import ProgressBar from "@/components/time-progress";
import { OriginalEstimate } from "@/components/original-estimate";
import {
  HiOutlineUser,
  HiOutlineFlag,
  HiOutlineClock,
  HiOutlineCalendar,
  HiOutlineArrowPath,
  HiOutlineUserCircle,
} from "react-icons/hi2";
import { dateToLongString } from "@/utils/helpers";

const IssueDetailsInfoAccordion: React.FC<{ issue: IssueType }> = ({
  issue,
}) => {
  const { updateIssue } = useIssues(issue.sprintId);
  const [isAuthenticated, openAuthModal] = useIsAuthenticated();

  const user = useCookie("user");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  function handleAutoAssign() {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    if (user?.id) {
      updateIssue({
        issueId: issue.id,
        assigneeId: user.id,
      });
    }
  }

  function handleProgressBarClick() {
    setIsModalOpen(true);
  }

  return (
    <>
      <div className="rounded-2xl border border-slate-200/80 dark:border-surface-border-d bg-white dark:bg-surface-raised-d/60 shadow-card p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pb-1 border-b border-slate-100 dark:border-surface-border-d">
          Properties
        </h3>

        <div className="space-y-3.5 text-xs">
          {/* Assignee */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
              <HiOutlineUser className="h-4 w-4 text-slate-400" />
              <span>Assignee</span>
            </div>
            <div className="flex flex-col items-end">
              <IssueAssigneeSelect issue={issue} />
              {!issue.assignee && (
                <button
                  onClick={handleAutoAssign}
                  className="mt-1 text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Assign to me
                </button>
              )}
            </div>
          </div>

          {/* Sprint */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
              <HiOutlineFlag className="h-4 w-4 text-slate-400" />
              <span>Sprint</span>
            </div>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[160px]">
              {issue?.sprint?.name ?? "Backlog (No sprint)"}
            </span>
          </div>

          {/* Reporter */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
              <HiOutlineUserCircle className="h-4 w-4 text-slate-400" />
              <span>Reporter</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Avatar
                src={issue.reporter?.avatar}
                alt={issue.reporter?.name ?? "Unassigned"}
                className="h-5 w-5"
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {issue.reporter?.name ?? "Admin"}
              </span>
            </div>
          </div>

          {/* Original Estimate */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
              <HiOutlineClock className="h-4 w-4 text-slate-400" />
              <span>Estimate</span>
            </div>
            <OriginalEstimate
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              issue={issue}
              className="rounded-lg bg-slate-100 dark:bg-surface-overlay-d px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300"
            />
          </div>

          {/* Time Tracking */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
              <HiOutlineClock className="h-4 w-4 text-slate-400" />
              <span>Time Tracking</span>
            </div>
            <div
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleProgressBarClick}
            >
              <ProgressBar
                timeSpent={issue.timeSpent}
                estimateTime={issue.estimateTime}
              />
            </div>
          </div>

          {/* Created */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-surface-border-d">
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-[11px]">
              <HiOutlineCalendar className="h-3.5 w-3.5" />
              <span>Created</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {dateToLongString(issue.createdAt)}
            </span>
          </div>

          {/* Updated */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-[11px]">
              <HiOutlineArrowPath className="h-3.5 w-3.5" />
              <span>Updated</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {dateToLongString(issue.updatedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Time Tracking Modal */}
      {isModalOpen && (
        <TimeTrackingModal
          issue={issue}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export { IssueDetailsInfoAccordion };
