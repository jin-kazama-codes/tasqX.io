import { HiOutlinePlus, HiOutlineSparkles } from "react-icons/hi2";
import { type IssueType } from "@/utils/types";

const IssueDetailsInfoActions: React.FC<{
  onAddChildIssue: () => void;
  variant?: "sm" | "lg";
  issue?: IssueType;
}> = ({ onAddChildIssue, variant = "sm" }) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onAddChildIssue}
        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-surface-border-d bg-white dark:bg-surface-raised-d px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-brand-300 dark:hover:border-brand-500/50 hover:bg-slate-50 dark:hover:bg-surface-overlay-d transition-all duration-150 shadow-2xs"
      >
        <HiOutlinePlus className="h-3.5 w-3.5 text-brand-500" />
        <span>Add subtask</span>
      </button>
    </div>
  );
};

export { IssueDetailsInfoActions };
