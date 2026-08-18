"use client";

import React, { useRef, useState } from "react";
import { IssueTitle } from "../../issue-title";
import { IssueSelectStatus } from "../../issue-select-status";
import { type IssueType } from "@/utils/types";
import { Comments } from "./issue-details-info-comments";
import { Description } from "./issue-details-info-description";
import { IssueDetailsInfoAccordion } from "./issue-details-info-accordion";
import { IssueDetailsInfoActions } from "./issue-details-info-actions";
import { ChildIssueList } from "./issue-details-info-child-issues";
import { hasChildren, isEpic } from "@/utils/helpers";
import { ColorPicker } from "@/components/color-picker";
import { useContainerWidth } from "@/hooks/use-container-width";
import Worklog from "./issue-details-info-worklog";
import { HiOutlineChatBubbleLeftRight, HiOutlineClock } from "react-icons/hi2";
import clsx from "clsx";

const IssueDetailsInfo = React.forwardRef<
  HTMLDivElement,
  { issue: IssueType | undefined; detailPage?: boolean }
>(({ issue, detailPage }, ref) => {
  const [parentRef, parentWidth] = useContainerWidth();

  if (!issue) return <div />;

  // Full page view (standalone /TSQ/issue/TSQ-1)
  if (detailPage && parentWidth && parentWidth > 768) {
    return (
      <div ref={parentRef} className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left / Main Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-2">
              {isEpic(issue) && <ColorPicker issue={issue} />}
              <div className="w-full">
                <IssueTitle
                  className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 py-1"
                  key={issue.id + issue.name}
                  issue={issue}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <IssueSelectStatus
                key={issue.id + issue.status}
                currentStatus={issue.status}
                issueId={issue.id}
                variant="sm"
              />
              <IssueDetailsInfoActions
                onAddChildIssue={() => {}}
                issue={issue}
              />
            </div>

            <Description issue={issue} key={issue.id + (issue.description || "")} />

            {hasChildren(issue) && (
              <ChildIssueList
                issues={issue.children}
                parentIsEpic={isEpic(issue)}
                parentId={issue.id}
              />
            )}

            <ActivityTabs issue={issue} />
          </div>

          {/* Right / Properties Column (4 cols) */}
          <div className="lg:col-span-4 sticky top-20">
            <IssueDetailsInfoAccordion issue={issue} />
          </div>
        </div>
      </div>
    );
  }

  // Side drawer / modal view (Backlog & Board right panel)
  return (
    <div ref={parentRef} className="p-5 space-y-5">
      {/* Title */}
      <div className="flex items-center gap-2">
        {isEpic(issue) && <ColorPicker issue={issue} />}
        <div className="w-full">
          <IssueTitle
            className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 py-0.5"
            key={issue.id + issue.name}
            issue={issue}
          />
        </div>
      </div>

      {/* Actions & Status */}
      <div className="flex flex-wrap items-center gap-2.5">
        <IssueSelectStatus
          key={issue.id + issue.status}
          currentStatus={issue.status}
          issueId={issue.id}
          variant="sm"
        />
        <IssueDetailsInfoActions
          onAddChildIssue={() => {}}
          issue={issue}
        />
      </div>

      {/* Description */}
      <Description issue={issue} key={issue.id + (issue.description || "")} />

      {/* Properties Card (full width in drawer) */}
      <IssueDetailsInfoAccordion issue={issue} />

      {/* Subtasks (if any) */}
      {hasChildren(issue) && (
        <ChildIssueList
          issues={issue.children}
          parentIsEpic={isEpic(issue)}
          parentId={issue.id}
        />
      )}

      {/* Activity Section */}
      <ActivityTabs issue={issue} />
    </div>
  );
});

IssueDetailsInfo.displayName = "IssueDetailsInfo";

const ActivityTabs: React.FC<{ issue: IssueType }> = ({ issue }) => {
  const [activeTab, setActiveTab] = useState<"comments" | "worklog">("comments");

  return (
    <div className="pt-4 border-t border-slate-100 dark:border-surface-border-d space-y-4">
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-xl bg-slate-100 dark:bg-surface-overlay-d p-1">
          <button
            onClick={() => setActiveTab("comments")}
            className={clsx(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150",
              activeTab === "comments"
                ? "bg-white dark:bg-surface-raised-d text-slate-900 dark:text-slate-100 shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            )}
          >
            <HiOutlineChatBubbleLeftRight className="h-3.5 w-3.5" />
            <span>Comments</span>
          </button>
          <button
            onClick={() => setActiveTab("worklog")}
            className={clsx(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150",
              activeTab === "worklog"
                ? "bg-white dark:bg-surface-raised-d text-slate-900 dark:text-slate-100 shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            )}
          >
            <HiOutlineClock className="h-3.5 w-3.5" />
            <span>Worklog</span>
          </button>
        </div>
      </div>

      <div>
        {activeTab === "comments" ? (
          <Comments issue={issue} />
        ) : (
          <Worklog issue={issue} />
        )}
      </div>
    </div>
  );
};

export { IssueDetailsInfo };
