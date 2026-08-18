import { type IssueType } from "@/utils/types";
import clsx from "clsx";
import { Draggable } from "react-beautiful-dnd";
import { IssueIcon } from "../issue/issue-icon";
import { Avatar } from "../avatar";
import { IssueDropdownMenu } from "../issue/issue-menu";
import { DropdownTrigger } from "../ui/dropdown-menu";
import { BsThreeDots } from "react-icons/bs";
import { isEpic } from "@/utils/helpers";
import { EpicName } from "../backlog/issue";
import { useSelectedIssueContext } from "@/context/use-selected-issue-context";
import { useCookie } from "@/hooks/use-cookie";

const Issue: React.FC<{ issue: IssueType; index: number }> = ({ issue, index }) => {
  const { setIssueKey } = useSelectedIssueContext();
  const user = useCookie("user");

  return (
    <Draggable draggableId={issue.id} index={index}>
      {({ innerRef, dragHandleProps, draggableProps }, { isDragging }) => (
        <div
          role="button"
          onClick={() => setIssueKey(issue.key)}
          ref={innerRef}
          {...draggableProps}
          {...dragHandleProps}
          className={clsx(
            "issue-card group my-1.5 max-w-full",
            isDragging && "rotate-1 scale-105 shadow-modal z-50 opacity-90"
          )}
        >
          {/* Issue name */}
          <div className="flex items-start justify-between gap-2">
            <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200 leading-snug line-clamp-2">
              {issue.name}
            </span>
            {(user?.role === "admin" || user?.role === "manager") && (
              <IssueDropdownMenu issue={issue}>
                <DropdownTrigger
                  asChild
                  className="rounded-md flex h-fit items-center gap-x-2 bg-opacity-30 px-1.5 text-xs font-semibold focus:ring-2"
                >
                  <div className="invisible shrink-0 rounded-lg px-1 py-1 text-slate-400 group-hover:visible hover:bg-slate-100 dark:hover:bg-surface-border-d hover:text-slate-600 dark:hover:text-slate-200 [&[data-state=open]]:visible [&[data-state=open]]:bg-slate-200 dark:[&[data-state=open]]:bg-surface-border-d transition-all duration-100">
                    <BsThreeDots className="h-3.5 w-3.5" />
                  </div>
                </DropdownTrigger>
              </IssueDropdownMenu>
            )}
          </div>

          {/* Epic label */}
          {isEpic(issue.parent) && (
            <div className="mt-1.5 w-fit">
              <EpicName issue={issue.parent} className="py-0.5 text-[11px]" />
            </div>
          )}

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IssueIcon issueType={issue.type} />
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                {issue.key}
              </span>
            </div>
            <Avatar
              size={20}
              src={issue.assignee?.avatar}
              alt={issue.assignee?.name ?? "Unassigned"}
            />
          </div>
        </div>
      )}
    </Draggable>
  );
};

export { Issue };
