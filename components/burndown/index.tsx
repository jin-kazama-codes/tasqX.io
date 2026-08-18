"use client";

import React, { Fragment, useEffect, useState } from "react";
import { useCookie } from "@/hooks/use-cookie";
import { BurndownHeader } from "./header";
import BurndownIssueList from "./burndown-issue-list";
import { useIssues } from "@/hooks/query-hooks/use-issues";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { HiOutlineFire, HiOutlineSparkles } from "react-icons/hi2";

const ITEMS_PER_PAGE = 20;

const Burndown: React.FC = () => {
  const project = useCookie("project");
  const [sprintId, setSprintId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { issues, issuesLoading } = useIssues(sprintId);

  const allIssues =
    issues?.flatMap((issue) => [issue, ...(issue.children || [])]) || [];

  const totalPages = Math.ceil(allIssues?.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedIssues = allIssues?.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [sprintId]);

  if (!project) return null;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <BurndownHeader
        project={project}
        sprintId={sprintId}
        setSprintId={setSprintId}
      />

      <div className="rounded-2xl border border-slate-200/80 dark:border-surface-border-d bg-white dark:bg-surface-raised-d shadow-card overflow-hidden">
        {allIssues?.length > 0 ? (
          <>
            <BurndownIssueList issues={paginatedIssues} />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-surface-border-d px-6 py-3 bg-slate-50/50 dark:bg-surface-overlay-d/40">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Showing <span className="font-semibold">{startIndex + 1}</span> to{" "}
                  <span className="font-semibold">{Math.min(endIndex, allIssues?.length)}</span> of{" "}
                  <span className="font-semibold">{allIssues?.length}</span> tasks
                </p>

                <div className="flex items-center gap-1.5">
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-surface-border-d bg-white dark:bg-surface-raised-d text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-surface-overlay-d disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <FaChevronLeft className="h-3 w-3" />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`h-8 w-8 rounded-lg text-xs font-semibold transition-colors ${
                            page === currentPage
                              ? "bg-brand-500 text-white"
                              : "bg-slate-100 dark:bg-surface-overlay-d text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-surface-border-d"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-surface-border-d bg-white dark:bg-surface-raised-d text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-surface-overlay-d disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <FaChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 mb-4 border border-amber-500/20 shadow-xs">
              <HiOutlineFire className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              No Closed Sprints Yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
              Complete and close your active sprint on the Backlog or Board page to generate automated burndown charts and velocity analytics.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export { Burndown };
