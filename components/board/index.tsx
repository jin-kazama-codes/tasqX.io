"use client";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { type IssueStatus } from "@prisma/client";
import "@/styles/split.css";
import { BoardHeader } from "./header";
import {
  DragDropContext,
  type DraggableLocation,
  type DropResult,
} from "react-beautiful-dnd";
import { useIssues } from "@/hooks/query-hooks/use-issues";
import { type IssueType } from "@/utils/types";
import {
  assigneeNotInFilters,
  epicNotInFilters,
  generatePastelColor,
  getPluralEnd,
  hasChildren,
  insertItemIntoArray,
  isEpic,
  isNullish,
  isSubtask,
  issueNotInSearch,
  issueSprintNotInFilters,
  issueTypeNotInFilters,
  moveItemWithinArray,
} from "@/utils/helpers";
import { IssueList } from "./issue-list";
import { IssueDetailsModal } from "../modals/board-issue-details";
import { useSprints } from "@/hooks/query-hooks/use-sprints";
import { useFiltersContext } from "@/context/use-filters-context";
import { useIsAuthenticated } from "@/hooks/use-is-authed";
import { useCookie } from "@/hooks/use-cookie";
import clsx from "clsx";
import { IssueIcon } from "../issue/issue-icon";
import { useSelectedIssueContext } from "@/context/use-selected-issue-context";
import { useWorkflow } from "@/hooks/query-hooks/use-workflow";
import { Container } from "../ui/container";
import Link from "next/link";
import { StartSprintModal } from "@/components/modals/start-sprint";
import {
  HiOutlineViewColumns,
  HiOutlineArrowRight,
  HiOutlinePlay,
} from "react-icons/hi2";
import { getProjectKeyFromUrl } from "@/utils/helpers";

const DEFAULT_STATUSES = ["TODO", "IN_PROGRESS", "DONE"];

const Board: React.FC = () => {
  const renderContainerRef = useRef<HTMLDivElement>(null);

  const { sprints, sprintsLoading } = useSprints();
  const { data: workflow, isLoading, isError } = useWorkflow();
  const [STATUSES, setStatuses] = useState<string[]>(DEFAULT_STATUSES);
  const [statusColors, setStatusColors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (workflow && workflow.nodes && workflow.nodes.length > 0) {
      const labels = workflow.nodes.map((node: any) => node.data.label);
      setStatuses(labels);
    } else {
      setStatuses(DEFAULT_STATUSES);
    }
  }, [workflow]);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const project = useCookie("project");

  useEffect(() => {
    const projectId = project?.id;
    if (!projectId) return;
    const storageKey = `statusColors-${projectId}`;
    const savedColors = localStorage.getItem(storageKey);
    const colorMap: Record<string, string> = savedColors
      ? JSON.parse(savedColors)
      : {};

    let needsUpdate = false;
    workflow?.nodes?.forEach((node: any) => {
      const statusLabel = node.data?.label;
      if (["TODO", "IN_PROGRESS", "DONE", "To Do", "In Progress", "Done"].includes(statusLabel)) return;
      if (!colorMap[statusLabel]) {
        colorMap[statusLabel] = generatePastelColor();
        needsUpdate = true;
      }
    });

    if (needsUpdate) {
      localStorage.setItem(storageKey, JSON.stringify(colorMap));
    }

    setStatusColors(colorMap);
  }, [workflow, project?.id]);

  const getStatusBackgroundColor = (status: string): string => {
    switch (status) {
      case "To Do":
        return "#d1d5db";
      case "In Progress":
        return "#93c5fd";
      case "Done":
        return "#86efac";
      default:
        return statusColors[status] || "#e5e7eb";
    }
  };

  const {
    search,
    assignees,
    issueTypes,
    epics,
    sprints: filterSprints,
  } = useFiltersContext();

  const projectKey = getProjectKeyFromUrl() || "SERA";
  const firstPendingSprint = sprints?.find((sprint) => sprint.status === "PENDING") || sprints?.[0];

  if (!sprints || sprints.length === 0) {
    return (
      <Container className="flex h-[75vh] w-full flex-col items-center justify-center p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 dark:bg-surface-raised-d border border-slate-200 dark:border-surface-border-d text-slate-400 mb-4 shadow-sm">
          <HiOutlineViewColumns className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          No Sprints Created
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1.5 mb-6 leading-relaxed">
          Create delivery sprints and schedule tasks in the Backlog to begin visualizing your project board.
        </p>
        <Link
          href={`/${projectKey}/backlog`}
          className="btn-brand py-2.5 px-5 text-xs font-semibold inline-flex items-center gap-2"
        >
          <span>Open Backlog</span>
          <HiOutlineArrowRight className="h-4 w-4" />
        </Link>
      </Container>
    );
  }

  const activeSprint = sprints?.find((sprint) => sprint.status === "ACTIVE");
  const fliteredSprint = sprints?.find(
    (sprint) => sprint.id === filterSprints[0]
  );

  if (!activeSprint) {
    return (
      <Container className="flex h-[75vh] w-full flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-5">
          <div className="absolute -inset-2 rounded-full bg-brand-500/20 blur-xl animate-pulse pointer-events-none" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-500/10 dark:bg-brand-500/20 border border-brand-500/20 text-brand-600 dark:text-brand-400 shadow-glow-sm">
            <HiOutlineViewColumns className="h-8 w-8" />
          </div>
        </div>

        <h3 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          No Active Sprint on Board
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-2 mb-6 leading-relaxed">
          Kanban boards visualize tasks for an active sprint cycle. Start a scheduled sprint or navigate to the Backlog to plan deliverables across workflow stages.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {firstPendingSprint && (user?.role === "admin" || user?.role === "manager") && (
            <StartSprintModal issueCount={0} sprint={firstPendingSprint}>
              <button className="btn-brand py-2.5 px-5 text-xs font-semibold inline-flex items-center gap-2 shadow-glow-sm hover:shadow-glow transition-all">
                <HiOutlinePlay className="h-4 w-4" />
                <span>Start {firstPendingSprint.name}</span>
              </button>
            </StartSprintModal>
          )}

          <Link
            href={`/${projectKey}/backlog`}
            className="btn-secondary py-2.5 px-5 text-xs font-semibold inline-flex items-center gap-2"
          >
            <span>Go to Backlog</span>
            <HiOutlineArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Container>
    );
  }

  const activeSprintId = filterSprints[0] ? filterSprints[0] : activeSprint.id;

  const filterIssues = useCallback(
    (issues: IssueType[] | undefined, status: string | null = null) => {
      if (!issues) return [];
      let filteredWithStatus = issues;
      if (status) {
        filteredWithStatus = issues.filter((issue) => issue.status === status);
      }
      const filteredIssues = filteredWithStatus.filter((issue) => {
        if (issue.sprintIsActive && !isEpic(issue) && !isSubtask(issue)) {
          if (issueNotInSearch({ issue, search })) return false;
          if (assigneeNotInFilters({ issue, assignees })) return false;
          if (epicNotInFilters({ issue, epics })) return false;
          if (issueTypeNotInFilters({ issue, issueTypes })) return false;
          if (issueSprintNotInFilters({ issue, sprintIds: filterSprints })) {
            return false;
          }

          return true;
        }
        return false;
      });
      return filteredIssues;
    },
    [search, assignees, epics, issueTypes, filterSprints]
  );

  const { updateIssue } = useIssues(activeSprintId);
  const [isAuthenticated, openAuthModal] = useIsAuthenticated();
  const [showChild, setShowChild] = useState(false);
  const { issues, issuesLoading } = useIssues(activeSprintId);

  useLayoutEffect(() => {
    if (!renderContainerRef.current) return;
    const calculatedHeight = renderContainerRef.current.offsetTop + 20;
    renderContainerRef.current.style.height = `calc(100vh - ${calculatedHeight}px)`;
  }, []);

  if (!issues || !sprints || !project) {
    return null;
  }

  if (issuesLoading || sprintsLoading) {
    return (
      <div className="flex gap-4 pt-4 overflow-x-auto animate-fade-in">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex flex-col w-[320px] shrink-0 rounded-2xl border border-slate-200/80 dark:border-surface-border-d bg-slate-50/70 dark:bg-surface-raised-d/60 p-3 space-y-3"
          >
            <div className="flex items-center justify-between pb-2">
              <div className="skeleton h-4 w-24 rounded-lg" />
              <div className="skeleton h-4 w-6 rounded-full" />
            </div>
            {[0, 1, 2].map((j) => (
              <div key={j} className="skeleton h-24 w-full rounded-xl" />
            ))}
          </div>
        ))}
      </div>
    );
  }
  // if (isError) {
  //   return <div>Error: {error?.message || "Failed to load data"}</div>;
  // }

  const onDragEnd = (result: DropResult, childIssues = []) => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    const { destination, source } = result;
    if (isNullish(destination) || isNullish(source)) return;

    updateIssue({
      issueId: result.draggableId,
      status: destination.droppableId as string,
      boardPosition: calculateIssueBoardPosition({
        activeIssues: showChild
          ? childIssues
          : issues.filter((issue) => issue.sprintIsActive),
        destination,
        source,
        droppedIssueId: result.draggableId,
      }),
    });
  };

  const { setIssueKey } = useSelectedIssueContext();

  const child = issues
    .filter(
      (issue) =>
        issue.sprintIsActive && issue.children && issue.children.length > 0
    )
    .flatMap((issue) => issue.children);

  return (
    <Fragment>
      <IssueDetailsModal />
      <BoardHeader
        showChild={showChild}
        setChild={setShowChild}
        project={project}
        activeSprint={fliteredSprint ? fliteredSprint : activeSprint}
      />

      {/* CHILD ISSUE VIEW  */}
      {showChild && (
        // STATUS
        <div
          className="custom-scrollbar relative flex h-[68vh]
         max-w-full flex-col gap-x-4 overflow-y-scroll "
        >
          <div className="sticky top-0 z-40 flex gap-x-4 bg-white dark:bg-darkSprint-0">
            {STATUSES.map((status) => {
              return (
                <>
                  <div
                    key={status}
                    className="h-max min-h-fit w-[350px] rounded-xl border-x-2 px-1.5"
                    style={{
                      backgroundColor: getStatusBackgroundColor(status),
                    }}
                  >
                    <h2
                      className={` text-md sticky top-0 z-10  -mx-1.5 mb-1.5 rounded-t-md   px-2 py-3 font-semibold text-black dark:border-y-darkSprint-30`}
                      style={{
                        backgroundColor: getStatusBackgroundColor(status),
                      }}
                    >
                      {status}{" "}
                      {showChild
                        ? child.filter(
                            (childIssue) => childIssue.status === status
                          ).length
                        : issues.filter(
                            (issue) =>
                              issue.sprintIsActive && issue.status === status
                          ).length}
                      {` ISSUE${getPluralEnd(issues).toUpperCase()}`}
                    </h2>
                  </div>
                </>
              );
            })}
          </div>
          {/* ISSUES - REPEAT */}
          <div className="mt-0 flex w-full max-w-full flex-col">
            {filterIssues(issues, null).map((issue, index) => {
              let childIssues = [];
              if (hasChildren(issue)) {
                childIssues = issue.children;
              }
              return (
                <>
                  <div
                    onClick={() => setIssueKey(issue.key)}
                    className="flex cursor-pointer items-center gap-x-4 border-x-2  border-y bg-slate-50 px-2 py-2 dark:border-darkSprint-20 dark:bg-darkSprint-30"
                  >
                    <IssueIcon issueType={issue.type} />
                    <span className="text-xs font-medium text-gray-600 dark:text-dark-50">
                      {issue.key}
                    </span>
                    <span className="dark:text-dark-50">{issue.name}</span>
                    <span className="dark:text-dark-50">
                      ({issue.children.length} Subtask)
                    </span>
                    <span className="rounded-xl bg-slate-300 px-3 text-sm">
                      Parent
                    </span>
                  </div>
                  <DragDropContext
                    key={index + 1}
                    onDragEnd={(result: DropResult) =>
                      onDragEnd(result, childIssues)
                    }
                  >
                    <div
                      ref={renderContainerRef}
                      className="relative flex w-full  max-w-full gap-x-4 overflow-y-auto"
                    >
                      {STATUSES.map((status) => (
                        <div
                          className={clsx(
                            " h-max min-h-fit w-[350px] rounded-xl border-x-2 border-b-2 px-1.5 pb-3 dark:border-darkSprint-30 dark:bg-darkSprint-20"
                          )}
                          key={status}
                        >
                          <IssueList
                            parentId={issue.id}
                            sprintId={activeSprintId}
                            key={`${issue.id}-${status}`}
                            status={status}
                            issues={childIssues?.filter(
                              (childIssue) => childIssue.status === status
                            )}
                            showChild={showChild}
                          />
                        </div>
                      ))}
                    </div>
                  </DragDropContext>
                </>
              );
            })}
          </div>
        </div>
      )}
      {/* PARENT ISSUE VIEW  */}
      {!showChild && (
        <DragDropContext onDragEnd={onDragEnd}>
          <div
            ref={renderContainerRef}
            className="custom-scrollbar relative flex h-[68vh] max-w-full gap-x-4 overflow-y-scroll "
          >
            {STATUSES.map((status) => (
              <IssueList
                statusColors={statusColors}
                sprintId={activeSprintId}
                key={status}
                status={status}
                issues={filterIssues(issues, status)}
                showChild={showChild}
              />
            ))}
          </div>
        </DragDropContext>
      )}
    </Fragment>
  );
};

type IssueListPositionProps = {
  activeIssues: IssueType[];
  destination: DraggableLocation;
  source: DraggableLocation;
  droppedIssueId: string;
};

function calculateIssueBoardPosition(props: IssueListPositionProps) {
  const { prevIssue, nextIssue } = getAfterDropPrevNextIssue(props);
  let position: number;

  if (isNullish(prevIssue) && isNullish(nextIssue)) {
    position = 1;
  } else if (isNullish(prevIssue) && nextIssue) {
    position = nextIssue.boardPosition - 1;
  } else if (isNullish(nextIssue) && prevIssue) {
    position = prevIssue.boardPosition + 1;
  } else if (prevIssue && nextIssue) {
    position =
      prevIssue.boardPosition +
      (nextIssue.boardPosition - prevIssue.boardPosition) / 2;
  } else {
    throw new Error("Invalid position");
  }
  return position;
}

function getAfterDropPrevNextIssue(props: IssueListPositionProps) {
  const { activeIssues, destination, source, droppedIssueId } = props;
  const beforeDropDestinationIssues = getSortedBoardIssues({
    activeIssues,
    status: destination.droppableId as string,
  });
  const droppedIssue = activeIssues.find(
    (issue) => issue.id === droppedIssueId
  );

  if (!droppedIssue) {
    throw new Error("dropped issue not found");
  }
  const isSameList = destination.droppableId === source.droppableId;

  const afterDropDestinationIssues = isSameList
    ? moveItemWithinArray(
        beforeDropDestinationIssues,
        droppedIssue,
        destination.index
      )
    : insertItemIntoArray(
        beforeDropDestinationIssues,
        droppedIssue,
        destination.index
      );

  return {
    prevIssue: afterDropDestinationIssues[destination.index - 1],
    nextIssue: afterDropDestinationIssues[destination.index + 1],
  };
}

function getSortedBoardIssues({
  activeIssues,
  status,
}: {
  activeIssues: IssueType[];
  status: string;
}) {
  return activeIssues
    .filter((issue) => issue.status === status)
    .sort((a, b) => a.boardPosition - b.boardPosition);
}

export { Board };
