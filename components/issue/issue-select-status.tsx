import { Fragment, useEffect, useState } from "react";
import { useIssues } from "@/hooks/query-hooks/use-issues";
import { FaChevronDown } from "react-icons/fa";
import clsx from "clsx";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectIcon,
  SelectItem,
  SelectPortal,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from "@/components/ui/select";
import { useIsAuthenticated } from "@/hooks/use-is-authed";
import { useWorkflow } from "@/hooks/query-hooks/use-workflow";
import { useRouter } from "next/navigation";

const DEFAULT_STATUSES = ["TODO", "IN_PROGRESS", "DONE"];

const IssueSelectStatus: React.FC<{
  currentStatus: string;
  issueId: string;
  variant?: "sm" | "lg";
  page?: string;
}> = ({ currentStatus, issueId, variant = "sm", page = "backlog" }) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const { data: workflow, isLoading } = useWorkflow();
  const [statuses, setStatuses] = useState<string[]>(DEFAULT_STATUSES);
  const router = useRouter();

  useEffect(() => {
    if (workflow && workflow.nodes && workflow.nodes.length > 0) {
      const labels = workflow.nodes.map((node: any) => node.data.label);
      setStatuses(labels);
    } else {
      setStatuses(DEFAULT_STATUSES);
    }
  }, [workflow]);

  const { updateIssue, isUpdating } = useIssues();
  const [isAuthenticated, openAuthModal] = useIsAuthenticated();

  function handleSelectChange(value: string) {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    updateIssue({
      issueId,
      status: value,
    });
    setSelectedStatus(value);
  }

  const formatStatus = (s: string) => {
    if (s === "TODO") return "To Do";
    if (s === "IN_PROGRESS") return "In Progress";
    if (s === "DONE") return "Done";
    return s;
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "TODO":
      case "To Do":
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
      case "IN_PROGRESS":
      case "In Progress":
        return "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/40";
      case "DONE":
      case "Done":
        return "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <Fragment>
      <Select disabled={page !== "backlog"} onValueChange={handleSelectChange}>
        <SelectTrigger
          onClick={(e) => e.stopPropagation()}
          disabled={isUpdating}
          className={clsx(
            "flex items-center gap-x-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all duration-150",
            getStatusBadgeStyle(selectedStatus),
            isUpdating && "opacity-50 cursor-not-allowed"
          )}
        >
          <SelectValue className="w-full whitespace-nowrap bg-transparent">
            {formatStatus(selectedStatus)}
          </SelectValue>
          {page === "backlog" && (
            <SelectIcon>
              <FaChevronDown className="h-2.5 w-2.5 opacity-60 ml-0.5" />
            </SelectIcon>
          )}
        </SelectTrigger>
        <SelectPortal className="z-50">
          <SelectContent position="popper">
            <SelectViewport className="w-48 rounded-xl border border-slate-200 bg-white dark:bg-surface-raised-d dark:border-surface-border-d p-1.5 shadow-modal">
              <SelectGroup>
                {statuses.map((status) => (
                  <SelectItem
                    key={status}
                    value={status}
                    className="flex items-center rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-surface-overlay-d transition-colors cursor-pointer outline-none"
                  >
                    <span className="flex items-center gap-1.5">
                      <span
                        className={clsx(
                          "h-2 w-2 rounded-full",
                          status === "TODO" || status === "To Do"
                            ? "bg-slate-400"
                            : status === "IN_PROGRESS" || status === "In Progress"
                            ? "bg-indigo-500"
                            : "bg-emerald-500"
                        )}
                      />
                      {formatStatus(status)}
                    </span>
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectSeparator className="my-1 h-[1px] bg-slate-100 dark:bg-surface-border-d" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push("/workflow");
                }}
                className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-surface-overlay-d dark:text-slate-400 transition-colors"
              >
                ⚙️ Configure Workflow
              </button>
            </SelectViewport>
          </SelectContent>
        </SelectPortal>
      </Select>
    </Fragment>
  );
};

export { IssueSelectStatus };
