"use client";
import { useEffect, useState } from "react";
import { useIssues } from "@/hooks/query-hooks/use-issues";
import { Droppable } from "react-beautiful-dnd";
import { AccordionContent } from "../ui/accordion";
import { Issue } from "./issue";
import { Button } from "../ui/button";
import { AiOutlinePlus } from "react-icons/ai";
import { EmtpyIssue } from "../issue/issue-empty";
import { type IssueType } from "@/utils/types";
import clsx from "clsx";
import { useStrictModeDroppable } from "@/hooks/use-strictmode-droppable";
import { useIsAuthenticated } from "@/hooks/use-is-authed";

const IssueList: React.FC<{ sprintId: string | null; issues: IssueType[] }> = ({
  sprintId,
  issues,
}) => {
  const { createIssue, isCreating } = useIssues(sprintId);
  const [isEditing, setIsEditing] = useState(false);
  const [droppableEnabled] = useStrictModeDroppable();
  const [checkedIssue, setCheckedIssue] = useState<string[]>([]);
  const [isAuthenticated, openAuthModal] = useIsAuthenticated();

  // Clear localStorage and set checkedIssue on mount
  useEffect(() => {
    localStorage.removeItem("Selected Issue");
    setCheckedIssue([]);
  }, []);

  // Function to handle issue creation
  function handleCreateIssue({
    name,
    type,
  }: {
    name: string;
    type: IssueType["type"];
  }) {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    if (!name) {
      return;
    }

    createIssue(
      {
        name,
        type,
        parentId: null,
        sprintId,
        reporterId: null,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  }

  // Handle checking issues
  const handleCheck = (issueId: string) => {
    setCheckedIssue((prevCheckedIssue) => {
      const updatedCheckedIssue = prevCheckedIssue.includes(issueId)
        ? prevCheckedIssue.filter((id) => id !== issueId)
        : [...prevCheckedIssue, issueId];

      let storageIssues: string[] = JSON.parse(
        localStorage.getItem("Selected Issue") || "[]"
      );

      // Update local storage on check/uncheck of issue
      if (updatedCheckedIssue.includes(issueId)) {
        if (!storageIssues.includes(issueId)) {
          storageIssues.push(issueId);
        }
      } else {
        // on uncheck
        const index = storageIssues.indexOf(issueId);
        if (index > -1) {
          storageIssues.splice(index, 1);
        }
      }

      localStorage.setItem("Selected Issue", JSON.stringify(storageIssues));

      return updatedCheckedIssue;
    });
  };

  if (!droppableEnabled) {
    return null;
  }

  return (
    <AccordionContent className="pt-2">
      <Droppable droppableId={sprintId ?? "backlog"}>
        {({ droppableProps, innerRef, placeholder }) => (
          <div
            {...droppableProps}
            ref={innerRef}
            className={clsx(issues.length === 0 && "min-h-[1px]")}
          >
            <div
              className={clsx(
                issues.length &&
                  "flex flex-col gap-1 divide-y rounded-xl bg-transparent text-gray-800"
              )}
            >
              {issues
                .sort((a, b) => a.sprintPosition - b.sprintPosition)
                .map((issue, index) => (
                  <Issue
                    onChecked={checkedIssue.includes(issue.id)}
                    onHandleCheck={() => handleCheck(issue.id)}
                    key={issue.id}
                    index={index}
                    issue={issue}
                  />
                ))}
            </div>
            {placeholder}
          </div>
        )}
      </Droppable>
      <Button
        onClick={() => setIsEditing(true)}
        data-state={isEditing ? "closed" : "open"}
        customColors
        className="my-1 flex w-full rounded-xl bg-transparent hover:bg-gray-200 dark:text-dark-50 dark:hover:bg-darkSprint-40 dark:hover:text-white [&[data-state=closed]]:hidden"
      >
        <AiOutlinePlus className="text-sm" />
        <span className="text-md ml-1">Create Task</span>
      </Button>
      <EmtpyIssue
        data-state={isEditing ? "open" : "closed"}
        className="[&[data-state=closed]]:hidden"
        onCreate={({ name, type }) => handleCreateIssue({ name, type })}
        onCancel={() => setIsEditing(false)}
        isCreating={isCreating}
      />
    </AccordionContent>
  );
};

export { IssueList };
