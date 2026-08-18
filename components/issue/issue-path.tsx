"use client";

import React, { type ReactNode } from "react";
import { Button } from "../ui/button";
import { IssueSelectType } from "./issue-select-type";
import { type IssueType } from "@/utils/types";
import { IssueSelectEpic } from "./issue-select-epic";
import { toast } from "../toast";
import { IssueIcon } from "./issue-icon";
import { AiOutlinePlus } from "react-icons/ai";
import { isEpic } from "@/utils/helpers";
import { useIssues } from "@/hooks/query-hooks/use-issues";
import { TooltipWrapper } from "../ui/tooltip";
import { useIsAuthenticated } from "@/hooks/use-is-authed";
import { useRouter } from "next/navigation";
import { useCookie } from "@/hooks/use-cookie";

const IssuePath: React.FC<{
  issue: IssueType;
  setIssueKey: React.Dispatch<React.SetStateAction<string | null>>;
}> = ({ issue, setIssueKey }) => {
  if (isEpic(issue)) {
    return (
      <div className="flex items-center gap-1.5">
        <IssueIcon issueType={issue.type} />
        <TooltipWrapper text={`${issue.key}: ${issue.name}`} side="top">
          <IssueLink issue={issue} setIssueKey={setIssueKey} />
        </TooltipWrapper>
      </div>
    );
  }

  if (issue.parent && isEpic(issue.parent)) {
    return (
      <ParentContainer issue={issue} setIssueKey={setIssueKey}>
        <IssueSelectEpic issue={issue} key={issue.id}>
          <IssueIcon issueType={issue.parent.type} />
        </IssueSelectEpic>
      </ParentContainer>
    );
  }

  if (issue.parent) {
    return (
      <ParentContainer issue={issue} setIssueKey={setIssueKey}>
        <IssueIcon issueType={issue.parent.type} />
      </ParentContainer>
    );
  }

  return (
    <ParentContainer issue={issue} setIssueKey={setIssueKey}>
      <IssueSelectEpic issue={issue}>
        <AddEpic />
      </IssueSelectEpic>
    </ParentContainer>
  );
};

const ParentContainer: React.FC<{
  children: ReactNode;
  issue: IssueType;
  setIssueKey: React.Dispatch<React.SetStateAction<string | null>>;
}> = ({ children, issue, setIssueKey }) => {
  const { updateIssue } = useIssues();
  const [isAuthenticated, openAuthModal] = useIsAuthenticated();

  function handleSelectType(type: IssueType["type"]) {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    updateIssue(
      {
        issueId: issue.id,
        type,
      },
      {
        onSuccess: (data) => {
          toast.success({
            message: `Task type updated to ${data.type}`,
            description: "Type changed successfully",
          });
        },
      }
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
      <div className="flex items-center">
        {children}
        {issue.parent && (
          <IssueLink issue={issue.parent} setIssueKey={setIssueKey} />
        )}
      </div>
      <span className="text-slate-300 dark:text-surface-border-d">/</span>
      <div className="flex items-center gap-1">
        <IssueSelectType
          key={issue.id + issue.type}
          currentType={issue.type}
          onSelect={handleSelectType}
        />
        <TooltipWrapper text={`${issue.key}: ${issue.name}`} side="top">
          <IssueLink issue={issue} setIssueKey={setIssueKey} />
        </TooltipWrapper>
      </div>
    </div>
  );
};

const IssueLink = React.forwardRef<
  HTMLButtonElement,
  {
    issue: IssueType | IssueType["parent"] | null;
    setIssueKey: React.Dispatch<React.SetStateAction<string | null>>;
  }
>(({ issue, setIssueKey, ...props }, ref) => {
  const project = useCookie("project");
  const projectKey = project?.key;
  const router = useRouter();

  if (!issue) return <span />;

  return (
    <button
      ref={ref}
      {...props}
      onClick={() => {
        setIssueKey(issue?.key ?? null);
        if (projectKey && issue?.key) {
          router.push(`/${projectKey}/issue/${issue.key}`);
        }
      }}
      className="inline-flex items-center px-1.5 py-0.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-surface-overlay-d transition-colors"
    >
      <span>{issue?.key}</span>
    </button>
  );
});

IssueLink.displayName = "IssueLink";

const AddEpic: React.FC = () => {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 rounded-lg bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 px-2 py-0.5 text-xs font-semibold text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-500/20 transition-colors"
    >
      <AiOutlinePlus className="text-xs" />
      <span>Add Epic</span>
    </button>
  );
};

export { IssuePath };
