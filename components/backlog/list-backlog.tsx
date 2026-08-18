"use client";
import { Fragment, useEffect, useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { IssueList } from "./issue-list";
import { IssueStatusCount } from "../issue/issue-status-count";
import { type IssueType } from "@/utils/types";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSprints } from "@/hooks/query-hooks/use-sprints";
import { useIsAuthenticated } from "@/hooks/use-is-authed";
import { useCookie } from "@/hooks/use-cookie";
import { useTimeEstimates } from "@/utils/getOriginalEstimate";
import Timelist from "./estimate-time-list";
import { useIssues } from "@/hooks/query-hooks/use-issues";
import { getPluralEnd } from "@/utils/helpers";

const BacklogList: React.FC<{
  id: string;
}> = ({ id }) => {
  const [openAccordion, setOpenAccordion] = useState("backlog");
  const { issues } = useIssues(openAccordion);

  // useEffect(() => {
  //   setOpenAccordion(`backlog`);
  // }, [id]);

  // if(issuesLoading){
  //   return <div>Loading...</div>
  // }
  const filteredIssues = issues?.filter((issue) => ["TASK", "STORY", "BUG"].includes(issue.type)) ?? [];
  return (
    <Accordion
      className="rounded-xl border-2 bg-slate-100 p-4 pb-2 dark:border-darkSprint-30 dark:bg-darkSprint-10"
      type="single"
      value={openAccordion}
      onValueChange={setOpenAccordion}
      collapsible
    >
      <AccordionItem value={`backlog`}>
        <BacklogListHeader issues={filteredIssues} />
        <IssueList sprintId={null} issues={filteredIssues} />
      </AccordionItem>
    </Accordion>
  );
};

const BacklogListHeader: React.FC<{ issues: IssueType[] }> = ({ issues }) => {
  const { createSprint } = useSprints();
  const [isAuthenticated, openAuthModal] = useIsAuthenticated();
  const user = useCookie("user");

  function handleCreateSprint() {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    createSprint();
  }

  const { convertedOriginalEstimate, convertedTotalTime } =
    useTimeEstimates(issues);

  return (
    <div className="flex w-full items-center justify-between text-sm ">
      <AccordionTrigger className="flex w-full items-center p-2  font-medium [&[data-state=open]>svg]:rotate-90">
        <Fragment>
          <FaChevronRight
            className="mr-2 text-xs text-black transition-transform dark:text-dark-50"
            aria-hidden
          />
          <div className="flex items-center gap-3">
            <div className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Backlog
            </div>
            <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-surface-overlay-d px-2 py-0.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
              {issues.length ? issues.length : 0} {issues.length === 1 ? "task" : "tasks"}
            </span>
            {convertedOriginalEstimate ? (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Est: <span className="font-bold text-slate-700 dark:text-slate-200">{convertedOriginalEstimate}</span>
              </span>
            ) : null}
          </div>
        </Fragment>
      </AccordionTrigger>
      <div className="flex items-center gap-x-2 py-2">
        <Timelist Time={convertedTotalTime} />
        {(user?.role === "admin" || user?.role === "manager") && (
          <button
            onClick={handleCreateSprint}
            className="flex items-center rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-brand-500 dark:hover:bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all duration-150"
          >
            <span className="whitespace-nowrap">Create Sprint</span>
          </button>
        )}
      </div>
    </div>
  );
};

export { BacklogList };
