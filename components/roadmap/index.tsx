"use client";

import React, { Fragment, useRef } from "react";
import { useSelectedIssueContext } from "@/context/use-selected-issue-context";
import "@/styles/split.css";
import { RoadmapHeader } from "./header";
import Split from "react-split";
import { IssueDetails } from "../issue/issue-details";
import { notFound } from "next/navigation";
import { EpicsTable } from "./epics-table";
import { useCookie } from "@/hooks/use-cookie";

const Roadmap: React.FC = () => {
  const { issueKey } = useSelectedIssueContext();
  const project = useCookie("project");

  if (!project) {
    return notFound();
  }

  return (
    <div className="flex h-full flex-col space-y-4">
      <RoadmapHeader project={project} />

      <div className="flex-1 w-full h-[calc(100vh-160px)] min-h-[500px]">
        <Split
          sizes={issueKey ? [62, 38] : [100, 0]}
          gutterSize={issueKey ? 6 : 0}
          className="flex h-full w-full gap-3 overflow-hidden"
          minSize={issueKey ? 380 : 0}
        >
          <div className="h-full overflow-hidden flex-1">
            <EpicsTable />
          </div>
          {issueKey ? (
            <div className="h-full overflow-y-auto">
              <IssueDetails roadmap={true} issueKey={issueKey} />
            </div>
          ) : (
            <div />
          )}
        </Split>
      </div>
    </div>
  );
};

export { Roadmap };
