"use client";

import React, { useEffect, useState } from "react";
import { useIsInViewport } from "@/hooks/use-is-in-viewport";
import { IssueDetailsHeader } from "./issue-details-header";
import { IssueDetailsInfo } from "./issue-details-info";
import { useSelectedIssueContext } from "@/context/use-selected-issue-context";
import { useCookie } from "@/hooks/use-cookie";
import { getProjectKeyFromUrl, setCookie } from "@/utils/helpers";
import { useIssueDetails } from "@/hooks/query-hooks/use-issue-details";
import clsx from "clsx";

const IssueDetails: React.FC<{
  issueKey?: string;
  detailPage?: boolean;
  roadmap?: boolean;
}> = ({ issueKey: detailIssueKey, detailPage, roadmap = false }) => {
  const { issueKey, setIssueKey } = useSelectedIssueContext();
  const effectiveKey = detailIssueKey || issueKey;
  const { issue, issueLoading, refetch } = useIssueDetails(
    effectiveKey || undefined
  );
  const renderContainerRef = React.useRef<HTMLDivElement>(null);
  const [isInViewport, viewportRef] = useIsInViewport({ threshold: 1 });
  const project = useCookie("project");
  const [loading, setLoading] = useState(false);
  const projectKey = getProjectKeyFromUrl();

  useEffect(() => {
    if (detailIssueKey && detailIssueKey !== issueKey) {
      setIssueKey(detailIssueKey);
    }
  }, [detailIssueKey]);

  useEffect(() => {
    if (!project?.key && projectKey) {
      async function fetchProjectByKey(key: string) {
        try {
          const response = await fetch(`/api/project/${key}`);
          if (response.ok) {
            const data = await response.json();
            if (data.project) {
              setCookie("project", data.project);
            }
          }
        } catch (error) {
          console.error("Error fetching project:", error);
        }
      }
      fetchProjectByKey(projectKey);
    }
  }, [project?.key, projectKey]);

  // Don't render anything if not on detailPage and no issue is selected
  const isOpen = Boolean(detailPage || effectiveKey);
  if (!isOpen) return null;

  if (!roadmap && (issueLoading || loading)) {
    return (
      <div
        ref={renderContainerRef}
        className="relative z-10 flex w-full flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-surface-border-d dark:bg-surface-raised-d shadow-modal animate-fade-in"
      >
        <div className="flex items-center justify-between">
          <div className="skeleton h-5 w-24 rounded-lg" />
          <div className="flex gap-2">
            <div className="skeleton h-6 w-6 rounded-lg" />
            <div className="skeleton h-6 w-6 rounded-lg" />
          </div>
        </div>
        <div className="skeleton h-8 w-3/4 rounded-xl" />
        <div className="space-y-4 mt-2">
          <div className="skeleton h-24 w-full rounded-2xl" />
          <div className="skeleton h-32 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div
        ref={renderContainerRef}
        className="relative z-10 flex w-full flex-col items-center justify-center p-12 rounded-2xl border border-slate-200/80 dark:border-surface-border-d bg-white dark:bg-surface-raised-d shadow-card text-center"
      >
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Task not found
        </p>
        <p className="text-xs text-slate-400 mt-1">
          The selected task may have been removed or does not exist.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={renderContainerRef}
      data-state="open"
      className="relative z-10 flex w-full h-full flex-col rounded-2xl border border-slate-200/80 dark:border-surface-border-d bg-white dark:bg-surface-base-d shadow-card overflow-y-auto"
    >
      <IssueDetailsHeader
        detailPage={detailPage}
        issue={issue}
        setIssueKey={setIssueKey}
        isInViewport={isInViewport}
      />
      <div className="flex-1 overflow-y-auto">
        <IssueDetailsInfo
          detailPage={detailPage}
          issue={issue}
          ref={viewportRef}
        />
      </div>
    </div>
  );
};

export { IssueDetails };
