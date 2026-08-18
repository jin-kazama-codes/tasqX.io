import React, { Fragment, useEffect, useState, useRef } from "react";
import { useIssues } from "@/hooks/query-hooks/use-issues";
import { Button } from "../ui/button";
import { MdCheck, MdClose } from "react-icons/md";
import { type IssueType } from "@/utils/types";
import { TooltipWrapper } from "../ui/tooltip";
import { useIsAuthenticated } from "@/hooks/use-is-authed";

type IssueTitleProps = {
  isEditing?: boolean;
  setIsEditing?: React.Dispatch<React.SetStateAction<boolean>>;
  issue: IssueType;
  className?: string;
  useTooltip?: boolean;
};

const IssueTitle = React.forwardRef<HTMLInputElement, IssueTitleProps>(
  (
    {
      isEditing: propIsEditing,
      setIsEditing: propSetIsEditing,
      issue,
      className,
      useTooltip,
    },
    forwardedRef
  ) => {
    const [internalIsEditing, setInternalIsEditing] = useState(false);
    const isEditing = propIsEditing !== undefined ? propIsEditing : internalIsEditing;
    const setIsEditing = propSetIsEditing || setInternalIsEditing;

    const [currentTitle, setCurrentTitle] = useState(issue.name);
    const localInputRef = useRef<HTMLInputElement>(null);
    const inputRef = (forwardedRef as React.RefObject<HTMLInputElement>) || localInputRef;

    useEffect(() => {
      setCurrentTitle(issue.name);
    }, [issue.name]);

    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isEditing, inputRef]);

    const { updateIssue } = useIssues(issue?.sprintId);
    const [isAuthenticated, openAuthModal] = useIsAuthenticated();

    function handleNameChange(e: React.SyntheticEvent) {
      e.stopPropagation();
      e.preventDefault();
      if (!isAuthenticated) {
        openAuthModal();
        return;
      }
      if (currentTitle.trim() && currentTitle !== issue.name) {
        updateIssue({
          issueId: issue.id,
          name: currentTitle.trim(),
        });
      }
      setIsEditing(false);
    }

    return (
      <Fragment>
        {isEditing ? (
          <div className="relative flex w-full">
            <label htmlFor="issue-title" className="sr-only">
              Task title
            </label>
            <input
              type="text"
              ref={inputRef}
              id="issue-title"
              value={currentTitle}
              onChange={(e) => setCurrentTitle(e.target.value)}
              className="w-full rounded-xl border border-brand-500 bg-white dark:bg-surface-overlay-d px-3 py-1.5 text-base font-bold text-slate-900 dark:text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleNameChange(e);
                }
                if (e.key === "Escape") {
                  setCurrentTitle(issue.name);
                  setIsEditing(false);
                }
              }}
            />
            <div className="absolute -bottom-10 right-0 z-10 flex gap-x-1">
              <Button
                className="mt-2 aspect-square rounded-full bg-slate-200 dark:bg-surface-border-d p-2 shadow-md transition-all hover:bg-slate-300"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentTitle(issue.name);
                  setIsEditing(false);
                }}
                customColors
                customPadding
              >
                <MdClose className="text-sm font-bold text-slate-700 dark:text-white" />
              </Button>
              <Button
                className="mt-2 aspect-square rounded-full bg-brand-500 p-2 shadow-md transition-all hover:bg-brand-600"
                onClick={handleNameChange}
                customColors
                customPadding
              >
                <MdCheck className="text-sm font-bold text-white" />
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="w-full overflow-x-hidden cursor-pointer rounded-xl px-1.5 py-0.5 hover:bg-slate-100 dark:hover:bg-surface-overlay-d transition-colors"
            onClick={() => setIsEditing(true)}
          >
            {useTooltip ? (
              <TooltipWrapper text={currentTitle}>
                <p className={className}>{currentTitle}</p>
              </TooltipWrapper>
            ) : (
              <p className={className}>{currentTitle}</p>
            )}
          </div>
        )}
      </Fragment>
    );
  }
);

IssueTitle.displayName = "IssueTitle";

export { IssueTitle };
