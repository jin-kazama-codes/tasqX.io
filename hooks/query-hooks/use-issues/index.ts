"use client";

import { api } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
import { useUpdateIssue } from "./use-update-issue";
import { useUpdateIssuesBatch } from "./use-update-batch";
import { usePostIssue } from "./use-post-issue";
import { useDeleteIssue } from "./use-delete-issue";

export const TOO_MANY_REQUESTS = {
  message: `You have exceeded the number of requests allowed per minute.`,
  description: "Please try again later.",
};

export const useIssues = (sprintId?: string | null) => {
  const sprintKey = sprintId !== undefined ? (sprintId === null ? "backlog" : sprintId) : "all";

  const { data: issues, isLoading: issuesLoading } = useQuery(
    ["issues", sprintKey],
    ({ signal }) => {
      if (sprintId === undefined) {
        return api.issues.getIssues({ signal });
      }
      return api.issues.getIssuesBySprintId({ signal }, sprintId);
    },
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: 1,
    }
  );

  const getIssueCountBySprintId = (targetSprintId?: string | null) => {
    return useQuery({
      queryKey: [`${targetSprintId}-count`, targetSprintId],
      queryFn: () => api.issues.getIssueCount(targetSprintId ?? targetSprintId),
      enabled: !!targetSprintId,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    });
  };

  const { updateIssuesBatch, batchUpdating } = useUpdateIssuesBatch(sprintKey);
  const { updateIssue, isUpdating } = useUpdateIssue(sprintKey);
  const { createIssue, isCreating } = usePostIssue(sprintKey);
  const { deleteIssue, isDeleting } = useDeleteIssue(sprintKey);

  return {
    issues,
    issuesLoading,
    updateIssue,
    isUpdating,
    createIssue,
    isCreating,
    deleteIssue,
    isDeleting,
    updateIssuesBatch,
    batchUpdating,
    getIssueCountBySprintId,
  };
};
