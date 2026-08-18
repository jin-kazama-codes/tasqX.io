import { MdClose } from "react-icons/md";
import { IssueDropdownMenu } from "../issue-menu";
import { DropdownTrigger } from "../../ui/dropdown-menu";
import { IssuePath } from "../issue-path";
import { type IssueType } from "@/utils/types";
import { Button } from "@/components/ui/button";
import { BsThreeDots } from "react-icons/bs";
import { useCookie } from "@/hooks/use-cookie";

const IssueDetailsHeader: React.FC<{
  issue: IssueType;
  setIssueKey: React.Dispatch<React.SetStateAction<string | null>>;
  isInViewport: boolean;
  detailPage?: boolean;
}> = ({ issue, setIssueKey, isInViewport, detailPage }) => {
  const user = useCookie("user");
  if (!issue) return <div />;

  return (
    <div className="sticky top-0 z-20 flex h-fit w-full items-center justify-between border-b border-slate-100 dark:border-surface-border-d bg-white/80 dark:bg-surface-raised-d/80 backdrop-blur-md px-6 py-3 transition-colors">
      <IssuePath issue={issue} setIssueKey={setIssueKey} />
      <div className="relative flex items-center gap-1">
        {(user?.role === "admin" || user?.role === "manager") && (
          <IssueDropdownMenu issue={issue}>
            <DropdownTrigger
              asChild
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-surface-overlay-d dark:hover:text-slate-100 transition-colors"
            >
              <button aria-label="Task actions">
                <BsThreeDots className="h-4 w-4" />
              </button>
            </DropdownTrigger>
          </IssueDropdownMenu>
        )}
        {!detailPage && (
          <button
            onClick={() => setIssueKey(null)}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-surface-overlay-d dark:hover:text-slate-200 transition-colors"
            aria-label="Close modal"
          >
            <MdClose className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export { IssueDetailsHeader };
